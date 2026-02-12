/**
 * Settings Controller
 * Handles user settings related requests
 */

const { UserService } = require('../services');
const { asyncHandler } = require('../middleware');
const { successResponse } = require('../utils/response');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../constants');

/**
 * Get user settings
 * GET /api/settings
 */
const getSettings = asyncHandler(async (req, res) => {
  const userService = new UserService(req.db);
  const profile = await userService.getProfile(req.user.userId);

  // Return only settings object
  const settings = profile.settings || {
    theme: 'light',
    language: 'vi',
    voice: 'zh-TW',
    sound: {
      bgMusic: 75,
      gameSFX: 90
    }
  };

  return successResponse(res, { settings }, 'Settings retrieved successfully');
});

/**
 * Update user settings
 * PUT /api/settings
 */
const updateSettings = asyncHandler(async (req, res) => {
  const { theme, language, voice, sound } = req.body;

  // Build settings update object
  const settingsUpdate = {};
  
  if (theme !== undefined) {
    if (!['light', 'dark'].includes(theme)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Invalid theme. Must be "light" or "dark"',
          field: 'theme',
        },
      });
    }
    settingsUpdate.theme = theme;
  }

  if (language !== undefined) {
    if (!['en', 'vi', 'tw'].includes(language)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Invalid language. Must be "en", "vi", or "tw"',
          field: 'language',
        },
      });
    }
    settingsUpdate.language = language;
  }

  if (voice !== undefined) {
    // Validate voice format (e.g., zh-TW, zh-CN, zh-HK)
    if (typeof voice !== 'string' || voice.trim() === '') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Invalid voice. Must be a non-empty string (e.g., zh-TW)',
          field: 'voice',
        },
      });
    }
    settingsUpdate.voice = voice;
  }

  if (sound !== undefined) {
    if (typeof sound !== 'object') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'Invalid sound settings. Must be an object',
          field: 'sound',
        },
      });
    }
    settingsUpdate.sound = {};
    
    if (sound.bgMusic !== undefined) {
      const bgMusic = Number(sound.bgMusic);
      if (isNaN(bgMusic) || bgMusic < 0 || bgMusic > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Invalid bgMusic. Must be a number between 0 and 100',
            field: 'sound.bgMusic',
          },
        });
      }
      settingsUpdate.sound.bgMusic = bgMusic;
    }
    
    if (sound.gameSFX !== undefined) {
      const gameSFX = Number(sound.gameSFX);
      if (isNaN(gameSFX) || gameSFX < 0 || gameSFX > 100) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Invalid gameSFX. Must be a number between 0 and 100',
            field: 'sound.gameSFX',
          },
        });
      }
      settingsUpdate.sound.gameSFX = gameSFX;
    }
  }

  // Update profile with new settings
  const userService = new UserService(req.db);
  const updatedProfile = await userService.updateProfile(req.user.userId, {
    settings: settingsUpdate
  });

  return successResponse(
    res,
    { settings: updatedProfile.settings },
    'Settings updated successfully'
  );
});

module.exports = {
  getSettings,
  updateSettings,
};
