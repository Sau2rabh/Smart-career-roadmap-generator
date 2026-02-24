const express = require('express');
const router = express.Router();
const { generate, getActiveRoadmap, getAllRoadmaps, completeTask } = require('../controllers/roadmap.controller');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/generate', aiLimiter, generate);
router.get('/', getActiveRoadmap);
router.get('/all', getAllRoadmaps);
router.put('/:roadmapId/task/:taskId/complete', completeTask);

module.exports = router;
