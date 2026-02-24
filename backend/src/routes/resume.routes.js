const express = require('express');
const router = express.Router();
const { optimize, getResume } = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.get('/', getResume);
router.post('/optimize', aiLimiter, optimize);

module.exports = router;
