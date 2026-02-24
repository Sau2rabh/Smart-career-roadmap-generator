const Profile = require('../models/Profile');
const { optimizeResume } = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');

// @desc  Optimize resume with AI
// @route POST /api/resume/optimize
const optimize = async (req, res, next) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) throw new AppError('Resume text is required', 400);

    const profile = await Profile.findOne({ userId: req.user._id });
    const role = targetRole || profile?.targetRole;
    if (!role) throw new AppError('Target role is required', 400);

    const result = await optimizeResume(resumeText, role);

    res.json({
      success: true,
      message: 'Resume optimized successfully',
      data: { result },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get saved resume from profile
// @route GET /api/resume
const getResume = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id }).select('+resumeText');
    res.json({
      success: true,
      data: { resumeText: profile?.resumeText || '' },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { optimize, getResume };
