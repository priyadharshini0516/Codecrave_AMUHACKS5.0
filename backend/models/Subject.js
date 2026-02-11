const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    trim: true,
  },
  topics: [
    {
      name: {
        type: String,
        required: true,
      },
      difficulty: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      estimatedHours: {
        type: Number,
        required: true,
        min: 0.5,
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
  deadline: {
    type: Date,
    required: [true, 'Please add a deadline'],
  },
  examDate: {
    type: Date,
  },
  priority: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subject', SubjectSchema);
