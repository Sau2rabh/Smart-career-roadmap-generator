const express = require('express');
const router = express.Router();
const { getRecommendations, getProjectGuide } = require('../controllers/projects.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.get('/recommendations', aiLimiter, getRecommendations);
router.post('/guide', aiLimiter, getProjectGuide);

module.exports = router;
