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

        const riskData = riskEngine.calculateARS({
            pendingTopics: totalTopics - completedTopics,
            totalTopics: totalTopics || 1,
            daysRemaining,
            stressLevel: user.stressLevel || 5,
            completionRate: user.consistency_score || 0
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

        const simResult = simulationEngine.simulateRecovery({
            pendingTopics: totalPending,
            avgTimePerTopic: 3, // Standard estimate
            remainingDays: daysRemaining,
            dailyHours: user.dailyAvailableHours || 6,
            consistencyFactor: user.consistency_score || 0.5
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

        if (subjects.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const schedule = optimizationEngine.optimizeSchedule(subjects, {
            availableDailyHours: user.dailyAvailableHours || 6,
            stressLevel: user.stressLevel || 5
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
