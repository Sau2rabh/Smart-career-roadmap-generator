const ChatMessage = require('../models/ChatMessage');
const Profile = require('../models/Profile');
const { chatWithMentor } = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');

// @desc  Send message to AI mentor
// @route POST /api/chat/message
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const profile = await Profile.findOne({ userId: req.user._id });

    // Save user message
    await ChatMessage.create({ userId: req.user._id, role: 'user', content: message });

    // Get last 10 messages for context
    const history = await ChatMessage.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(10)
      .lean();

    const messageHistory = history
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    const { content, tokens } = await chatWithMentor(messageHistory, profile);

    // Save assistant reply
    const assistantMsg = await ChatMessage.create({
      userId: req.user._id,
      role: 'assistant',
      content,
      tokens,
    });

    res.json({
      success: true,
      data: { message: assistantMsg },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get chat history
// @route GET /api/chat/history
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ChatMessage.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        messages,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Clear chat history
// @route DELETE /api/chat/history
const clearHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getHistory, clearHistory };
