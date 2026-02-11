const User = require('../models/User');
const Subject = require('../models/Subject');
const DailyLog = require('../models/DailyLog');
const RecoveryModel = require('../models/RecoveryModel');

// Import Engines
const riskEngine = require('../engines/riskEngine');
const simulationEngine = require('../engines/simulationEngine');
const optimizationEngine = require('../engines/optimizationEngine');
const adaptationEngine = require('../engines/adaptationEngine');
const gpsEngine = require('../engines/gpsEngine');

// @desc    Calculate Academic Risk Score
// @route   POST /api/aris/calculate-risk
// @access  Private
exports.calculateRisk = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subjects = await Subject.find({ user: req.user.id });

        const totalTopics = subjects.reduce((sum, s) => sum + s.total_topics, 0);
        const completedTopics = subjects.reduce((sum, s) => sum + s.completed_topics, 0);

        // Find closest deadline
        const closestDeadline = new Date(Math.min(...subjects.map(s => new Date(s.deadline))));
        const daysRemaining = Math.max(1, (closestDeadline - new Date()) / (1000 * 60 * 60 * 24));

        const riskData = riskEngine.calculateARS({
            pendingTopics: totalTopics - completedTopics,
            totalTopics: totalTopics || 1,
            daysRemaining,
            stressLevel: user.stressLevel,
            completionRate: user.consistency_score
        });

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

        const totalPending = subjects.reduce((sum, s) => sum + (s.total_topics - s.completed_topics), 0);
        const closestDeadline = new Date(Math.min(...subjects.map(s => new Date(s.deadline))));
        const daysRemaining = Math.max(1, (closestDeadline - new Date()) / (1000 * 60 * 60 * 24));

        const simResult = simulationEngine.simulateRecovery({
            pendingTopics: totalPending,
            avgTimePerTopic: 3, // Standard estimate
            remainingDays: daysRemaining,
            dailyHours: user.dailyAvailableHours,
            consistencyFactor: user.consistency_score
        });

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

        const schedule = optimizationEngine.optimizeSchedule(subjects, {
            availableDailyHours: user.dailyAvailableHours,
            stressLevel: user.stressLevel
        });

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

        const missedRate = logs.length > 0 ? logs.reduce((sum, l) => sum + l.missed_sessions, 0) / logs.length / 5 : 0;

        const adaptations = adaptationEngine.detectAndAdapt(user, {
            missed_sessions_rate: missedRate,
            completion_speed: user.consistency_score > 0 ? 1.1 : 0.8
        });

        res.status(200).json({ success: true, data: adaptations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Academic GPS Path
// @route   GET /api/aris/recovery-path
// @access  Private
exports.getRecoveryPath = async (req, res) => {
    try {
        const recoveryData = await RecoveryModel.findOne({ user: req.user.id });
        res.status(200).json({ success: true, data: recoveryData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
