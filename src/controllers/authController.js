/**
 * Auth Controller
 * Handles authentication related requests
 */

const { UserService } = require('../services');
const { authValidators } = require('../validators');
const { asyncHandler } = require('../middleware');
const { successResponse, createdResponse } = require('../utils/response');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../constants');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  // Validate input
  const validation = authValidators.register().validate(req.body);
  if (!validation.isValid) {
    const error = validation.errors[0];
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: error.message,
        field: error.field,
      },
    });
  }

  // Create service instance
  const userService = new UserService(req.db);

  // Register user
  const result = await userService.register(validation.data);

  return createdResponse(res, result, SUCCESS_MESSAGES.USER_REGISTERED);
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  // Validate input
  const validation = authValidators.login().validate(req.body);
  if (!validation.isValid) {
    const error = validation.errors[0];
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: error.message,
        field: error.field,
      },
    });
  }

  // Create service instance
  const userService = new UserService(req.db);

  // Login user
  const result = await userService.login(validation.data);

  return successResponse(res, result, SUCCESS_MESSAGES.USER_LOGGED_IN);
});

/**
 * Get user profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const userService = new UserService(req.db);
  const profile = await userService.getProfile(req.user.userId);
  
  // Get user stats from activities to calculate level
  try {
    const achievementService = require('../services/achievementService');
    const stats = await achievementService.getUserStats(req.db, req.user.userId);
    
    // Calculate level from totalXP (1000 XP per level)
    const XP_PER_LEVEL = 1000;
    const totalXP = stats.totalXP || 0;
    const level = Math.floor(totalXP / XP_PER_LEVEL) + 1; // Start at level 1
    const currentLevelXP = totalXP % XP_PER_LEVEL;
    const nextLevelXP = XP_PER_LEVEL;
    const levelProgress = Math.round((currentLevelXP / nextLevelXP) * 100);
    
    // Add level info to profile
    profile.levelInfo = {
      level,
      totalXP,
      currentLevelXP,
      nextLevelXP,
      levelProgress,
      totalTests: stats.totalTests || 0,
      currentStreak: stats.currentStreak || 0
    };
  } catch (error) {
    // If stats fail to load, provide default level info
    console.warn('Failed to load user stats for profile:', error.message);
    profile.levelInfo = {
      level: 1,
      totalXP: 0,
      currentLevelXP: 0,
      nextLevelXP: 1000,
      levelProgress: 0,
      totalTests: 0,
      currentStreak: 0
    };
  }

  return successResponse(res, profile);
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  // Validate input
  const validation = authValidators.updateProfile().validate(req.body);
  if (!validation.isValid) {
    const error = validation.errors[0];
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: error.message,
        field: error.field,
      },
    });
  }

  const userService = new UserService(req.db);
  const updatedProfile = await userService.updateProfile(
    req.user.userId,
    validation.data
  );

  return successResponse(res, updatedProfile, SUCCESS_MESSAGES.PROFILE_UPDATED);
});


// Google OAuth2
const { client: googleClient, verifyGoogleToken } = require('../utils/googleAuth');
const { config: appConfig } = require('../config');
const jwt = require('jsonwebtoken');

// Step 1: Redirect to Google
const googleAuth = asyncHandler(async (req, res) => {
  const redirectUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'profile',
      'email',
    ],
  });
  res.writeHead(302, { Location: redirectUrl });
  res.end();
});

// Step 2: Google callback
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ success: false, error: { message: 'Missing code from Google' } });
  }
  // Exchange code for tokens
  const { tokens } = await googleClient.getToken(code);
  const idToken = tokens.id_token;
  if (!idToken) {
    return res.status(400).json({ success: false, error: { message: 'No id_token from Google' } });
  }
  // Verify token
  const payload = await verifyGoogleToken(idToken);
  // Find or create user
  const userService = new UserService(req.db);
  let user = await userService.collection.findOne({ email: payload.email });
  if (!user) {
    // Create new user
    const newUser = {
      email: payload.email,
      fullName: payload.name || '',
      avatar: payload.picture || '',
      password: '',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
      streak: { current: 0, longest: 0, lastStudyDate: null },
      stats: { totalWords: 0, experience: 0, level: 1, accuracy: 0 },
      settings: {
        theme: 'light',
        language: 'vi',
        sound: {
          bgMusic: 75,
          gameSFX: 90
        }
      }
    };
    const result = await userService.collection.insertOne(newUser);
    user = { ...newUser, _id: result.insertedId };
  }
  // Generate JWT
  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    appConfig.jwt.secret,
    { expiresIn: appConfig.jwt.expiresIn }
  );
  
  // Prepare user data for frontend (exclude password)
  const userData = {
    _id: user._id.toString(),
    id: user._id.toString(), // For compatibility
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar,
    role: user.role,
    stats: user.stats,
    streak: user.streak,
    settings: user.settings
  };
  
  // Redirect to frontend with token and user data
  // For SPA: send HTML with script to store token and redirect
  const redirectUrl = user.role === 'admin' ? '/admin/home_ad.html' : '/user/home.html';
  
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <html><body>
    <script>
      window.localStorage.setItem('authToken', '${token}');
      window.localStorage.setItem('user', '${JSON.stringify(userData).replace(/'/g, "\\'")}');
      window.location.href = '${redirectUrl}';
    </script>
    Đăng nhập Google thành công. Đang chuyển hướng...
    </body></html>
  `);
});

/**
 * Forgot Password - Send reset token via email
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Email là bắt buộc' }
    });
  }
  
  const userService = new UserService(req.db);
  await userService.sendPasswordResetEmail(email);
  
  // Always return success to prevent email enumeration
  return successResponse(
    res,
    { message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi' },
    'Email khôi phục đã được gửi'
  );
});

/**
 * Reset Password - Verify token and update password
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Token và mật khẩu mới là bắt buộc' }
    });
  }
  
  if (newPassword.length < 8) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Mật khẩu phải có ít nhất 8 ký tự' }
    });
  }
  
  const userService = new UserService(req.db);
  await userService.resetPassword(token, newPassword);
  
  return successResponse(
    res,
    { message: 'Đặt lại mật khẩu thành công' },
    'Mật khẩu đã được cập nhật'
  );
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  googleAuth,
  googleCallback,
  forgotPassword,
  resetPassword,
};
