const mongoose = require('mongoose');

const StressLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stress_level: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    sleep_quality: {
        type: Number, // 1-10
        default: 5
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StressLog', StressLogSchema);
