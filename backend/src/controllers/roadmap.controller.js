const Roadmap = require('../models/Roadmap');
const Profile = require('../models/Profile');
const { generateRoadmap } = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');

// @desc  Generate AI roadmap from profile
// @route POST /api/roadmap/generate
const generate = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).select('+resumeText');
    if (!profile) throw new AppError('Complete your profile before generating a roadmap.', 400);

    // Deactivate previous roadmaps
    await Roadmap.updateMany({ userId: req.user._id, isActive: true }, { isActive: false, status: 'archived' });

    const aiData = await generateRoadmap(profile);

    const roadmap = await Roadmap.create({
      userId: req.user._id,
      title: aiData.title,
      targetRole: profile.targetRole,
      experienceLevel: profile.experienceLevel,
      totalDurationMonths: aiData.totalDurationMonths,
      summary: aiData.summary,
      monthlyPlan: aiData.monthlyPlan,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Roadmap generated successfully',
      data: { roadmap },
    });
  } catch (error) {
    // Handle Gemini quota / rate-limit errors clearly
    if (
      error?.status === 429 ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.message?.includes('quota')
    ) {
      return next(new AppError('AI quota exceeded. Please wait a minute and try again.', 429));
    }
    next(error);
  }
};


// @desc  Get active roadmap
// @route GET /api/roadmap
const getActiveRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id, isActive: true });
    if (!roadmap) return res.json({ success: true, data: { roadmap: null } });
    res.json({ success: true, data: { roadmap } });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all roadmaps for user
// @route GET /api/roadmap/all
const getAllRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user._id })
      .select('-monthlyPlan')
      .sort('-createdAt');
    res.json({ success: true, data: { roadmaps, count: roadmaps.length } });
  } catch (error) {
    next(error);
  }
};

// @desc  Mark a task as complete
// @route PUT /api/roadmap/:roadmapId/task/:taskId/complete
const completeTask = async (req, res, next) => {
  try {
    const { roadmapId, taskId } = req.params;
    const { monthIndex, weekIndex, taskIndex } = req.body;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user._id });
    if (!roadmap) throw new AppError('Roadmap not found', 404);

    const task = roadmap.monthlyPlan[monthIndex]?.weeks[weekIndex]?.tasks[taskIndex];
    if (!task) throw new AppError('Task not found', 404);

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;

    // Recalculate completion percentage
    let totalTasks = 0;
    let completedTasks = 0;
    roadmap.monthlyPlan.forEach((month) => {
      month.weeks.forEach((week) => {
        week.tasks.forEach((t) => {
          totalTasks++;
          if (t.completed) completedTasks++;
        });
      });
    });
    roadmap.completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    if (roadmap.completionPercentage === 100) roadmap.status = 'completed';

    await roadmap.save();

    res.json({
      success: true,
      message: `Task ${task.completed ? 'completed' : 'uncompleted'}`,
      data: { completionPercentage: roadmap.completionPercentage, task },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generate, getActiveRoadmap, getAllRoadmaps, completeTask };
