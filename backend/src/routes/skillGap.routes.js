const express = require('express');
const router = express.Router();
const { analyze, analyzeText } = require('../controllers/skillGap.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/analyze', aiLimiter, analyze);
router.post('/analyze-text', aiLimiter, analyzeText);

module.exports = router;
