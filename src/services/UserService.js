/**
 * User Service
 * Business logic for user operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { config } = require('../config');
const { 
  HTTP_STATUS, 
  ERROR_CODES, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  USER_ROLES,
  COLLECTIONS 
} = require('../constants');
const { AppError } = require('../middleware');
const { logger } = require('../utils/logger');

class UserService {
  constructor(db) {
    this.db = db;
    this.collection = db.collection(COLLECTIONS.USERS);
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      // Check if user exists
      const existingUser = await this.collection.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError(
          ERROR_MESSAGES.USER_EXISTS,
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.AUTH_USER_EXISTS
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, config.password.saltRounds);

      // Create user document
      const newUser = {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName || '',
        avatar: userData.avatar || '',
        role: userData.role || USER_ROLES.STUDENT,
        streak: {
          current: 0,
          longest: 0,
          lastStudyDate: null,
        },
        stats: {
          totalWords: 0,
          experience: 0,
          level: 1,
          accuracy: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          theme: 'light',
          language: 'vi',
          voice: 'zh-TW',
          sound: {
            bgMusic: 75,
            gameSFX: 90
          }
        }
      };

      const result = await this.collection.insertOne(newUser);
      
      // Generate JWT token
      const token = this.generateToken(result.insertedId, userData.email, newUser.role);

      logger.info('User registered successfully', { email: userData.email });

      return {
        user: {
          _id: result.insertedId.toString(), // Use _id for consistency with frontend
          id: result.insertedId.toString(), // Keep id for backward compatibility
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
        },
        token,
      };
    } catch (error) {
      logger.error('Registration error', { error: error.message });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    try {
      // Find user
      const user = await this.collection.findOne({ email: credentials.email });
      if (!user) {
        throw new AppError(
          ERROR_MESSAGES.INVALID_CREDENTIALS,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTH_INVALID_CREDENTIALS
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new AppError(
          ERROR_MESSAGES.INVALID_CREDENTIALS,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTH_INVALID_CREDENTIALS
        );
      }

      // Generate JWT token
      const token = this.generateToken(user._id, user.email, user.role);

      logger.info('User logged in successfully', { email: credentials.email });

      return {
        user: {
          _id: user._id.toString(), // Use _id for consistency with frontend
          id: user._id.toString(), // Keep id for backward compatibility
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar,
          stats: user.stats,
          streak: user.streak,
        },
        token,
      };
    } catch (error) {
      logger.error('Login error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    try {
      const user = await this.collection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0 } }
      );

      if (!user) {
        throw new AppError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      return user;
    } catch (error) {
      logger.error('Get profile error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      // Handle password change separately if provided
      if (updates.currentPassword && updates.newPassword) {
        await this.changePassword(userId, updates.currentPassword, updates.newPassword);
        // Remove password fields from updates object
        delete updates.currentPassword;
        delete updates.newPassword;
      }
      
      const allowedUpdates = ['fullName', 'avatar', 'settings'];
      const validUpdates = {};

      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          // For settings, merge with existing settings instead of replacing
          if (key === 'settings') {
            // Get current user to merge settings
            const currentUser = await this.collection.findOne(
              { _id: new ObjectId(userId) },
              { projection: { settings: 1 } }
            );
            
            // Merge settings deeply
            const currentSettings = currentUser?.settings || {};
            const newSettings = { ...currentSettings };
            
            if (updates.settings.theme !== undefined) {
              newSettings.theme = updates.settings.theme;
            }
            if (updates.settings.language !== undefined) {
              newSettings.language = updates.settings.language;
            }
            if (updates.settings.voice !== undefined) {
              newSettings.voice = updates.settings.voice;
            }
            if (updates.settings.sound !== undefined) {
              newSettings.sound = {
                ...(currentSettings.sound || {}),
                ...updates.settings.sound
              };
            }
            
            validUpdates[key] = newSettings;
          } else {
            validUpdates[key] = updates[key];
          }
        }
      }

      validUpdates.updatedAt = new Date();

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: validUpdates },
        { returnDocument: 'after', projection: { password: 0 } }
      );

      if (!result) {
        throw new AppError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      logger.info('Profile updated successfully', { userId });

      return result;
    } catch (error) {
      logger.error('Update profile error', { error: error.message });
      throw error;
    }
  }

  /**
   * Change Password
   * Verify current password and update to new password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user with password
      const user = await this.collection.findOne({ _id: new ObjectId(userId) });
      
      if (!user) {
        throw new AppError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError(
          'Mật khẩu hiện tại không đúng',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.AUTH_INVALID_CREDENTIALS
        );
      }

      // Validate new password
      if (newPassword.length < config.password.minLength) {
        throw new AppError(
          `Mật khẩu mới phải có ít nhất ${config.password.minLength} ký tự`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.password.saltRounds);

      // Update password
      await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );

      logger.info('Password changed successfully', { userId: userId.toString() });

      return { success: true, message: 'Mật khẩu đã được cập nhật' };
    } catch (error) {
      logger.error('Change password error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update user stats
   */
  async updateStats(userId, statsUpdate) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            'stats': statsUpdate,
            'updatedAt': new Date()
          } 
        },
        { returnDocument: 'after', projection: { password: 0 } }
      );

      return result;
    } catch (error) {
      logger.error('Update stats error', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate JWT Token
   */
  generateToken(userId, email, role) {
    return jwt.sign(
      { userId: userId.toString(), email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Send Password Reset Email
   * Generates reset token and stores it in database
   */
  async sendPasswordResetEmail(email) {
    try {
      // Find user by email
      const user = await this.collection.findOne({ email });
      
      // Don't reveal if user exists or not (security best practice)
      if (!user) {
        logger.info('Password reset requested for non-existent email', { email });
        return { success: true };
      }

      // Generate reset token (32 bytes = 64 hex characters)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Token expires in 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Store hashed token in database
      await this.collection.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetToken: hashedToken,
            passwordResetExpires: expiresAt,
            updatedAt: new Date()
          }
        }
      );

      // In production, send actual email here using SendGrid, AWS SES, or Nodemailer
      // For now, log the reset link to console
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;
      
      console.log('\n========================================');
      console.log('📧 PASSWORD RESET EMAIL (DEV MODE)');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log(`Token expires at: ${expiresAt.toISOString()}`);
      console.log('========================================\n');

      logger.info('Password reset token generated', { 
        email, 
        expiresAt: expiresAt.toISOString() 
      });

      // TODO: Integrate actual email service
      // Example with nodemailer:
      // await emailService.send({
      //   to: email,
      //   subject: 'Đặt lại mật khẩu - Learn Taiwanese Pro',
      //   html: `
      //     <h2>Khôi phục mật khẩu</h2>
      //     <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link dưới đây để tiếp tục:</p>
      //     <a href="${resetUrl}">Đặt lại mật khẩu</a>
      //     <p>Link này sẽ hết hạn sau 1 giờ.</p>
      //     <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      //   `
      // });

      return { success: true };
    } catch (error) {
      logger.error('Send password reset email error', { error: error.message });
      throw error;
    }
  }

  /**
   * Reset Password
   * Verifies token and updates password
   */
  async resetPassword(token, newPassword) {
    try {
      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid token
      const user = await this.collection.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() } // Token not expired
      });

      if (!user) {
        throw new AppError(
          'Token không hợp lệ hoặc đã hết hạn',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.AUTH_INVALID_TOKEN
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.password.saltRounds);

      // Update password and clear reset token
      await this.collection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date()
          },
          $unset: {
            passwordResetToken: '',
            passwordResetExpires: ''
          }
        }
      );

      logger.info('Password reset successfully', { userId: user._id.toString() });

      return { success: true };
    } catch (error) {
      logger.error('Reset password error', { error: error.message });
      throw error;
    }
  }
}

module.exports = UserService;
