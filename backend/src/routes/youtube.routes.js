const express = require('express');
const router = express.Router();
const { suggest } = require('../controllers/youtube.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

// GET /api/youtube/suggest?topic=...&skills=...&role=...
router.get('/suggest', aiLimiter, suggest);

module.exports = router;
