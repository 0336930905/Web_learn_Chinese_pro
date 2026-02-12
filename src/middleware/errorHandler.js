/**
 * Error Handler Middleware
 * Centralized error handling
 */

const { HTTP_STATUS, ERROR_CODES } = require('../constants');
const { logger } = require('../utils/logger');

/**
 * Custom Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = ERROR_CODES.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Response Formatter
 */
const formatErrorResponse = (error, env) => {
  const response = {
    success: false,
    error: {
      code: error.errorCode || ERROR_CODES.INTERNAL_ERROR,
      message: error.message || 'Internal Server Error',
    },
  };

  // Include stack trace in development
  if (env === 'development') {
    response.error.stack = error.stack;
  }

  return response;
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode,
  });

  // Set default values if not set
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.errorCode = err.errorCode || ERROR_CODES.INTERNAL_ERROR;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    err.errorCode = ERROR_CODES.VALIDATION_ERROR;
  }

  if (err.name === 'JsonWebTokenError') {
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    err.errorCode = ERROR_CODES.AUTH_TOKEN_EXPIRED;
    err.message = 'Token không hợp lệ';
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = HTTP_STATUS.UNAUTHORIZED;
    err.errorCode = ERROR_CODES.AUTH_TOKEN_EXPIRED;
    err.message = 'Token đã hết hạn';
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    err.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    err.errorCode = ERROR_CODES.DB_QUERY_ERROR;
    err.message = 'Lỗi database';
  }

  // Send error response
  const response = formatErrorResponse(err, process.env.NODE_ENV);
  res.status(err.statusCode).json(response);
};

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
