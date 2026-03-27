const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const Profile = require('../models/Profile');
const { optimizeResume } = require('../services/ai.service');
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

// @desc  Upload PDF and optimize with AI
// @route POST /api/resume/upload
const uploadResume = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(err instanceof multer.MulterError ? new AppError(err.message, 400) : err);
    if (!req.file) return next(new AppError('Please upload a PDF file', 400));

    try {
      const profile = await Profile.findOne({ userId: req.user._id });
      if (!profile) throw new AppError('Complete your profile first', 400);

      const role = profile.targetRole;
      if (!role) throw new AppError('Target role is required in your profile', 400);

      // Parse PDF
    const parser = new PDFParse({ data: req.file.buffer });
    const parsingResult = await parser.getText();
    const extractedText = parsingResult.text;

      if (!extractedText || extractedText.trim().length < 50) {
        throw new AppError('Could not extract sufficient text from the PDF. Please try a text-based PDF.', 400);
      }

      // Optimize extracted text
      const result = await optimizeResume(extractedText, role);

      // Save extracted text to profile (optional but helpful)
      await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { resumeText: extractedText.substring(0, 5000) }
      );

      res.json({
        success: true,
        message: 'Resume uploaded and optimized successfully',
        data: { 
          result,
          extractedText: extractedText.substring(0, 5000) // Return first 5k chars to populate the UI
        },
      });
    } catch (error) {
      next(error);
    }
  });
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

module.exports = { optimize, getResume, uploadResume };
