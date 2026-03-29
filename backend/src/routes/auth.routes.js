const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, signup, resetPassword, login, refresh, getMe, logout, initiateLogin } = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/send-otp', authLimiter, sendOtp);
router.post('/login-init', authLimiter, validate(schemas.login), initiateLogin);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/signup', authLimiter, validate(schemas.signup), signup);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
