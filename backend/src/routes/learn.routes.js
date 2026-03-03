const express = require('express');
const router = express.Router();
const { getContent, getQuiz } = require('../controllers/learn.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/content', aiLimiter, getContent);
router.post('/quiz', aiLimiter, getQuiz);

module.exports = router;
