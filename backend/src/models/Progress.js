const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    streak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    totalTasksCompleted: { type: Number, default: 0 },
    activityLog: [
      {
        date: { type: Date, required: true },
        tasksCompleted: { type: Number, default: 0 },
        xpEarned: { type: Number, default: 0 },
      },
    ],
    badges: [
      {
        id: { type: String },
        name: { type: String },
        description: { type: String },
        earnedAt: { type: Date },
        icon: { type: String },
      },
    ],
    completedMilestones: [
      {
        roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
        taskId: { type: String },
        completedAt: { type: Date, default: Date.now },
        xpEarned: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Calculate level from XP (every 500 XP = 1 level)
progressSchema.methods.calculateLevel = function () {
  this.level = Math.floor(this.xp / 500) + 1;
};

module.exports = mongoose.model('Progress', progressSchema);
