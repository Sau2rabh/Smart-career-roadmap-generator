const mongoose = require('mongoose');

const weeklyPlanSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tasks: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      type: { type: String, enum: ['learn', 'build', 'practice', 'read', 'watch'], default: 'learn' },
      resource: { type: String, default: '' },
      estimatedHours: { type: Number, default: 2 },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    },
  ],
});

const monthlyPlanSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  objectives: [{ type: String }],
  skills: [{ type: String }],
  weeks: [weeklyPlanSchema],
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    targetRole: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    totalDurationMonths: { type: Number, required: true },
    summary: { type: String, default: '' },
    monthlyPlan: [monthlyPlanSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'archived'],
      default: 'active',
    },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
