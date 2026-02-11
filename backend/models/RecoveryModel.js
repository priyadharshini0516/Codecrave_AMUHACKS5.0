const mongoose = require('mongoose');

const RecoveryModelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    risk_score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    completion_probability: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    recovery_path: {
        type: mongoose.Schema.Types.Mixed, // Stores the optimized path/graph data
    },
    risk_history: [
        {
            score: Number,
            date: { type: Date, default: Date.now }
        }
    ],
    last_updated: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('RecoveryModel', RecoveryModelSchema);
