/**
 * Validation Middleware
 * Request validation using schemas
 */

const { HTTP_STATUS, ERROR_CODES } = require('../constants');
const { AppError } = require('./errorHandler');

/**
 * Validate Request Body
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(
        new AppError(
          errorMessage,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        )
      );
    }

    req.body = value;
    next();
  };
};

/**
 * Validate Request Query Parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(
        new AppError(
          errorMessage,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        )
      );
    }

    req.query = value;
    next();
  };
};

/**
 * Validate Request Params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(
        new AppError(
          errorMessage,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        )
      );
    }

    req.params = value;
    next();
  };
};

/**
 * Validate ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return next(
        new AppError(
          `Invalid ${paramName} format`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        )
      );
    }

    next();
  };
};

/**
 * Sanitize Input
 * Remove potentially dangerous characters
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Sanitize Object Helper
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip prototype pollution attempts
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      // Basic XSS prevention
      sanitized[key] = value
        .replace(/[<>]/g, '')
        .trim();
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  validateObjectId,
  sanitizeInput,
};
