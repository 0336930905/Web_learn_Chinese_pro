/**
 * Admin Controller
 * Handles admin operations for user management
 */

const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { COLLECTIONS, HTTP_STATUS, USER_ROLES, USER_STATUS } = require('../constants');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all users with pagination, search, and filtering
 */
const getAllUsers = async (req, res) => {
  const db = req.db;
  
  // Parse query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role;
  const status = req.query.status;

  // Build filter
  const filter = {};
  
  // Search by name or email
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by role
  if (role && Object.values(USER_ROLES).includes(role)) {
    filter.role = role;
  }
  
  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Get users with pagination
  const users = await db.collection(COLLECTIONS.USERS)
    .find(filter, { 
      projection: { 
        password: 0 // Exclude password
      } 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  // Get total count
  const total = await db.collection(COLLECTIONS.USERS).countDocuments(filter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new AppError('ID người dùng không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await db.collection(COLLECTIONS.USERS).findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } }
  );

  if (!user) {
    throw new AppError('Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user
  });
};

/**
 * Create new user
 */
const createUser = async (req, res) => {
  const db = req.db;
  const { email, password, fullName, role = USER_ROLES.STUDENT } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new AppError('Email và mật khẩu là bắt buộc', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if email already exists
  const existingUser = await db.collection(COLLECTIONS.USERS).findOne({ email });
  if (existingUser) {
    throw new AppError('Email đã được sử dụng', HTTP_STATUS.CONFLICT);
  }

  // Validate role
  if (!Object.values(USER_ROLES).includes(role)) {
    throw new AppError('Vai trò không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = {
    email,
    password: hashedPassword,
    fullName: fullName || '',
    role,
    status: USER_STATUS.ACTIVE,
    avatar: '',
    settings: {
      theme: 'light',
      language: 'vi',
      voice: 'zh-TW',
      sound: {
        bgMusic: 50,
        gameSFX: 50
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(COLLECTIONS.USERS).insertOne(newUser);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Tạo người dùng thành công',
    data: {
      _id: result.insertedId,
      ...userWithoutPassword
    }
  });
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { email, fullName, role, password } = req.body;

  if (!ObjectId.isValid(id)) {
    throw new AppError('ID người dùng không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user exists
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
  }

  // Prepare update data
  const updateData = {
    updatedAt: new Date()
  };

  if (email && email !== user.email) {
    // Check if new email already exists
    const existingUser = await db.collection(COLLECTIONS.USERS).findOne({ email });
    if (existingUser) {
      throw new AppError('Email đã được sử dụng', HTTP_STATUS.CONFLICT);
    }
    updateData.email = email;
  }

  if (fullName !== undefined) {
    updateData.fullName = fullName;
  }

  if (role && Object.values(USER_ROLES).includes(role)) {
    updateData.role = role;
  }

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  // Update user
  await db.collection(COLLECTIONS.USERS).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  // Get updated user
  const updatedUser = await db.collection(COLLECTIONS.USERS).findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật người dùng thành công',
    data: updatedUser
  });
};

/**
 * Lock user account
 */
const lockUser = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new AppError('ID người dùng không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user exists
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
  }

  // Prevent locking own account
  if (user._id.toString() === req.user.userId.toString()) {
    throw new AppError('Không thể khóa tài khoản của chính mình', HTTP_STATUS.BAD_REQUEST);
  }

  // Lock user
  await db.collection(COLLECTIONS.USERS).updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        status: USER_STATUS.SUSPENDED,
        updatedAt: new Date()
      } 
    }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Khóa tài khoản thành công'
  });
};

/**
 * Unlock user account
 */
const unlockUser = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new AppError('ID người dùng không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user exists
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
  }

  // Unlock user
  await db.collection(COLLECTIONS.USERS).updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        status: USER_STATUS.ACTIVE,
        updatedAt: new Date()
      } 
    }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Mở khóa tài khoản thành công'
  });
};

/**
 * Delete user
 */
const deleteUser = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new AppError('ID người dùng không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user exists
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(id) });
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
  }

  // Prevent deleting own account
  if (user._id.toString() === req.user.userId.toString()) {
    throw new AppError('Không thể xóa tài khoản của chính mình', HTTP_STATUS.BAD_REQUEST);
  }

  // Delete user
  await db.collection(COLLECTIONS.USERS).deleteOne({ _id: new ObjectId(id) });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Xóa người dùng thành công'
  });
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
  const db = req.db;

  const stats = await db.collection(COLLECTIONS.USERS).aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        byRole: [
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { password: 0 } }
        ]
      }
    }
  ]).toArray();

  const result = stats[0];

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      total: result.total[0]?.count || 0,
      byRole: result.byRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byStatus: result.byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentUsers: result.recent
    }
  });
};

/**
 * ========================================
 * CATEGORY MANAGEMENT (ADMIN)
 * Admin can manage ALL categories
 * ========================================
 */

/**
 * Get all categories (Admin view - all users' categories)
 */
const getAllCategories = async (req, res) => {
  const db = req.db;
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const userId = req.query.userId; // Filter by specific user

  // Build filter
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (userId && ObjectId.isValid(userId)) {
    filter.userId = new ObjectId(userId);
  }

  // Get categories with user info
  const categories = await db.collection(COLLECTIONS.CATEGORIES)
    .aggregate([
      { $match: filter },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'userId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.VOCABULARY,
          localField: '_id',
          foreignField: 'categoryId',
          as: 'vocabulary'
        }
      },
      {
        $addFields: {
          ownerName: { $arrayElemAt: ['$owner.fullName', 0] },
          ownerEmail: { $arrayElemAt: ['$owner.email', 0] },
          vocabularyCount: { $size: '$vocabulary' }
        }
      },
      {
        $project: {
          owner: 0,
          vocabulary: 0
        }
      },
      { $sort: { order: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])
    .toArray();

  const total = await db.collection(COLLECTIONS.CATEGORIES).countDocuments(filter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

/**
 * Get category by ID (Admin)
 */
const getCategoryById = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const category = await db.collection(COLLECTIONS.CATEGORIES)
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'userId',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.VOCABULARY,
          localField: '_id',
          foreignField: 'categoryId',
          as: 'vocabulary'
        }
      },
      {
        $addFields: {
          ownerName: { $arrayElemAt: ['$owner.fullName', 0] },
          ownerEmail: { $arrayElemAt: ['$owner.email', 0] },
          vocabularyCount: { $size: '$vocabulary' }
        }
      },
      {
        $project: {
          owner: 0,
          vocabulary: 0
        }
      }
    ])
    .toArray();

  if (!category || category.length === 0) {
    throw new AppError('Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: category[0]
  });
};

/**
 * Create category (Admin)
 */
const createCategory = async (req, res) => {
  const db = req.db;
  const { name, description, difficulty, icon, userId } = req.body;

  // Validate required fields
  if (!name || !userId) {
    throw new AppError('Tên danh mục và userId là bắt buộc', HTTP_STATUS.BAD_REQUEST);
  }

  if (!ObjectId.isValid(userId)) {
    throw new AppError('userId không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user exists
  const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new AppError('Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
  }

  // Check if category name already exists for this user
  const existing = await db.collection(COLLECTIONS.CATEGORIES).findOne({
    name,
    userId: new ObjectId(userId)
  });

  if (existing) {
    throw new AppError('Tên danh mục đã tồn tại cho người dùng này', HTTP_STATUS.CONFLICT);
  }

  // Get max order for this user
  const maxOrderCat = await db.collection(COLLECTIONS.CATEGORIES)
    .findOne({ userId: new ObjectId(userId) }, { sort: { order: -1 } });
  const nextOrder = maxOrderCat ? maxOrderCat.order + 1 : 1;

  const newCategory = {
    name,
    description: description || '',
    difficulty: difficulty || 'beginner',
    icon: icon || 'folder',
    userId: new ObjectId(userId),
    isPrivate: true,
    order: nextOrder,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(COLLECTIONS.CATEGORIES).insertOne(newCategory);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Tạo danh mục thành công',
    data: {
      _id: result.insertedId,
      ...newCategory
    }
  });
};

/**
 * Update category (Admin)
 */
const updateCategory = async (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { name, description, difficulty, icon, order } = req.body;

  // Check if category exists
  const category = await db.collection(COLLECTIONS.CATEGORIES).findOne({ _id: new ObjectId(id) });
  if (!category) {
    throw new AppError('Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
  }

  const updateData = {
    updatedAt: new Date()
  };

  if (name !== undefined) {
    // Check if new name conflicts
    const existing = await db.collection(COLLECTIONS.CATEGORIES).findOne({
      name,
      userId: category.userId,
      _id: { $ne: new ObjectId(id) }
    });
    if (existing) {
      throw new AppError('Tên danh mục đã tồn tại', HTTP_STATUS.CONFLICT);
    }
    updateData.name = name;
  }

  if (description !== undefined) updateData.description = description;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (icon !== undefined) updateData.icon = icon;
  if (order !== undefined) updateData.order = order;

  await db.collection(COLLECTIONS.CATEGORIES).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  const updated = await db.collection(COLLECTIONS.CATEGORIES).findOne({ _id: new ObjectId(id) });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật danh mục thành công',
    data: updated
  });
};

/**
 * Delete category (Admin)
 */
const deleteCategory = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  // Check if category exists
  const category = await db.collection(COLLECTIONS.CATEGORIES).findOne({ _id: new ObjectId(id) });
  if (!category) {
    throw new AppError('Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
  }

  // Check if category has vocabulary
  const vocabCount = await db.collection(COLLECTIONS.VOCABULARY).countDocuments({ categoryId: new ObjectId(id) });
  if (vocabCount > 0) {
    throw new AppError(`Không thể xóa danh mục có ${vocabCount} từ vựng. Vui lòng xóa từ vựng trước.`, HTTP_STATUS.BAD_REQUEST);
  }

  await db.collection(COLLECTIONS.CATEGORIES).deleteOne({ _id: new ObjectId(id) });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Xóa danh mục thành công'
  });
};

/**
 * ========================================
 * VOCABULARY MANAGEMENT (ADMIN)
 * Admin can manage ALL vocabulary
 * ========================================
 */

/**
 * Get all vocabulary (Admin view)
 */
const getAllVocabulary = async (req, res) => {
  const db = req.db;
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const categoryId = req.query.categoryId;
  const difficulty = req.query.difficulty;

  // Build filter
  const filter = {};
  
  if (search) {
    filter.$or = [
      { traditional: { $regex: search, $options: 'i' } },
      { simplified: { $regex: search, $options: 'i' } },
      { pinyin: { $regex: search, $options: 'i' } },
      { meaning: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (categoryId && ObjectId.isValid(categoryId)) {
    filter.categoryId = new ObjectId(categoryId);
  }
  
  if (difficulty) {
    filter.difficulty = difficulty;
  }

  // Get vocabulary with category info
  const vocabulary = await db.collection(COLLECTIONS.VOCABULARY)
    .aggregate([
      { $match: filter },
      {
        $lookup: {
          from: COLLECTIONS.CATEGORIES,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$category.name', 0] }
        }
      },
      {
        $project: {
          category: 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])
    .toArray();

  const total = await db.collection(COLLECTIONS.VOCABULARY).countDocuments(filter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      vocabulary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
};

/**
 * Get vocabulary by ID (Admin)
 */
const getVocabularyById = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const vocabulary = await db.collection(COLLECTIONS.VOCABULARY)
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: COLLECTIONS.CATEGORIES,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$category.name', 0] }
        }
      },
      {
        $project: {
          category: 0
        }
      }
    ])
    .toArray();

  if (!vocabulary || vocabulary.length === 0) {
    throw new AppError('Không tìm thấy từ vựng', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: vocabulary[0]
  });
};

/**
 * Create vocabulary (Admin)
 */
const createVocabulary = async (req, res) => {
  const db = req.db;
  const { categoryId, traditional, simplified, pinyin, meaning, difficulty, example, imageUrl } = req.body;

  // Debug logging
  console.log('[createVocabulary] Received data:', { categoryId, traditional, imageUrl });

  // Validate required fields
  if (!categoryId || !traditional || !pinyin || !meaning) {
    throw new AppError('categoryId, traditional, pinyin và meaning là bắt buộc', HTTP_STATUS.BAD_REQUEST);
  }

  if (!ObjectId.isValid(categoryId)) {
    throw new AppError('categoryId không hợp lệ', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if category exists
  const category = await db.collection(COLLECTIONS.CATEGORIES).findOne({ _id: new ObjectId(categoryId) });
  if (!category) {
    throw new AppError('Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
  }

  const newVocabulary = {
    categoryId: new ObjectId(categoryId),
    traditional,
    simplified: simplified || traditional,
    pinyin,
    meaning,
    difficulty: difficulty || 'beginner',
    example: example || '',
    imageUrl: imageUrl || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection(COLLECTIONS.VOCABULARY).insertOne(newVocabulary);
  
  // Debug logging
  console.log('[createVocabulary] Created vocabulary:', { _id: result.insertedId, traditional, imageUrl: newVocabulary.imageUrl });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Tạo từ vựng thành công',
    data: {
      _id: result.insertedId,
      ...newVocabulary
    }
  });
};

/**
 * Update vocabulary (Admin)
 */
const updateVocabulary = async (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { categoryId, traditional, simplified, pinyin, meaning, difficulty, example, imageUrl } = req.body;

  // Debug logging
  console.log('[updateVocabulary] Update request:', { id, imageUrl });

  // Check if vocabulary exists
  const vocab = await db.collection(COLLECTIONS.VOCABULARY).findOne({ _id: new ObjectId(id) });
  if (!vocab) {
    throw new AppError('Không tìm thấy từ vựng', HTTP_STATUS.NOT_FOUND);
  }

  const updateData = {
    updatedAt: new Date()
  };

  if (categoryId !== undefined) {
    if (!ObjectId.isValid(categoryId)) {
      throw new AppError('categoryId không hợp lệ', HTTP_STATUS.BAD_REQUEST);
    }
    const category = await db.collection(COLLECTIONS.CATEGORIES).findOne({ _id: new ObjectId(categoryId) });
    if (!category) {
      throw new AppError('Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }
    updateData.categoryId = new ObjectId(categoryId);
  }

  if (traditional !== undefined) updateData.traditional = traditional;
  if (simplified !== undefined) updateData.simplified = simplified;
  if (pinyin !== undefined) updateData.pinyin = pinyin;
  if (meaning !== undefined) updateData.meaning = meaning;
  if (difficulty !== undefined) updateData.difficulty = difficulty;
  if (example !== undefined) updateData.example = example;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

  await db.collection(COLLECTIONS.VOCABULARY).updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  const updated = await db.collection(COLLECTIONS.VOCABULARY).findOne({ _id: new ObjectId(id) });

  // Debug logging
  console.log('[updateVocabulary] Updated vocabulary:', { _id: updated._id, imageUrl: updated.imageUrl });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật từ vựng thành công',
    data: updated
  });
};

/**
 * Delete vocabulary (Admin)
 */
const deleteVocabulary = async (req, res) => {
  const db = req.db;
  const { id } = req.params;

  // Check if vocabulary exists
  const vocab = await db.collection(COLLECTIONS.VOCABULARY).findOne({ _id: new ObjectId(id) });
  if (!vocab) {
    throw new AppError('Không tìm thấy từ vựng', HTTP_STATUS.NOT_FOUND);
  }

  await db.collection(COLLECTIONS.VOCABULARY).deleteOne({ _id: new ObjectId(id) });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Xóa từ vựng thành công'
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  lockUser,
  unlockUser,
  deleteUser,
  getUserStats,
  // Category management
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Vocabulary management
  getAllVocabulary,
  getVocabularyById,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary
};
