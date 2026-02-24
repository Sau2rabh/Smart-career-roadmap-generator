const multer = require('multer');
const pdfParse = require('pdf-parse');
const Profile = require('../models/Profile');
const { analyzeSkillGap } = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');

// Multer config — memory storage, PDF only, 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF files are allowed', 400), false);
    }
  },
}).single('resume');

// @desc  Upload PDF & analyze skill gap
// @route POST /api/skill-gap/analyze
const analyze = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(err instanceof multer.MulterError ? new AppError(err.message, 400) : err);
    if (!req.file) return next(new AppError('Please upload a PDF file', 400));

    try {
      const profile = await Profile.findOne({ userId: req.user._id });
      if (!profile) throw new AppError('Complete your profile first', 400);

      // Parse PDF
      const parsed = await pdfParse(req.file.buffer);
      const resumeText = parsed.text;

      if (!resumeText || resumeText.trim().length < 50) {
        throw new AppError('Could not extract sufficient text from the PDF. Please try a text-based PDF.', 400);
      }

      // Save resume text to profile
      await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { resumeText: resumeText.substring(0, 5000) }
      );

      const analysis = await analyzeSkillGap(resumeText, profile.targetRole);

      res.json({
        success: true,
        message: 'Skill gap analysis complete',
        data: { analysis, resumeWordCount: resumeText.split(' ').length },
      });
    } catch (error) {
      next(error);
    }
  });
};

// @desc  Analyze using existing resume text (no upload)
// @route POST /api/skill-gap/analyze-text
const analyzeText = async (req, res, next) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) throw new AppError('Resume text is required', 400);

    const profile = await Profile.findOne({ userId: req.user._id });
    const role = targetRole || profile?.targetRole;
    if (!role) throw new AppError('Target role is required', 400);

    const analysis = await analyzeSkillGap(resumeText, role);

    res.json({ success: true, data: { analysis } });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyze, analyzeText };
