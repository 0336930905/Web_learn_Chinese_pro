/**
 * Practice Controller
 * Handles vocabulary practice sessions and custom word sets
 */

const { asyncHandler } = require('../middleware');
const { successResponse, createdResponse, deletedResponse } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES, COLLECTIONS } = require('../constants');
const { ObjectId } = require('mongodb');

/**
 * GET /api/practice/sessions
 * Returns the last 50 practice sessions for the authenticated user
 */
const getSessions = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const filter = { userId: new ObjectId(req.user._id) };

  const [sessions, total] = await Promise.all([
    req.db.collection(COLLECTIONS.PRACTICE_SESSIONS)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    req.db.collection(COLLECTIONS.PRACTICE_SESSIONS).countDocuments(filter),
  ]);

  return successResponse(res, { sessions, pagination: { page, limit, total } }, 'Lấy lịch sử luyện tập thành công');
});

/**
 * POST /api/practice/sessions
 * Save the result of a completed practice session
 * Body: { mode, sourceType, categoryId?, customSetId?, totalWords, correctWords, duration, results[] }
 */
const createSession = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { mode, sourceType, categoryId, customSetId, totalWords, correctWords, duration, results } = req.body;

  if (!mode || !sourceType || totalWords == null || correctWords == null) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Thiếu thông tin phiên luyện tập (mode, sourceType, totalWords, correctWords)' },
    });
  }

  const session = {
    userId: new ObjectId(req.user._id),
    mode,                              // 'flashcard' | 'quiz' | 'write'
    sourceType,                        // 'category' | 'custom'
    categoryId: categoryId ? new ObjectId(categoryId) : null,
    customSetId: customSetId ? new ObjectId(customSetId) : null,
    totalWords: parseInt(totalWords),
    correctWords: parseInt(correctWords),
    accuracy: totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0,
    duration: parseInt(duration) || 0,  // seconds
    results: Array.isArray(results) ? results : [],
    createdAt: new Date(),
  };

  const result = await req.db.collection(COLLECTIONS.PRACTICE_SESSIONS).insertOne(session);

  return createdResponse(res, { ...session, _id: result.insertedId }, 'Lưu phiên luyện tập thành công');
});

/**
 * GET /api/practice/sessions/stats
 * Returns aggregate stats for the authenticated user
 */
const getStats = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const userId = new ObjectId(req.user._id);

  const [aggregate] = await req.db.collection(COLLECTIONS.PRACTICE_SESSIONS).aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalWords:    { $sum: '$totalWords' },
        totalCorrect:  { $sum: '$correctWords' },
        totalDuration: { $sum: '$duration' },
        avgAccuracy:   { $avg: '$accuracy' },
      },
    },
  ]).toArray();

  const stats = aggregate || {
    totalSessions: 0, totalWords: 0, totalCorrect: 0, totalDuration: 0, avgAccuracy: 0,
  };
  delete stats._id;
  if (stats.avgAccuracy) stats.avgAccuracy = Math.round(stats.avgAccuracy);

  return successResponse(res, stats, 'Lấy thống kê luyện tập thành công');
});

/**
 * GET /api/practice/custom-sets
 * Returns all saved custom word sets for the authenticated user
 */
const getCustomSets = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const filter = { userId: new ObjectId(req.user._id) };

  // Optional folder filter: ?folderId=unfiled | ?folderId=<id>
  const { folderId } = req.query;
  if (folderId === 'unfiled') {
    filter.$or = [{ folderId: { $exists: false } }, { folderId: null }];
  } else if (folderId) {
    try { filter.folderId = new ObjectId(folderId); } catch { /* ignore invalid id */ }
  }

  const sets = await req.db.collection(COLLECTIONS.PRACTICE_CUSTOM_SETS)
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return successResponse(res, sets, 'Lấy bộ từ tùy chỉnh thành công');
});

/**
 * POST /api/practice/custom-sets
 * Save a new custom word set
 * Body: { name, words: [{ hanzi, pinyin, meaning }] }
 */
const createCustomSet = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { name, words } = req.body;

  if (!name || !name.trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false, error: { message: 'Vui lòng nhập tên bộ từ vựng', field: 'name' },
    });
  }

  if (!Array.isArray(words) || words.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false, error: { message: 'Bộ từ vựng phải có ít nhất 1 từ', field: 'words' },
    });
  }

  // Validate each word
  const sanitizedWords = words.map((w, i) => {
    if (!w.hanzi || !w.hanzi.trim()) {
      throw Object.assign(new Error(`Từ #${i + 1}: Vui lòng nhập chữ Hán`), { status: 400 });
    }
    if (!w.meaning || !w.meaning.trim()) {
      throw Object.assign(new Error(`Từ #${i + 1}: Vui lòng nhập nghĩa`), { status: 400 });
    }
    return {
      hanzi:   w.hanzi.trim(),
      pinyin:  (w.pinyin || '').trim(),
      meaning: w.meaning.trim(),
    };
  });

  const { folderId } = req.body;
  const customSet = {
    userId: new ObjectId(req.user._id),
    name: name.trim(),
    words: sanitizedWords,
    wordCount: sanitizedWords.length,
    folderId: folderId ? (() => { try { return new ObjectId(folderId); } catch { return null; } })() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await req.db.collection(COLLECTIONS.PRACTICE_CUSTOM_SETS).insertOne(customSet);

  return createdResponse(res, { ...customSet, _id: result.insertedId }, 'Tạo bộ từ vựng thành công');
});

/**
 * PUT /api/practice/custom-sets/:id
 * Overwrite an existing custom word set (owner only)
 * Body: { name?, words? }
 */
const updateCustomSet = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;
  let objId;
  try { objId = new ObjectId(id); } catch {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID không hợp lệ' } });
  }

  const { name, words, folderId } = req.body;
  const $set = { updatedAt: new Date() };

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'Tên bộ từ không được trống', field: 'name' } });
    }
    $set.name = name.trim();
  }

  if (words !== undefined) {
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'Bộ từ phải có ít nhất 1 từ', field: 'words' } });
    }
    $set.words = words.map((w, i) => {
      if (!w.hanzi?.trim()) throw Object.assign(new Error(`Từ #${i + 1}: Vui lòng nhập chữ Hán`), { status: 400 });
      if (!w.meaning?.trim()) throw Object.assign(new Error(`Từ #${i + 1}: Vui lòng nhập nghĩa`), { status: 400 });
      return { hanzi: w.hanzi.trim(), pinyin: (w.pinyin || '').trim(), meaning: w.meaning.trim() };
    });
    $set.wordCount = $set.words.length;
  }

  // Allow explicitly setting folderId (null to un-assign, or a folder ObjectId)
  if ('folderId' in req.body) {
    $set.folderId = folderId ? (() => { try { return new ObjectId(folderId); } catch { return null; } })() : null;
  }

  const result = await req.db.collection(COLLECTIONS.PRACTICE_CUSTOM_SETS).findOneAndUpdate(
    { _id: objId, userId: new ObjectId(req.user._id) },
    { $set },
    { returnDocument: 'after' },
  );

  if (!result) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Không tìm thấy bộ từ hoặc bạn không có quyền chỉnh sửa' } });
  }

  return successResponse(res, result, 'Cập nhật bộ từ vựng thành công');
});

/**
 * DELETE /api/practice/custom-sets/:id
 * Delete a custom word set (owner only)
 */
const deleteCustomSet = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;

  let objId;
  try { objId = new ObjectId(id); } catch {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID không hợp lệ' } });
  }

  const result = await req.db.collection(COLLECTIONS.PRACTICE_CUSTOM_SETS).deleteOne({
    _id: objId,
    userId: new ObjectId(req.user._id),
  });

  if (result.deletedCount === 0) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false, error: { message: 'Không tìm thấy bộ từ hoặc bạn không có quyền xóa' },
    });
  }

  return deletedResponse(res, 'Xóa bộ từ vựng thành công');
});

/**
 * GET /api/practice/bookmarks
 * Returns all bookmarked words for the authenticated user
 */
const getBookmarks = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const bookmarks = await req.db.collection(COLLECTIONS.PRACTICE_BOOKMARKS)
    .find({ userId: new ObjectId(req.user._id) })
    .sort({ createdAt: -1 })
    .toArray();

  return successResponse(res, bookmarks, 'Lấy danh sách ghi nhớ thành công');
});

/**
 * POST /api/practice/bookmarks
 * Toggle-add a word to the user's bookmark list.
 * If the word (by hanzi) already exists it is REMOVED (toggle).
 * Body: { hanzi, pinyin?, meaning }
 */
const addBookmark = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { hanzi, pinyin, meaning } = req.body;
  if (!hanzi || !String(hanzi).trim() || !meaning || !String(meaning).trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false, error: { message: 'Thiếu thông tin từ vựng (hanzi, meaning)' },
    });
  }

  const userId = new ObjectId(req.user._id);
  const hanziTrimmed = String(hanzi).trim();

  const existing = await req.db.collection(COLLECTIONS.PRACTICE_BOOKMARKS).findOne({ userId, hanzi: hanziTrimmed });
  if (existing) {
    await req.db.collection(COLLECTIONS.PRACTICE_BOOKMARKS).deleteOne({ _id: existing._id });
    return successResponse(res, { removed: true, hanzi: hanziTrimmed }, 'Đã bỏ ghi nhớ');
  }

  const bookmark = {
    userId,
    hanzi: hanziTrimmed,
    pinyin: String(pinyin || '').trim(),
    meaning: String(meaning).trim(),
    createdAt: new Date(),
  };
  const result = await req.db.collection(COLLECTIONS.PRACTICE_BOOKMARKS).insertOne(bookmark);

  return createdResponse(res, { ...bookmark, _id: result.insertedId }, 'Đã ghi nhớ từ vựng');
});

/**
 * DELETE /api/practice/bookmarks/:id
 * Remove a single bookmark by its _id (owner only)
 */
const deleteBookmark = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;
  let objId;
  try { objId = new ObjectId(id); } catch {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID không hợp lệ' } });
  }

  const result = await req.db.collection(COLLECTIONS.PRACTICE_BOOKMARKS).deleteOne({
    _id: objId,
    userId: new ObjectId(req.user._id),
  });

  if (result.deletedCount === 0) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false, error: { message: 'Không tìm thấy mục ghi nhớ' },
    });
  }

  return deletedResponse(res, 'Đã xóa ghi nhớ thành công');
});

/**
 * DELETE /api/practice/bookmarks
 * Clear ALL bookmarks for the authenticated user
 */
const clearBookmarks = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  await req.db.collection(COLLECTIONS.PRACTICE_BOOKMARKS).deleteMany({
    userId: new ObjectId(req.user._id),
  });

  return deletedResponse(res, 'Đã xóa tất cả ghi nhớ');
});

// ==================== FOLDER CRUD ====================

/**
 * GET /api/practice/folders
 * Returns all custom set folders for the authenticated user
 */
const getFolders = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const folders = await req.db.collection(COLLECTIONS.PRACTICE_FOLDERS)
    .find({ userId: new ObjectId(req.user._id) })
    .sort({ createdAt: 1 })
    .toArray();

  return successResponse(res, folders, 'Lấy danh sách thư mục thành công');
});

/**
 * POST /api/practice/folders
 * Create a new folder
 * Body: { name }
 */
const createFolder = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'Vui lòng nhập tên thư mục' } });
  }

  const folder = {
    userId: new ObjectId(req.user._id),
    name: name.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await req.db.collection(COLLECTIONS.PRACTICE_FOLDERS).insertOne(folder);
  return createdResponse(res, { ...folder, _id: result.insertedId }, 'Tạo thư mục thành công');
});

/**
 * PUT /api/practice/folders/:id
 * Rename an existing folder (owner only)
 * Body: { name }
 */
const updateFolder = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;
  let objId;
  try { objId = new ObjectId(id); } catch {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID không hợp lệ' } });
  }

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'Tên thư mục không được trống' } });
  }

  const result = await req.db.collection(COLLECTIONS.PRACTICE_FOLDERS).findOneAndUpdate(
    { _id: objId, userId: new ObjectId(req.user._id) },
    { $set: { name: name.trim(), updatedAt: new Date() } },
    { returnDocument: 'after' },
  );

  if (!result) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Không tìm thấy thư mục' } });
  }

  return successResponse(res, result, 'Đổi tên thư mục thành công');
});

/**
 * DELETE /api/practice/folders/:id
 * Delete a folder and unassign all sets inside it
 */
const deleteFolder = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;
  let objId;
  try { objId = new ObjectId(id); } catch {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID không hợp lệ' } });
  }

  const folderResult = await req.db.collection(COLLECTIONS.PRACTICE_FOLDERS).deleteOne({
    _id: objId,
    userId: new ObjectId(req.user._id),
  });

  if (folderResult.deletedCount === 0) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Không tìm thấy thư mục' } });
  }

  // Un-assign all sets that belonged to this folder
  await req.db.collection(COLLECTIONS.PRACTICE_CUSTOM_SETS).updateMany(
    { userId: new ObjectId(req.user._id), folderId: objId },
    { $set: { folderId: null, updatedAt: new Date() } },
  );

  return deletedResponse(res, 'Đã xóa thư mục');
});

module.exports = {
  getSessions,
  createSession,
  getStats,
  getCustomSets,
  createCustomSet,
  updateCustomSet,
  deleteCustomSet,
  getBookmarks,
  addBookmark,
  deleteBookmark,
  clearBookmarks,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
};
