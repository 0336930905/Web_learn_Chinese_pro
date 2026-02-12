/**
 * Category Service
 * Business logic for category operations
 */

const { ObjectId } = require('mongodb');
const { 
  HTTP_STATUS, 
  ERROR_CODES, 
  ERROR_MESSAGES,
  COLLECTIONS,
  SORT_ORDER
} = require('../constants');
const { AppError } = require('../middleware');
const { logger } = require('../utils/logger');

class CategoryService {
  constructor(db) {
    this.db = db;
    this.collection = db.collection(COLLECTIONS.CATEGORIES);
  }

  /**
   * Get all categories
   * Returns ONLY user's private categories (no public categories)
   */
  async getAll(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sortBy = 'order', 
        sortOrder = SORT_ORDER.ASC,
        userId = null
      } = options;

      const skip = (page - 1) * limit;

      // Build filter query - ONLY show user's private categories
      let filter = {};
      if (userId) {
        // User logged in: show ONLY their private categories
        filter = { userId: new ObjectId(userId) };
      } else {
        // Not logged in: return empty array
        return {
          categories: [],
          pagination: { page, limit, total: 0 }
        };
      }

      const [categories, total] = await Promise.all([
        this.collection
          .find(filter)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.collection.countDocuments(filter),
      ]);

      // Populate creator information
      const categoriesWithCreator = await Promise.all(
        categories.map(async (category) => {
          let creator = null;
          if (category.userId) {
            creator = await this.db
              .collection(COLLECTIONS.USERS)
              .findOne(
                { _id: new ObjectId(category.userId) },
                { projection: { fullName: 1, email: 1, avatar: 1 } }
              );
          }
          return {
            ...category,
            creator: creator || null,
          };
        })
      );

      return {
        categories: categoriesWithCreator,
        pagination: {
          page,
          limit,
          total,
        },
      };
    } catch (error) {
      logger.error('Get categories error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getById(categoryId) {
    try {
      const category = await this.collection.findOne({ _id: new ObjectId(categoryId) });

      if (!category) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Get word count
      const wordCount = await this.db
        .collection(COLLECTIONS.VOCABULARY)
        .countDocuments({ categoryId: new ObjectId(categoryId) });

      // Get creator information if it's a private category
      let creator = null;
      if (category.userId) {
        creator = await this.db
          .collection(COLLECTIONS.USERS)
          .findOne(
            { _id: new ObjectId(category.userId) },
            { projection: { fullName: 1, email: 1, avatar: 1 } }
          );
      }

      return {
        ...category,
        wordCount,
        creator,
      };
    } catch (error) {
      logger.error('Get category error', { error: error.message });
      throw error;
    }
  }

  /**
   * Create new category
   * If userId provided, creates private category for that user
   * If no userId (admin), creates public category
   */
  async create(categoryData, userId = null) {
    try {
      // Check if category with same name exists for this user/scope
      const filter = userId 
        ? { name: categoryData.name, userId: new ObjectId(userId) }
        : { name: categoryData.name, isPrivate: false };
      
      const existing = await this.collection.findOne(filter);
      if (existing) {
        throw new AppError(
          'Danh mục đã tồn tại',
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.RESOURCE_ALREADY_EXISTS
        );
      }

      // Auto-calculate order if not provided
      let order = categoryData.order;
      if (!order || order <= 0) {
        // Find the max order in the current scope (user's private or public)
        const scopeFilter = userId 
          ? { userId: new ObjectId(userId) }
          : { isPrivate: false };
        
        const maxOrderCategory = await this.collection
          .find(scopeFilter)
          .sort({ order: -1 })
          .limit(1)
          .toArray();
        
        order = maxOrderCategory.length > 0 ? maxOrderCategory[0].order + 1 : 1;
      }

      const newCategory = {
        name: categoryData.name,
        description: categoryData.description || '',
        icon: categoryData.icon || '',
        color: categoryData.color || 'blue',
        order: order,
        isPrivate: userId ? true : false, // Private if userId provided
        userId: userId ? new ObjectId(userId) : null, // Set userId for private categories
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.collection.insertOne(newCategory);

      logger.info('Category created', { 
        name: categoryData.name, 
        isPrivate: newCategory.isPrivate,
        userId: userId,
        order: order
      });

      // Fetch creator info to return immediately
      let creator = null;
      if (userId) {
        creator = await this.db.collection(COLLECTIONS.USERS).findOne(
          { _id: new ObjectId(userId) },
          { projection: { fullName: 1, email: 1, avatar: 1 } }
        );
      }

      return {
        _id: result.insertedId,
        ...newCategory,
        creator
      };
    } catch (error) {
      logger.error('Create category error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update category
   * Only the owner can update their own category
   */
  async update(categoryId, updates, userId = null, isAdmin = false) {
    try {
      // Check if category exists and user has permission
      const category = await this.collection.findOne({ _id: new ObjectId(categoryId) });
      if (!category) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Check permission - only owner can update
      if (category.userId?.toString() !== userId?.toString()) {
        throw new AppError(
          'Bạn không có quyền cập nhật danh mục này',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTH_UNAUTHORIZED
        );
      }

      const allowedUpdates = ['name', 'description', 'icon', 'color', 'order'];
      const validUpdates = {};

      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          validUpdates[key] = updates[key];
        }
      }

      validUpdates.updatedAt = new Date();

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(categoryId) },
        { $set: validUpdates },
        { returnDocument: 'after' }
      );

      logger.info('Category updated', { categoryId, userId });

      return result;
    } catch (error) {
      logger.error('Update category error', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete category
   * Only the owner can delete their own category
   */
  async delete(categoryId, userId = null, isAdmin = false) {
    try {
      // Check if category exists and user has permission
      const category = await this.collection.findOne({ _id: new ObjectId(categoryId) });
      if (!category) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Check permission - only owner can delete
      if (category.userId?.toString() !== userId?.toString()) {
        throw new AppError(
          'Bạn không có quyền xóa danh mục này',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTH_UNAUTHORIZED
        );
      }

      // Check if category has vocabulary
      const wordCount = await this.db
        .collection(COLLECTIONS.VOCABULARY)
        .countDocuments({ categoryId: new ObjectId(categoryId) });

      if (wordCount > 0) {
        throw new AppError(
          'Không thể xóa danh mục có từ vựng',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const result = await this.collection.deleteOne({ _id: new ObjectId(categoryId) });

      if (result.deletedCount === 0) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      logger.info('Category deleted', { categoryId, userId });

      return true;
    } catch (error) {
      logger.error('Delete category error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get categories for games
   * Returns user's categories + admin's categories + word count
   */
  async getCategoriesForGames(userId) {
    try {
      if (!userId) {
        throw new AppError(
          'Vui lòng đăng nhập để chơi game',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTH_UNAUTHORIZED
        );
      }

      // Get all admin users
      const adminUsers = await this.db
        .collection(COLLECTIONS.USERS)
        .find({ role: 'admin' })
        .project({ _id: 1 })
        .toArray();
      
      const adminIds = adminUsers.map(admin => admin._id);

      // Build filter: user's categories OR admin's categories
      const filter = {
        $or: [
          { userId: new ObjectId(userId) }, // User's own categories
          { userId: { $in: adminIds } }      // Admin categories
        ]
      };

      // Get categories with word count
      const categories = await this.collection
        .find(filter)
        .sort({ order: 1, name: 1 })
        .toArray();

      // Add word count and creator info for each category
      const categoriesWithDetails = await Promise.all(
        categories.map(async (category) => {
          // Get word count
          const wordCount = await this.db
            .collection(COLLECTIONS.VOCABULARY)
            .countDocuments({ categoryId: category._id });

          // Get creator info
          let creator = null;
          if (category.userId) {
            creator = await this.db
              .collection(COLLECTIONS.USERS)
              .findOne(
                { _id: category.userId },
                { projection: { fullName: 1, email: 1, role: 1 } }
              );
          }

          return {
            ...category,
            wordCount,
            creator: creator || null,
            isAdmin: creator?.role === 'admin'
          };
        })
      );

      // Filter out categories with no words
      const categoriesWithWords = categoriesWithDetails.filter(cat => cat.wordCount > 0);

      logger.info('Get categories for games', { 
        userId, 
        totalCategories: categoriesWithWords.length 
      });

      return categoriesWithWords;
    } catch (error) {
      logger.error('Get categories for games error', { error: error.message });
      throw error;
    }
  }
}

module.exports = CategoryService;
