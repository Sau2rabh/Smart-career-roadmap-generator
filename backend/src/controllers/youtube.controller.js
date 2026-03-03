const { getYouTubeSuggestions } = require('../services/youtube.service');
const { AppError } = require('../middleware/errorHandler');

// @desc  Get YouTube video suggestions for a roadmap topic
// @route GET /api/youtube/suggest?topic=...&skills=...&role=...&language=hindi|english
const suggest = async (req, res, next) => {
  try {
    const { topic, skills, role, language } = req.query;

    if (!topic) throw new AppError('topic query parameter is required', 400);

    const skillsList = skills ? skills.split(',').map((s) => s.trim()) : [];
    const targetRole = role || 'Software Developer';
    const lang = language === 'hindi' ? 'hindi' : 'english';

    const videos = await getYouTubeSuggestions(topic, skillsList, targetRole, lang);

    res.json({
      success: true,
      data: { videos, topic, language: lang },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { suggest };
