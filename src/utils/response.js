/**
 * Response Utility
 * Standardized API response formatting
 */

const { HTTP_STATUS } = require('../constants');

/**
 * Success Response
 */
const successResponse = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Created Response
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Updated Response
 */
const updatedResponse = (res, data, message = 'Resource updated successfully') => {
  return successResponse(res, data, message, HTTP_STATUS.OK);
};

/**
 * Deleted Response
 */
const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
  });
};

/**
 * Paginated Response
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  });
};

/**
 * Error Response
 */
const errorResponse = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = 'INTERNAL_ERROR') => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
  });
};

/**
 * No Content Response
 */
const noContentResponse = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

module.exports = {
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  paginatedResponse,
  errorResponse,
  noContentResponse,
};
