const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    planned_hours: {
        type: Number,
        required: true,
    },
    completed_hours: {
        type: Number,
        default: 0,
    },
    stress_level: {
        type: Number,
        min: 1,
        max: 10,
    },
    missed_sessions: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('DailyLog', DailyLogSchema);
