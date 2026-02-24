const express = require('express');
const router = express.Router();
const { generate, submitAnswer, getHistory } = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.post('/generate', aiLimiter, validate(schemas.interviewGenerate), generate);
router.post('/answer', aiLimiter, validate(schemas.interviewAnswer), submitAnswer);
router.get('/history', getHistory);

module.exports = router;
