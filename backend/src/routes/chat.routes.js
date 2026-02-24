const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, clearHistory } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/message', aiLimiter, validate(schemas.chat), sendMessage);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

module.exports = router;
