const User = require('../models/User');
const Subject = require('../models/Subject');
const DailyLog = require('../models/DailyLog');
const RecoveryModel = require('../models/RecoveryModel');
const RiskScore = require('../models/RiskScore');
const StressLog = require('../models/StressLog');
const axios = require('axios');

// Import Engines (kept as fallback)
const riskEngine = require('../engines/riskEngine');
const simulationEngine = require('../engines/simulationEngine');
const optimizationEngine = require('../engines/optimizationEngine');
const adaptationEngine = require('../engines/adaptationEngine');
const gpsEngine = require('../engines/gpsEngine');
const aiSystem = require('../utils/aiSystem');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// @desc    Calculate Academic Risk Score
// @route   POST /api/aris/calculate-risk
// @access  Private
exports.calculateRisk = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subjects = await Subject.find({ user: req.user.id });

        if (subjects.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    score: 0,
                    level: 'Low',
                    breakdown: {
                        backlogFactor: 0,
                        urgencyFactor: 0,
                        stressFactor: 0,
                        trendFactor: 0
                    }
                }
            });
        }

        const totalTopics = subjects.reduce((sum, s) => sum + s.total_topics, 0);
        const completedTopics = subjects.reduce((sum, s) => sum + s.completed_topics, 0);

        // Find closest deadline
        const validDeadlines = subjects.map(s => new Date(s.deadline)).filter(d => !isNaN(d.getTime()));
        const closestDeadline = validDeadlines.length > 0 ? new Date(Math.min(...validDeadlines)) : new Date();
        const daysRemaining = Math.max(1, (closestDeadline - new Date()) / (1000 * 60 * 60 * 24));

        const riskInput = {
            backlog_ratio: (totalTopics - completedTopics) / (totalTopics || 1),
            stress_level: user.stressLevel || 5,
            completion_rate: user.consistency_score || 0,
            days_remaining: Math.round(daysRemaining)
        };

        let riskData;
        try {
            const aiResponse = await axios.post(`${AI_ENGINE_URL}/ai/predict-risk`, riskInput);
            const assessment = aiResponse.data.assessment;

            // Map AI response to the expected format
            riskData = {
                score: assessment.raw_score * 33 + 10, // Approximate score for UI
                level: assessment.risk_level,
                breakdown: {
                    backlogFactor: riskInput.backlog_ratio * 10,
                    urgencyFactor: (1 / daysRemaining) * 10,
                    stressFactor: riskInput.stress_level,
                    trendFactor: riskInput.completion_rate * 10
                },
                isAI: true
            };
        } catch (aiError) {
            console.error('AI Risk Assessment failed, falling back to JS engine:', aiError.message);
            riskData = riskEngine.calculateARS({
                pendingTopics: totalTopics - completedTopics,
                totalTopics: totalTopics || 1,
                daysRemaining,
                stressLevel: user.stressLevel || 5,
                completionRate: user.consistency_score || 0
            });
        }

        // Store result in RecoveryModel
        await RecoveryModel.findOneAndUpdate(
            { user: req.user.id },
            {
                risk_score: riskData.score,
                $push: { risk_history: { score: riskData.score } },
                last_updated: Date.now()
            },
            { upsert: true }
        );

        res.status(200).json({ success: true, data: riskData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Simulate Syllabus Completion Probability
// @route   POST /api/aris/simulate-recovery
// @access  Private
exports.simulateRecovery = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subjects = await Subject.find({ user: req.user.id });

        if (subjects.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    completionProbability: 0,
                    requiredHours: 0,
                    availableProductiveHours: 0,
                    expectedCompletionDate: new Date(),
                    isAtRisk: true
                }
            });
        }

        const totalPending = subjects.reduce((sum, s) => sum + (s.total_topics - s.completed_topics), 0);
        const validDeadlines = subjects.map(s => new Date(s.deadline)).filter(d => !isNaN(d.getTime()));
        const closestDeadline = validDeadlines.length > 0 ? new Date(Math.min(...validDeadlines)) : new Date();
        const daysRemaining = Math.max(1, (closestDeadline - new Date()) / (1000 * 60 * 60 * 24));

        const simInput = {
            pendingTopics: totalPending,
            avgTimePerTopic: 3,
            remainingDays: Math.round(daysRemaining),
            dailyHours: user.dailyAvailableHours || 6,
            consistencyFactor: user.consistency_score || 0.5
        };

        let simResult;
        try {
            const aiResponse = await axios.post(`${AI_ENGINE_URL}/ai/simulate-recovery`, simInput);
            simResult = aiResponse.data.data;
            simResult.isAI = true;
        } catch (aiError) {
            console.error('AI Simulation failed, falling back to JS engine:', aiError.message);
            simResult = simulationEngine.simulateRecovery({
                pendingTopics: totalPending,
                avgTimePerTopic: 3,
                remainingDays: daysRemaining,
                dailyHours: user.dailyAvailableHours || 6,
                consistencyFactor: user.consistency_score || 0.5
            });
        }

        await RecoveryModel.findOneAndUpdate(
            { user: req.user.id },
            { completion_probability: simResult.completionProbability },
            { upsert: true }
        );

        res.status(200).json({ success: true, data: simResult });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Optimized Schedule
// @route   POST /api/aris/optimize-schedule
// @access  Private
exports.optimizeSchedule = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subjects = await Subject.find({ user: req.user.id });

        if (subjects.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        let schedule;
        try {
            const aiInput = {
                tasks: subjects.map(s => ({
                    id: s._id,
                    subject_name: s.name,
                    exam_importance: s.importance || 5,
                    days_left: Math.max(1, Math.round((new Date(s.deadline) - new Date()) / (1000 * 60 * 60 * 24))),
                    backlog_ratio: (s.total_topics - s.completed_topics) / (s.total_topics || 1),
                    stress_level: user.stressLevel || 5
                }))
            };

            const aiResponse = await axios.post(`${AI_ENGINE_URL}/ai/prioritize`, aiInput);
            schedule = aiResponse.data.tasks;
        } catch (aiError) {
            console.error('AI Optimization failed, falling back to JS engine:', aiError.message);
            schedule = optimizationEngine.optimizeSchedule(subjects, {
                availableDailyHours: user.dailyAvailableHours || 6,
                stressLevel: user.stressLevel || 5
            });
        }

        await RecoveryModel.findOneAndUpdate(
            { user: req.user.id },
            { recovery_path: schedule },
            { upsert: true }
        );

        res.status(200).json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Trigger Adaptive Recalculation
// @route   POST /api/aris/adaptive-recalculate
// @access  Private
exports.adaptiveRecalculate = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const logs = await DailyLog.find({ user: req.user.id }).sort({ date: -1 }).limit(7);

        if (logs.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    recommendations: ['Keep going! Add your first daily log to get adaptive insights.'],
                    adjustments: { dailyHours: user.dailyAvailableHours || 6 }
                }
            });
        }

        const missedRate = logs.reduce((sum, l) => sum + l.missed_sessions, 0) / logs.length / 5;

        let adaptations;
        try {
            const aiInput = {
                user_data: {
                    stress_level: user.stressLevel || 5,
                    consistency_score: user.consistency_score || 0
                },
                behavior_data: {
                    missed_sessions_rate: missedRate,
                    completion_speed: user.consistency_score > 0 ? 1.1 : 0.8
                }
            };
            const aiResponse = await axios.post(`${AI_ENGINE_URL}/ai/detect-adaptations`, aiInput);
            adaptations = aiResponse.data.data;
        } catch (aiError) {
            console.error('AI Adaptation failed, falling back to JS engine:', aiError.message);
            adaptations = adaptationEngine.detectAndAdapt(user, {
                missed_sessions_rate: missedRate,
                completion_speed: user.consistency_score > 0 ? 1.1 : 0.8
            });
        }

        res.status(200).json({ success: true, data: adaptations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const arisService = require('../services/aris_service');

// @desc    Recalculate Full Adaptive Plan
// @route   POST /api/aris/recalculate-plan
// @access  Private
exports.recalculatePlan = async (req, res) => {
    try {
        const result = await arisService.triggerRecalculation(req.user.id);
        if (!result) {
            return res.status(400).json({ success: false, message: 'Could not recalculate plan.' });
        }
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Log Stress Level and Trigger Recalculation
// @route   POST /api/aris/log-stress
// @access  Private
exports.logStress = async (req, res) => {
    try {
        const { stressLevel, sleepQuality } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.stressLevel = stressLevel;
        if (sleepQuality) user.lowSleep = sleepQuality < 5;
        await user.save();

        await StressLog.create({
            user: req.user.id,
            stress_level: stressLevel,
            sleep_quality: sleepQuality || 5
        });

        // Trigger Recalculation
        const result = await arisService.triggerRecalculation(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Stress logged and plan recalculated.',
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Academic GPS Path
exports.getRecoveryPath = async (req, res) => {
    try {
        const recoveryData = await RecoveryModel.findOne({ user: req.user.id });
        res.status(200).json({ success: true, data: recoveryData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const validDeadlines = subjects.map(s => new Date(s.deadline)).filter(d => !isNaN(d.getTime()));
const closestDeadline = validDeadlines.length > 0 ? new Date(Math.min(...validDeadlines)) : new Date();
const daysRemaining = Math.max(0, (closestDeadline - new Date()) / (1000 * 60 * 60 * 24));

const insight = await aiSystem.generateStudyInsight({
    subjects: subjects.map(s => ({ name: s.name, progress: `${s.completed_topics}/${s.total_topics}` })),
    stressLevel: user.stressLevel || 5,
    completionRate,
    daysRemaining
});

res.status(200).json({
    success: true,
    data: insight
});
    } catch (error) {
    console.error('AI Insight Error:', error);
    res.status(500).json({ success: false, message: error.message });
}
};
