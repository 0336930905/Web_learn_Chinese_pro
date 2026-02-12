/**
 * Vocabulary Controller
 * Handles vocabulary related requests
 */

const { VocabularyService } = require('../services');
const { vocabularyValidators } = require('../validators');
const { asyncHandler } = require('../middleware');
const { 
  successResponse, 
  createdResponse, 
  updatedResponse, 
  deletedResponse,
  paginatedResponse 
} = require('../utils/response');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../constants');

/**
 * Get all vocabulary
 * GET /api/vocabulary
 * Only returns vocabulary from user's categories
 */
const getAllVocabulary = asyncHandler(async (req, res) => {
  // Validate query
  const validation = vocabularyValidators.query().validate(req.query);
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

  const vocabularyService = new VocabularyService(req.db);
  
  const filters = {
    categoryId: validation.data.categoryId,
    difficulty: validation.data.difficulty,
    search: validation.data.search,
    page: parseInt(validation.data.page) || 1,
    limit: parseInt(validation.data.limit) || 20,
    userId: req.user._id, // Only get vocabulary from user's categories
  };

  const result = await vocabularyService.getAll(filters);

  return paginatedResponse(
    res,
    result.vocabulary,
    result.pagination,
    'Lấy danh sách từ vựng thành công'
  );
});

/**
 * Get vocabulary by ID
 * GET /api/vocabulary/:id
 * Only returns vocabulary from user's categories
 */
const getVocabularyById = asyncHandler(async (req, res) => {
  const { ObjectId } = require('mongodb');
  const vocabularyService = new VocabularyService(req.db);
  const vocabulary = await vocabularyService.getById(req.params.id);

  // Verify vocabulary belongs to user's category
  const category = await req.db.collection('categories')
    .findOne({ 
      _id: vocabulary.categoryId, 
      userId: typeof req.user._id === 'string' ? new ObjectId(req.user._id) : req.user._id
    });

  if (!category) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: {
        message: 'Bạn không có quyền truy cập từ vựng này',
      },
    });
  }

  return successResponse(res, vocabulary);
});

/**
 * Create new vocabulary
 * POST /api/vocabulary
 * Only allows creating in user's own categories
 */
const createVocabulary = asyncHandler(async (req, res) => {
  // Validate input
  const validation = vocabularyValidators.create().validate(req.body);
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

  const vocabularyService = new VocabularyService(req.db);
  const vocabulary = await vocabularyService.create(validation.data, req.user._id);

  return createdResponse(res, vocabulary, SUCCESS_MESSAGES.RESOURCE_CREATED);
});

/**
 * Update vocabulary
 * PUT /api/vocabulary/:id
 * Only allows updating vocabulary in user's own categories
 */
const updateVocabulary = asyncHandler(async (req, res) => {
  // Validate input
  const validation = vocabularyValidators.update().validate(req.body);
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

  const vocabularyService = new VocabularyService(req.db);
  const vocabulary = await vocabularyService.update(req.params.id, validation.data, req.user._id);

  return updatedResponse(res, vocabulary, SUCCESS_MESSAGES.RESOURCE_UPDATED);
});

/**
 * Delete vocabulary
 * DELETE /api/vocabulary/:id
 * Only allows deleting vocabulary in user's own categories
 */
const deleteVocabulary = asyncHandler(async (req, res) => {
  const vocabularyService = new VocabularyService(req.db);
  await vocabularyService.delete(req.params.id, req.user._id);

  return deletedResponse(res, SUCCESS_MESSAGES.RESOURCE_DELETED);
});

/**
 * Get random vocabulary for games
 * GET /api/vocabulary/random
 * Only returns vocabulary from user's categories
 */
const getRandomVocabulary = asyncHandler(async (req, res) => {
  const vocabularyService = new VocabularyService(req.db);
  
  const count = parseInt(req.query.count) || 10;
  const filters = {
    categoryId: req.query.categoryId,
    difficulty: req.query.difficulty,
    userId: req.user._id, // Only get from user's categories
  };

  const vocabulary = await vocabularyService.getRandom(count, filters);

  return successResponse(res, vocabulary, 'Lấy từ vựng ngẫu nhiên thành công');
});

module.exports = {
  getAllVocabulary,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getRandomVocabulary,
};
