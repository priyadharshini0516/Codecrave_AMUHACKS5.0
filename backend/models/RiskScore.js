const mongoose = require('mongoose');

const RiskScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    probability_score: {
        type: Number,
        required: true
    },
    risk_level: {
        type: String,
        enum: ['Low', 'Moderate', 'High'],
        required: true
    },
    confidence: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RiskScore', RiskScoreSchema);
