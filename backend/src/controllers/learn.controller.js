const { generateStudyContent, generateMCQQuiz } = require('../services/learn.service');
const { AppError } = require('../middleware/errorHandler');

// @desc  Get study content for a task
// @route GET /api/learn/content?title=...&type=...&role=...
const getContent = async (req, res, next) => {
  try {
    const { title, type, role } = req.query;
    if (!title) throw new AppError('title query param is required', 400);

    const content = await generateStudyContent(title, type || 'learn', role || 'Software Developer');
    res.json({ success: true, data: { content } });
  } catch (error) {
    next(error);
  }
};

// @desc  Generate MCQ quiz for a task topic
// @route POST /api/learn/quiz
const getQuiz = async (req, res, next) => {
  try {
    const { title, role } = req.body;
    if (!title) throw new AppError('title is required', 400);

    const questions = await generateMCQQuiz(title, role || 'Software Developer');
    res.json({ success: true, data: { questions } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContent, getQuiz };
