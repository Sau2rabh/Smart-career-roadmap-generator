const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [
      {
        id: { type: String, required: true },
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ['behavioral', 'technical', 'situational', 'coding'],
          default: 'technical',
        },
        hint: { type: String, default: '' },
      },
    ],
    answers: [
      {
        questionId: { type: String, required: true },
        userAnswer: { type: String, default: '' },
        aiFeedback: { type: String, default: '' },
        score: { type: Number, min: 0, max: 10, default: null },
        submittedAt: { type: Date, default: null },
      },
    ],
    overallScore: { type: Number, min: 0, max: 10, default: null },
    overallFeedback: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
