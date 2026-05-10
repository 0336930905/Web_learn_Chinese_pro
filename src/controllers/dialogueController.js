/**
 * Dialogue Controller
 * Handles dialogue folders and practice dialogues
 */

const { asyncHandler } = require('../middleware');
const { successResponse, createdResponse, deletedResponse } = require('../utils/response');
const { HTTP_STATUS, COLLECTIONS } = require('../constants');
const { ObjectId } = require('mongodb');

// ==================== DIALOGUE FOLDERS ====================

/**
 * GET /api/dialogue-folders
 * Returns all dialogue folders for the authenticated user
 */
const getDialogueFolders = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const folders = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS)
    .find({ userId: new ObjectId(req.user._id) })
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  return successResponse(res, folders, 'Lấy danh sách thư mục thoại thành công');
});

/**
 * POST /api/dialogue-folders
 * Create a new dialogue folder
 * Body: { name, description? }
 */
const createDialogueFolder = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Tên thư mục không được trống' },
    });
  }

  // Check for duplicate name
  const existing = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).findOne({
    userId: new ObjectId(req.user._id),
    name: name.trim(),
  });

  if (existing) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      error: { message: 'Thư mục với tên này đã tồn tại' },
    });
  }

  // Get max order
  const maxOrder = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS)
    .find({ userId: new ObjectId(req.user._id) })
    .sort({ order: -1 })
    .limit(1)
    .toArray();

  const folder = {
    userId: new ObjectId(req.user._id),
    name: name.trim(),
    description: description?.trim() || null,
    order: maxOrder.length > 0 ? maxOrder[0].order + 1 : 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).insertOne(folder);

  return createdResponse(res, { ...folder, _id: result.insertedId }, 'Tạo thư mục thoại thành công');
});

/**
 * PATCH /api/dialogue-folders/:id
 * Update a dialogue folder
 * Body: { name?, description? }
 */
const updateDialogueFolder = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;
  const { name, description } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID thư mục không hợp lệ' } });
  }

  // Check ownership
  const folder = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(req.user._id),
  });

  if (!folder) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Thư mục không tìm thấy' } });
  }

  // Check for duplicate name if changing
  if (name && name.trim() !== folder.name) {
    const existing = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).findOne({
      userId: new ObjectId(req.user._id),
      name: name.trim(),
      _id: { $ne: new ObjectId(id) },
    });

    if (existing) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: { message: 'Thư mục với tên này đã tồn tại' },
      });
    }
  }

  const update = {
    ...(name && { name: name.trim() }),
    ...(description !== undefined && { description: description?.trim() || null }),
    updatedAt: new Date(),
  };

  await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );

  const updated = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).findOne({ _id: new ObjectId(id) });

  return successResponse(res, updated, 'Cập nhật thư mục thoại thành công');
});

/**
 * DELETE /api/dialogue-folders/:id
 * Delete a dialogue folder and all its dialogues
 */
const deleteDialogueFolder = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID thư mục không hợp lệ' } });
  }

  // Check ownership
  const folder = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(req.user._id),
  });

  if (!folder) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Thư mục không tìm thấy' } });
  }

  // Delete folder and all dialogues
  await Promise.all([
    req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).deleteOne({ _id: new ObjectId(id) }),
    req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES).deleteMany({ folderId: new ObjectId(id) }),
  ]);

  return deletedResponse(res, 'Xóa thư mục thoại thành công');
});

// ==================== DIALOGUES ====================

/**
 * GET /api/dialogues
 * Returns all dialogues for the authenticated user
 */
const getDialogues = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const dialogues = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES)
    .find({ userId: new ObjectId(req.user._id) })
    .sort({ folderId: 1, order: 1, createdAt: -1 })
    .toArray();

  return successResponse(res, dialogues, 'Lấy danh sách hội thoại thành công');
});

/**
 * POST /api/dialogues
 * Create a new dialogue
 * Body: { folderId, name, entries: [{hanzi, pinyin, vietnamese}, ...], simplified?, difficulty?, notes?, order? }
 */
const createDialogue = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { folderId, name, entries, simplified, difficulty, notes, order } = req.body;

  // Validate required fields
  if (!folderId || !Array.isArray(entries) || entries.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Thiếu thông tin bắt buộc (folderId, entries array không trống)' },
    });
  }

  // Validate entries structure
  const validEntries = entries.filter(e => e.hanzi?.trim() || e.pinyin?.trim() || e.vietnamese?.trim());
  if (validEntries.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { message: 'Ít nhất một mục phải có dữ liệu (hanzi, pinyin hoặc vietnamese)' },
    });
  }

  // Verify folder ownership
  const folder = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUE_FOLDERS).findOne({
    _id: new ObjectId(folderId),
    userId: new ObjectId(req.user._id),
  });

  if (!folder) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: { message: 'Thư mục không tìm thấy' },
    });
  }

  // Get max order in folder if not provided
  let dialogueOrder = order || 0;
  if (!order) {
    const maxOrder = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES)
      .find({ folderId: new ObjectId(folderId) })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    dialogueOrder = maxOrder.length > 0 ? maxOrder[0].order + 1 : 0;
  }

  // Clean and normalize entries
  const cleanedEntries = validEntries.map(e => ({
    hanzi: e.hanzi?.trim() || '',
    pinyin: e.pinyin?.trim() || '',
    vietnamese: e.vietnamese?.trim() || '',
  }));

  // Use first entry as preview (for list display)
  const firstEntry = cleanedEntries[0];

  const dialogue = {
    userId: new ObjectId(req.user._id),
    folderId: new ObjectId(folderId),
    name: name?.trim() || firstEntry.hanzi || 'Cuộc thoại mới',
    hanzi: firstEntry.hanzi,  // Preview
    pinyin: firstEntry.pinyin, // Preview
    vietnamese: firstEntry.vietnamese, // Preview
    entries: cleanedEntries,   // Full entries array
    simplified: simplified?.trim() || null,
    difficulty: difficulty || null,
    notes: notes?.trim() || null,
    order: dialogueOrder,
    entryCount: cleanedEntries.length,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES).insertOne(dialogue);

  return createdResponse(res, { ...dialogue, _id: result.insertedId }, 'Tạo hội thoại thành công');
});

/**
 * PATCH /api/dialogues/:id
 * Update a dialogue
 * Body: { name?, entries?, hanzi?, pinyin?, vietnamese?, simplified?, difficulty?, notes? }
 */
const updateDialogue = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;
  const { name, entries, hanzi, pinyin, vietnamese, simplified, difficulty, notes } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID hội thoại không hợp lệ' } });
  }

  // Check ownership
  const dialogue = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES).findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(req.user._id),
  });

  if (!dialogue) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Hội thoại không tìm thấy' } });
  }

  const update = {
    ...(name !== undefined && { name: name?.trim() || null }),
    updatedAt: new Date(),
  };

  // Handle entries array update
  if (entries && Array.isArray(entries) && entries.length > 0) {
    // Validate and clean entries
    const validEntries = entries.filter(e => e.hanzi?.trim() || e.pinyin?.trim() || e.vietnamese?.trim());
    if (validEntries.length > 0) {
      const cleanedEntries = validEntries.map(e => ({
        hanzi: e.hanzi?.trim() || '',
        pinyin: e.pinyin?.trim() || '',
        vietnamese: e.vietnamese?.trim() || '',
      }));

      // Update entries array and preview fields from first entry
      update.entries = cleanedEntries;
      update.entryCount = cleanedEntries.length;
      update.hanzi = cleanedEntries[0].hanzi;
      update.pinyin = cleanedEntries[0].pinyin;
      update.vietnamese = cleanedEntries[0].vietnamese;
    }
  } else {
    // Update preview fields individually if entries not provided
    if (hanzi) update.hanzi = hanzi.trim();
    if (pinyin) update.pinyin = pinyin.trim();
    if (vietnamese) update.vietnamese = vietnamese.trim();
  }

  // Update other optional fields
  if (simplified !== undefined) update.simplified = simplified?.trim() || null;
  if (difficulty !== undefined) update.difficulty = difficulty || null;
  if (notes !== undefined) update.notes = notes?.trim() || null;

  await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES).updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );

  const updated = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES).findOne({ _id: new ObjectId(id) });

  return successResponse(res, updated, 'Cập nhật hội thoại thành công');
});

/**
 * DELETE /api/dialogues/:id
 * Delete a dialogue
 */
const deleteDialogue = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: 'ID hội thoại không hợp lệ' } });
  }

  // Check ownership
  const dialogue = await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES).findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(req.user._id),
  });

  if (!dialogue) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: 'Hội thoại không tìm thấy' } });
  }

  await req.db.collection(COLLECTIONS.PRACTICE_DIALOGUES).deleteOne({ _id: new ObjectId(id) });

  return deletedResponse(res, 'Xóa hội thoại thành công');
});

// ==================== DIALOGUE SESSIONS ====================

/**
 * GET /api/dialogue-sessions
 * Returns the last dialogue practice sessions for the authenticated user
 */
const getDialogueSessions = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: 'Vui lòng đăng nhập' } });
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter = { userId: new ObjectId(req.user._id) };

  const [sessions, total] = await Promise.all([
    req.db.collection(COLLECTIONS.PRACTICE_SESSIONS)
      .find({ ...filter, sourceType: 'dialogue' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    req.db.collection(COLLECTIONS.PRACTICE_SESSIONS).countDocuments({ ...filter, sourceType: 'dialogue' }),
  ]);

  return successResponse(res, { sessions, pagination: { page, limit, total } }, 'Lấy lịch sử luyện thoại thành công');
});

module.exports = {
  // Folders
  getDialogueFolders,
  createDialogueFolder,
  updateDialogueFolder,
  deleteDialogueFolder,
  // Dialogues
  getDialogues,
  createDialogue,
  updateDialogue,
  deleteDialogue,
  // Sessions
  getDialogueSessions,
};
