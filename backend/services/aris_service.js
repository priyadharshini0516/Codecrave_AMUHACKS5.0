const User = require('../models/User');
const Subject = require('../models/Subject');
const DailyLog = require('../models/DailyLog');
const RecoveryModel = require('../models/RecoveryModel');
const RiskScore = require('../models/RiskScore');
const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

exports.triggerRecalculation = async (userId) => {
    try {
        const user = await User.findById(userId);
        const subjects = await Subject.find({ user: userId });
        const last7Logs = await DailyLog.find({ user: userId }).sort({ date: -1 }).limit(7);

        if (subjects.length === 0) return null;

        // 1. Priority
        const tasksInput = subjects.map(s => ({
            id: s._id,
            subject_name: s.name,
            exam_importance: s.importance || 5,
            days_left: Math.max(1, Math.round((new Date(s.deadline) - new Date()) / (1000 * 60 * 60 * 24))),
            backlog_ratio: (s.total_topics - s.completed_topics) / (s.total_topics || 1),
            stress_level: user.stressLevel || 5
        }));
        const priorityRes = await axios.post(`${AI_ENGINE_URL}/ai/prioritize`, { tasks: tasksInput });

        // 2. Risk
        const totalTopics = subjects.reduce((sum, s) => sum + s.total_topics, 0);
        const completedTopics = subjects.reduce((sum, s) => sum + s.completed_topics, 0);
        const missedRate = last7Logs.length > 0 ? last7Logs.reduce((sum, l) => sum + l.missed_sessions, 0) / (last7Logs.length * 5) : 0;
        const riskInput = {
            completion_percentage: completedTopics / (totalTopics || 1),
            days_remaining: Math.max(1, Math.round((new Date(Math.min(...subjects.map(s => new Date(s.deadline)))) - new Date()) / (1000 * 60 * 60 * 24))),
            missed_tasks_ratio: missedRate,
            stress_level: user.stressLevel || 5,
            consistency_score: user.consistency_score || 0.5
        };
        const riskRes = await axios.post(`${AI_ENGINE_URL}/ai/predict-risk`, riskInput);

        // 3. Burnout
        const burnoutInput = {
            stress_level: user.stressLevel || 5,
            low_sleep_penalty: user.lowSleep ? 1 : 0,
            missed_tasks_ratio: missedRate
        };
        const burnoutRes = await axios.post(`${AI_ENGINE_URL}/ai/calculate-burnout`, burnoutInput);

        // 4. Optimize
        const optRes = await axios.post(`${AI_ENGINE_URL}/ai/optimize-plan`, {
            sorted_tasks: priorityRes.data.tasks,
            burnout_data: burnoutRes.data.data,
            available_days: 7,
            max_daily_hours: user.dailyAvailableHours || 6
        });

        // Save
        const riskData = riskRes.data.assessment;
        await RiskScore.create({
            user: userId,
            probability_score: riskData.probability_score,
            risk_level: riskData.risk_level,
            confidence: riskData.confidence
        });

        await RecoveryModel.findOneAndUpdate(
            { user: userId },
            {
                risk_score: riskData.probability_score * 100,
                burnout_level: burnoutRes.data.data.classification,
                recovery_path: optRes.data.data,
                last_updated: Date.now()
            },
            { upsert: true }
        );

        return { risk: riskData, burnout: burnoutRes.data.data, plan: optRes.data.data };
    } catch (error) {
        console.error('ARIS Auto-Recalculate error:', error.message);
        return null;
    }
};
