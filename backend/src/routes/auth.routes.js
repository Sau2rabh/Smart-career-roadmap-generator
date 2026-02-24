const express = require('express');
const router = express.Router();
const { signup, login, refresh, getMe, logout } = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, validate(schemas.signup), signup);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
