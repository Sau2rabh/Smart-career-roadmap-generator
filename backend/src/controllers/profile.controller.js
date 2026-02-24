const Profile = require('../models/Profile');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// @desc  Get user profile
// @route GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.json({ success: true, data: { profile: null } });
    }
    res.json({ success: true, data: { profile } });
  } catch (error) {
    next(error);
  }
};

// @desc  Create or Update profile
// @route POST /api/profile
const upsertProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { ...req.body },
        { new: true, runValidators: true }
      );
    } else {
      profile = await Profile.create({ userId: req.user._id, ...req.body });
    }

    // Mark user profile as completed
    await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update resume text in profile
// @route PUT /api/profile/resume-text
const updateResumeText = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) throw new AppError('Resume text is required', 400);

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { resumeText },
      { new: true }
    );
    if (!profile) throw new AppError('Profile not found. Please complete your profile first.', 404);

    res.json({ success: true, message: 'Resume text updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, upsertProfile, updateResumeText };
