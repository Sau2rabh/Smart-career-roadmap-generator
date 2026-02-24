const Progress = require('../models/Progress');
const { AppError } = require('../middleware/errorHandler');

const XP_PER_TASK = 50;

// @desc  Get user progress
// @route GET /api/progress
const getProgress = async (req, res, next) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id });
    }
    res.json({ success: true, data: { progress } });
  } catch (error) {
    next(error);
  }
};

// @desc  Claim XP for completing a task
// @route POST /api/progress/claim-xp
const claimXP = async (req, res, next) => {
  try {
    const { taskId, roadmapId, xpAmount = XP_PER_TASK } = req.body;

    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) throw new AppError('Progress record not found', 404);

    // Check for duplicate claim
    const alreadyClaimed = progress.completedMilestones.some((m) => m.taskId === taskId);
    if (alreadyClaimed) {
      return res.json({ success: true, message: 'XP already claimed for this task', data: { progress } });
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = progress.lastActiveDate ? new Date(progress.lastActiveDate) : null;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        progress.streak += 1;
      } else if (diffDays > 1) {
        progress.streak = 1;
      }
      // Same day: streak unchanged
    } else {
      progress.streak = 1;
    }

    progress.longestStreak = Math.max(progress.longestStreak, progress.streak);
    progress.lastActiveDate = new Date();
    progress.xp += xpAmount;
    progress.totalTasksCompleted += 1;
    progress.calculateLevel();

    // Add to activity log
    const todayEntry = progress.activityLog.find((a) => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayEntry) {
      todayEntry.tasksCompleted += 1;
      todayEntry.xpEarned += xpAmount;
    } else {
      progress.activityLog.push({ date: new Date(), tasksCompleted: 1, xpEarned: xpAmount });
    }

    progress.completedMilestones.push({
      roadmapId,
      taskId,
      completedAt: new Date(),
      xpEarned: xpAmount,
    });

    // Award badges
    if (progress.totalTasksCompleted === 1 && !progress.badges.find((b) => b.id === 'first_task')) {
      progress.badges.push({ id: 'first_task', name: 'First Step', description: 'Completed your first task!', earnedAt: new Date(), icon: '🎯' });
    }
    if (progress.streak >= 7 && !progress.badges.find((b) => b.id === 'week_streak')) {
      progress.badges.push({ id: 'week_streak', name: 'Week Warrior', description: '7-day streak!', earnedAt: new Date(), icon: '🔥' });
    }
    if (progress.xp >= 1000 && !progress.badges.find((b) => b.id === 'xp_1000')) {
      progress.badges.push({ id: 'xp_1000', name: 'XP Champion', description: 'Earned 1000 XP!', earnedAt: new Date(), icon: '⭐' });
    }

    await progress.save();

    res.json({ success: true, message: `+${xpAmount} XP earned!`, data: { progress } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress, claimXP };
