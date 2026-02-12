/**
 * Category Controller
 * Handles category related requests
 */

const { CategoryService } = require('../services');
const { categoryValidators } = require('../validators');
const { asyncHandler } = require('../middleware');
const { 
  successResponse, 
  createdResponse, 
  updatedResponse, 
  deletedResponse,
  paginatedResponse 
} = require('../utils/response');
const { SUCCESS_MESSAGES, HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const categoryService = new CategoryService(req.db);
  
  // MUST be authenticated to see categories
  if (!req.user || !req.user._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Vui lòng đăng nhập để xem danh mục',
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
      },
    });
  }
  
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 100,
    sortBy: req.query.sortBy || 'order',
    sortOrder: parseInt(req.query.sortOrder) || 1,
    userId: req.user._id, // Always pass userId
  };

  const result = await categoryService.getAll(options);

  return paginatedResponse(
    res,
    result.categories,
    result.pagination,
    'Lấy danh sách danh mục thành công'
  );
});

/**
 * Get category by ID
 * GET /api/categories/:id
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const categoryService = new CategoryService(req.db);
  const category = await categoryService.getById(req.params.id);

  return successResponse(res, category);
});

/**
 * Create new category
 * POST /api/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  // Check authentication
  if (!req.user || !req.user._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Vui lòng đăng nhập để tạo danh mục',
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
      },
    });
  }

  // Validate input
  const validation = categoryValidators.create().validate(req.body);
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

  const categoryService = new CategoryService(req.db);
  
  // Always create private category for current user
  const category = await categoryService.create(validation.data, req.user._id);

  return createdResponse(res, category, SUCCESS_MESSAGES.RESOURCE_CREATED);
});

/**
 * Update category
 * PUT /api/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  // Check authentication
  if (!req.user || !req.user._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Vui lòng đăng nhập để cập nhật danh mục',
      },
    });
  }
  
  // Validate input
  const validation = categoryValidators.update().validate(req.body);
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

  const categoryService = new CategoryService(req.db);
  const userId = req.user._id;
  
  // Only owner can update their category
  const category = await categoryService.update(req.params.id, validation.data, userId, false);

  return updatedResponse(res, category, SUCCESS_MESSAGES.RESOURCE_UPDATED);
});

/**
 * Delete category
 * DELETE /api/categories/:id
 */
const deleteCategory = asyncHandler(async (req, res) => {
  // Check authentication
  if (!req.user || !req.user._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Vui lòng đăng nhập để xóa danh mục',
      },
    });
  }
  
  const categoryService = new CategoryService(req.db);
  const userId = req.user._id;
  
  // Only owner can delete their category
  await categoryService.delete(req.params.id, userId, false);

  return deletedResponse(res, SUCCESS_MESSAGES.RESOURCE_DELETED);
});

/**
 * Get categories for games
 * GET /api/categories/for-games
 * Returns user's categories + admin categories (only those with words)
 */
const getCategoriesForGames = asyncHandler(async (req, res) => {
  // Check authentication
  if (!req.user || !req.user._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Vui lòng đăng nhập để chơi game',
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
      },
    });
  }

  const categoryService = new CategoryService(req.db);
  const categories = await categoryService.getCategoriesForGames(req.user._id);

  return successResponse(res, categories, 'Lấy danh sách bộ đề thành công');
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesForGames,
};
