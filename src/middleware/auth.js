/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES, USER_ROLES } = require('../constants');
const { AppError } = require('./errorHandler');

/**
 * Verify JWT Token
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTH_UNAUTHORIZED
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Attach user info to request (set both userId and _id for compatibility)
    req.user = {
      userId: decoded.userId,
      _id: decoded.userId,  // For backward compatibility
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(
        new AppError(
          ERROR_MESSAGES.TOKEN_INVALID,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTH_TOKEN_INVALID
        )
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(
        new AppError(
          ERROR_MESSAGES.TOKEN_EXPIRED,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTH_TOKEN_EXPIRED
        )
      );
    }

    next(error);
  }
};

/**
 * Optional Authentication
 * Verifies token if present but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      
      req.user = {
        userId: decoded.userId,
        _id: decoded.userId,  // For backward compatibility
        email: decoded.email,
        role: decoded.role,
      };
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

/**
 * Role-Based Access Control
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          ERROR_MESSAGES.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTH_UNAUTHORIZED
        )
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Bạn không có quyền thực hiện thao tác này',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTH_UNAUTHORIZED
        )
      );
    }

    next();
  };
};

/**
 * Admin Only Access
 */
const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Check Resource Ownership
 */
const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.resource?.[resourceUserIdField]?.toString();
    const currentUserId = req.user?.userId?.toString();

    // Allow admins to access all resources
    if (req.user?.role === USER_ROLES.ADMIN) {
      return next();
    }

    // Check ownership
    if (!resourceUserId || resourceUserId !== currentUserId) {
      return next(
        new AppError(
          'Bạn không có quyền truy cập tài nguyên này',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTH_UNAUTHORIZED
        )
      );
    }

    next();
  };
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireOwnership,
};
