const Profile = require('../models/Profile');
const { recommendProjects } = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');

// @desc  Get project recommendations
// @route GET /api/projects/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) throw new AppError('Complete your profile to get project recommendations', 400);

    const data = await recommendProjects(profile);

    res.json({
      success: true,
      data: { projects: data.projects || [] },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };
