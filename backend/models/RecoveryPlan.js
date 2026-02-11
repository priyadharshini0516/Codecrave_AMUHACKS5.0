const mongoose = require('mongoose');

const RecoveryPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  schedule: [
    {
      date: {
        type: Date,
        required: true,
      },
      sessions: [
        {
          subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
          },
          topic: {
            type: String,
            required: true,
          },
          startTime: {
            type: String,
            required: true,
          },
          endTime: {
            type: String,
            required: true,
          },
          duration: {
            type: Number,
            required: true,
          },
          completed: {
            type: Boolean,
            default: false,
          },
          completedAt: {
            type: Date,
          },
        },
      ],
    },
  ],
  status: {
    type: String,
    enum: ['active', 'completed', 'outdated'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RecoveryPlan', RecoveryPlanSchema);
