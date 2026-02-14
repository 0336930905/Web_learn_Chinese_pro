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
  try {
    const { code, error, error_description } = req.query;
    
    // Log incoming request for debugging
    console.log('📥 Google OAuth Callback:', {
      timestamp: new Date().toISOString(),
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers.referer,
        'host': req.headers.host
      },
      url: req.url,
      method: req.method
    });
    
    // Handle OAuth errors
    if (error) {
      console.error('❌ Google OAuth error:', {
        error,
        error_description,
        timestamp: new Date().toISOString()
      });
      return res.redirect(`/login_screen.html?error=${encodeURIComponent(error_description || error)}`);
    }
    
    if (!code) {
      console.error('❌ Missing authorization code from Google', {
        query: req.query,
        timestamp: new Date().toISOString()
      });
      return res.redirect('/login_screen.html?error=' + encodeURIComponent('Thiếu mã xác thực từ Google'));
    }
    
    // Exchange code for tokens
    console.log('🔄 Exchanging authorization code for tokens...');
    const { tokens } = await googleClient.getToken(code);
    const idToken = tokens.id_token;
    
    if (!idToken) {
      console.error('❌ No id_token received from Google', {
        tokens: Object.keys(tokens),
        timestamp: new Date().toISOString()
      });
      return res.redirect('/login_screen.html?error=' + encodeURIComponent('Không nhận được token từ Google'));
    }
    
    console.log('✅ ID token received, verifying...');
    
    // Verify token
    const payload = await verifyGoogleToken(idToken);
    console.log('✅ Token verified, user info:', {
      email: payload.email,
      name: payload.name,
      picture: payload.picture ? 'present' : 'missing'
    });
    
    // Find or create user
    const userService = new UserService(req.db);
    let user = await userService.collection.findOne({ email: payload.email });
    
    if (!user) {
      console.log('👤 User not found, creating new user:', payload.email);
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
      console.log('✅ New user created with ID:', user._id.toString());
    } else {
      console.log('✅ Existing user found:', user.email);
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      appConfig.jwt.secret,
      { expiresIn: appConfig.jwt.expiresIn }
    );
    console.log('🔑 JWT token generated for user:', user.email);
    
    // Prepare user data for frontend (exclude password)
    const userData = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      stats: user.stats,
      streak: user.streak,
      settings: user.settings
    };
    
    // Determine redirect URL
    const redirectUrl = user.role === 'admin' ? '/admin/home_ad.html' : '/user/home.html';
    
    // For mobile/Zalo: Use URL parameters instead of localStorage
    // Then use client-side script to move to localStorage
    const userAgent = req.headers['user-agent'] || '';
    const isMobileOrEmbedded = /Mobile|Android|iPhone|iPad|Zalo/i.test(userAgent);
    
    console.log('🔀 Redirecting user:', {
      email: user.email,
      redirectUrl,
      isMobile: isMobileOrEmbedded,
      userAgent: userAgent.substring(0, 100) + '...'
    });
    
    if (isMobileOrEmbedded) {
      // Mobile-friendly redirect with parameters
      console.log('📱 Using mobile redirect with URL parameters');
      const params = new URLSearchParams({
        token: token,
        user: JSON.stringify(userData)
      });
      const finalUrl = `${redirectUrl}?auth=success&${params.toString()}`;
      console.log('➡️ Mobile redirect to:', redirectUrl);
      return res.redirect(finalUrl);
    }
    
    // Desktop: Use localStorage script with better error handling
    console.log('💻 Using desktop redirect with localStorage');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đăng nhập thành công</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>Đăng nhập Google thành công!</h2>
          <p>Đang chuyển hướng...</p>
        </div>
        <script>
          try {
            // Store auth data
            window.localStorage.setItem('authToken', '${token}');
            window.localStorage.setItem('user', '${JSON.stringify(userData).replace(/'/g, "\\'").replace(/"/g, '\\"')}');
            
            // Redirect after short delay
            setTimeout(function() {
              window.location.href = '${redirectUrl}';
            }, 500);
          } catch (error) {
            console.error('Auth error:', error);
            // Fallback: redirect with parameters
            window.location.href = '${redirectUrl}?auth=success&token=${token}&user=' + encodeURIComponent('${JSON.stringify(userData).replace(/'/g, "\\'").replace(/"/g, '\\"')}');
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Google callback error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers.referer
      }
    });
    return res.redirect('/login_screen.html?error=' + encodeURIComponent('Lỗi xác thực: ' + error.message));
  }
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
