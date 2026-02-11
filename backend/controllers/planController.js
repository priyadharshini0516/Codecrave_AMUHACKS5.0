const RecoveryPlan = require('../models/RecoveryPlan');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Generate recovery plan
// @route   POST /api/plans/generate
// @access  Private
exports.generatePlan = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subjects = await Subject.find({ user: req.user.id });

        if (subjects.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No subjects found. Please add subjects first.',
            });
        }

        // Calculate priorities for all subjects
        const prioritizedSubjects = calculatePriorities(subjects);

        // Generate schedule based on stress level and available hours
        const schedule = generateSchedule(
            prioritizedSubjects,
            user.stressLevel,
            user.dailyAvailableHours
        );

        // Mark any existing active plans as outdated
        await RecoveryPlan.updateMany(
            { user: req.user.id, status: 'active' },
            { status: 'outdated' }
        );

        // Create new recovery plan
        const plan = await RecoveryPlan.create({
            user: req.user.id,
            startDate: new Date(),
            endDate: schedule[schedule.length - 1].date,
            schedule,
            status: 'active',
        });

        const populatedPlan = await RecoveryPlan.findById(plan._id).populate(
            'schedule.sessions.subject'
        );

        res.status(201).json({
            success: true,
            data: populatedPlan,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get active recovery plan
// @route   GET /api/plans/active
// @access  Private
exports.getActivePlan = async (req, res) => {
    try {
        const plan = await RecoveryPlan.findOne({
            user: req.user.id,
            status: 'active',
        }).populate('schedule.sessions.subject');

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'No active plan found',
            });
        }

        res.status(200).json({
            success: true,
            data: plan,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Mark session as completed
// @route   PUT /api/plans/:planId/sessions/:sessionId/complete
// @access  Private
exports.markSessionComplete = async (req, res) => {
    try {
        const plan = await RecoveryPlan.findById(req.params.planId);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found',
            });
        }

        if (plan.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
        }

        // Find and update the session
        let sessionFound = false;
        for (let day of plan.schedule) {
            const session = day.sessions.id(req.params.sessionId);
            if (session) {
                session.completed = true;
                session.completedAt = Date.now();
                sessionFound = true;
                break;
            }
        }

        if (!sessionFound) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
            });
        }

        await plan.save();

        res.status(200).json({
            success: true,
            data: plan,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Regenerate plan (adaptive re-planning)
// @route   POST /api/plans/regenerate
// @access  Private
exports.regeneratePlan = async (req, res) => {
    try {
        // This will trigger the same logic as generate but considers completed tasks
        const user = await User.findById(req.user.id);
        const subjects = await Subject.find({ user: req.user.id });

        // Filter out completed topics
        const incompleteSubjects = subjects.map((subject) => {
            const incompleteTopics = subject.topics.filter((topic) => !topic.completed);
            return {
                ...subject.toObject(),
                topics: incompleteTopics,
            };
        }).filter((subject) => subject.topics.length > 0);

        if (incompleteSubjects.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'All topics completed! No plan needed.',
            });
        }

        const prioritizedSubjects = calculatePriorities(incompleteSubjects);
        const schedule = generateSchedule(
            prioritizedSubjects,
            user.stressLevel,
            user.dailyAvailableHours
        );

        await RecoveryPlan.updateMany(
            { user: req.user.id, status: 'active' },
            { status: 'outdated' }
        );

        const plan = await RecoveryPlan.create({
            user: req.user.id,
            startDate: new Date(),
            endDate: schedule[schedule.length - 1].date,
            schedule,
            status: 'active',
        });

        const populatedPlan = await RecoveryPlan.findById(plan._id).populate(
            'schedule.sessions.subject'
        );

        res.status(201).json({
            success: true,
            data: populatedPlan,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Helper: Calculate priority scores
function calculatePriorities(subjects) {
    const now = new Date();

    return subjects.map((subject) => {
        const daysUntilDeadline = Math.ceil(
            (new Date(subject.deadline) - now) / (1000 * 60 * 60 * 24)
        );

        // Urgency: higher score for closer deadlines
        const urgencyScore = Math.max(1, 100 - daysUntilDeadline * 2);

        // Difficulty: average difficulty of topics
        const avgDifficulty =
            subject.topics.reduce((sum, topic) => sum + topic.difficulty, 0) /
            subject.topics.length;

        // Priority = urgency * difficulty weight
        const priority = urgencyScore * (1 + avgDifficulty / 10);

        return {
            ...subject,
            priority,
            urgencyScore,
            avgDifficulty,
        };
    }).sort((a, b) => b.priority - a.priority);
}

// Helper: Generate schedule with stress-aware load balancing
function generateSchedule(subjects, stressLevel, dailyAvailableHours) {
    const schedule = [];
    const currentDate = new Date();

    // Stress modifier: reduce daily capacity based on stress (1-10 scale)
    const stressModifier = 1 - (stressLevel - 1) / 20; // 5% reduction per stress point
    const effectiveDailyHours = dailyAvailableHours * stressModifier;

    // Flatten all topics with their subject info
    const allTasks = [];
    subjects.forEach((subject) => {
        subject.topics.forEach((topic) => {
            allTasks.push({
                subjectId: subject._id,
                subjectName: subject.name,
                topicName: topic.name,
                difficulty: topic.difficulty,
                estimatedHours: topic.estimatedHours,
                priority: subject.priority,
            });
        });
    });

    // Sort tasks by priority
    allTasks.sort((a, b) => b.priority - a.priority);

    let dayIndex = 0;
    let taskIndex = 0;

    while (taskIndex < allTasks.length) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + dayIndex);

        const sessions = [];
        let dailyHoursUsed = 0;
        let sessionStartHour = 9; // Start at 9 AM

        while (
            dailyHoursUsed < effectiveDailyHours &&
            taskIndex < allTasks.length
        ) {
            const task = allTasks[taskIndex];
            const sessionDuration = Math.min(
                task.estimatedHours,
                effectiveDailyHours - dailyHoursUsed,
                2 // Max 2 hours per session
            );

            if (sessionDuration < 0.5) break; // Minimum 30 min session

            const startTime = `${String(sessionStartHour).padStart(2, '0')}:00`;
            const endHour = sessionStartHour + sessionDuration;
            const endTime = `${String(Math.floor(endHour)).padStart(2, '0')}:${endHour % 1 === 0.5 ? '30' : '00'
                }`;

            sessions.push({
                subject: task.subjectId,
                topic: task.topicName,
                startTime,
                endTime,
                duration: sessionDuration,
                completed: false,
            });

            dailyHoursUsed += sessionDuration;
            sessionStartHour = endHour + 0.5; // 30 min break

            // If task is fully allocated, move to next task
            task.estimatedHours -= sessionDuration;
            if (task.estimatedHours <= 0) {
                taskIndex++;
            }
        }

        if (sessions.length > 0) {
            schedule.push({
                date,
                sessions,
            });
        }

        dayIndex++;

        // Safety limit: max 30 days
        if (dayIndex > 30) break;
    }

    return schedule;
}
