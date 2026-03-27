const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { AppError } = require('../middleware/errorHandler');
const { sendOtpEmail } = require('../services/email.service');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  // For cross-domain cookies (Vercel <-> Render), we MUST use sameSite: 'none' and secure: true
  const cookieOptions = {
    httpOnly: true,
    secure: isProd, // Must be true for sameSite: 'none'
    sameSite: isProd ? 'none' : 'lax', 
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/** Generate a 6-digit OTP */
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// @desc  Send OTP for signup or forgot_password
// @route POST /api/auth/send-otp
const sendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body; // purpose: 'signup' | 'forgot_password'
    if (!email || !purpose) throw new AppError('Email and purpose are required', 400);

    if (purpose === 'signup') {
      // Check if already registered
      const existing = await User.findOne({ email });
      if (existing && existing.isEmailVerified) {
        throw new AppError('Email already registered. Please log in.', 409);
      }

      const otp = generateOtp();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Upsert a placeholder user (or update temp OTP fields)
      await User.findOneAndUpdate(
        { email },
        { otp, otpExpires, otpPurpose: 'signup', isEmailVerified: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await sendOtpEmail(email, otp, 'signup');
    } else if (purpose === 'forgot_password') {
      const user = await User.findOne({ email });
      if (!user) throw new AppError('No account found with this email', 404);

      const otp = generateOtp();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpires = otpExpires;
      user.otpPurpose = 'forgot_password';
      await user.save({ validateBeforeSave: false });

      await sendOtpEmail(email, otp, 'forgot_password');
    } else {
      throw new AppError('Invalid purpose', 400);
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify OTP
// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp || !purpose) throw new AppError('Email, OTP and purpose are required', 400);

    const user = await User.findOne({ email }).select('+otp +otpExpires +otpPurpose');
    if (!user) throw new AppError('No account found with this email', 404);
    if (user.otpPurpose !== purpose) throw new AppError('OTP purpose mismatch', 400);
    if (!user.otp || !user.otpExpires) throw new AppError('No OTP found. Please request a new one.', 400);
    if (new Date() > user.otpExpires) throw new AppError('OTP has expired. Please request a new one.', 400);
    if (user.otp !== otp.trim()) throw new AppError('Invalid OTP. Please try again.', 400);

    // Mark OTP as used
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpPurpose = undefined;

    if (purpose === 'signup') {
      user.isEmailVerified = true;
    }

    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Register new user (after OTP verified)
// @route POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check OTP was verified
    const user = await User.findOne({ email });
    if (!user || !user.isEmailVerified) {
      throw new AppError('Please verify your email with OTP first', 400);
    }
    if (user.name && user.password) {
      throw new AppError('Email already registered. Please log in.', 409);
    }

    // Update user with name and password
    user.name = name;
    user.password = password;
    await user.save();

    await Progress.create({ userId: user._id });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Reset password after OTP verified for forgot_password
// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and new password are required', 400);

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new AppError('No account found with this email', 404);

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });
    setCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Refresh access token
// @route POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });
    setCookies(res, accessToken, refreshToken);

    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    next(error);
  }
};

// @desc  Logout
// @route POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOtp, verifyOtp, signup, resetPassword, login, refresh, getMe, logout };
