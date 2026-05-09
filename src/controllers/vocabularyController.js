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

const normalizePinyinForMatch = (text) => {
  if (!text || typeof text !== 'string') return '';
  let normalized = text.toLowerCase().trim();
  try {
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (_) {}
  return normalized
    .replace(/ü/g, 'v')
    .replace(/[1-5]/g, '')
    .replace(/[^a-z]/g, '');
};

const escapeRegex = (text) => String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

/**
 * Get pinyin suggestions
 * GET /api/vocabulary/pinyin-suggestions/:pinyin
 * Returns hanzi characters that match the given pinyin
 */
const getPinyinSuggestions = asyncHandler(async (req, res) => {
  const { pinyin } = req.params;
  const normalizedInput = normalizePinyinForMatch(pinyin);
  
  if (!normalizedInput) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Pinyin không được để trống' },
    });
  }

  // Truy vấn nhanh theo prefix người dùng gõ; nếu hụt vì dấu/space thì fallback theo chữ cái đầu.
  const primaryRegex = '^' + escapeRegex(String(pinyin || '').trim());
  let suggestions = await req.db.collection('vocabulary')
    .find({
      pinyin: { $regex: primaryRegex, $options: 'i' }
    })
    .project({
      hanzi: 1,
      pinyin: 1,
      meaning: 1,
      vietnamese: 1,
      traditional: 1,
      simplified: 1
    })
    .limit(30)
    .toArray();

  if (!suggestions.length && normalizedInput.length >= 1) {
    const firstLetterRegex = '^' + escapeRegex(normalizedInput[0]);
    suggestions = await req.db.collection('vocabulary')
      .find({
        pinyin: { $regex: firstLetterRegex, $options: 'i' }
      })
      .project({
        hanzi: 1,
        pinyin: 1,
        meaning: 1,
        vietnamese: 1,
        traditional: 1,
        simplified: 1
      })
      .limit(400)
      .toArray();
  }

  // Remove duplicates by hanzi and sort by frequency
  const seen = new Set();
  const results = [];
  
  suggestions.forEach(item => {
    const hanzi = item.hanzi || item.traditional || item.simplified;
    const normalizedPinyin = normalizePinyinForMatch(item.pinyin || '');
    if (hanzi && normalizedPinyin.startsWith(normalizedInput) && !seen.has(hanzi)) {
      seen.add(hanzi);
      results.push({
        hanzi,
        pinyin: item.pinyin,
        meaning: item.meaning,
        vietnamese: item.vietnamese,
      });
    }
  });

  return successResponse(res, results, 'Lấy gợi ý pinyin thành công');
});

module.exports = {
  getAllVocabulary,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  getRandomVocabulary,
  getPinyinSuggestions,
};
