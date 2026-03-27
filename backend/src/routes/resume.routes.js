const express = require('express');
const router = express.Router();
const { optimize, getResume, uploadResume } = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.get('/', getResume);
router.post('/optimize', aiLimiter, optimize);
router.post('/upload', aiLimiter, uploadResume);

module.exports = router;
