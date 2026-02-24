const MockInterview = require('../models/MockInterview');
const { generateInterviewQuestions, gradeInterviewAnswer } = require('../services/ai.service');
const { AppError } = require('../middleware/errorHandler');

// @desc  Generate interview questions
// @route POST /api/interview/generate
const generate = async (req, res, next) => {
  try {
    const { targetRole, difficulty } = req.body;
    const aiData = await generateInterviewQuestions(targetRole, difficulty);

    const interview = await MockInterview.create({
      userId: req.user._id,
      targetRole,
      difficulty,
      questions: aiData.questions || [],
      status: 'in_progress',
    });

    res.status(201).json({
      success: true,
      message: 'Interview generated',
      data: { interview },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Submit answer and get AI feedback
// @route POST /api/interview/answer
const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId, questionId, answer } = req.body;

    const interview = await MockInterview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) throw new AppError('Interview not found', 404);

    const question = interview.questions.find((q) => q.id === questionId);
    if (!question) throw new AppError('Question not found', 404);

    const feedback = await gradeInterviewAnswer(question.question, answer, interview.targetRole);

    // Upsert answer
    const existingIdx = interview.answers.findIndex((a) => a.questionId === questionId);
    const answerObj = {
      questionId,
      userAnswer: answer,
      aiFeedback: feedback.feedback,
      score: feedback.score,
      submittedAt: new Date(),
    };

    if (existingIdx >= 0) {
      interview.answers[existingIdx] = answerObj;
    } else {
      interview.answers.push(answerObj);
    }

    // If all questions answered, complete interview
    if (interview.answers.length >= interview.questions.length) {
      const avgScore = interview.answers.reduce((sum, a) => sum + (a.score || 0), 0) / interview.answers.length;
      interview.overallScore = Math.round(avgScore * 10) / 10;
      interview.status = 'completed';
      interview.completedAt = new Date();
    }

    await interview.save();

    res.json({
      success: true,
      message: 'Answer submitted',
      data: { feedback, interview },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get interview history
// @route GET /api/interview/history
const getHistory = async (req, res, next) => {
  try {
    const interviews = await MockInterview.find({ userId: req.user._id }).sort('-createdAt').limit(20);
    res.json({ success: true, data: { interviews } });
  } catch (error) {
    next(error);
  }
};

module.exports = { generate, submitAnswer, getHistory };
