/**
 * Database Models
 * Schema definitions and indexes
 */

const { COLLECTIONS, USER_ROLES, DIFFICULTY_LEVELS, LEARNING_STATUS, ACTIVITY_TYPES, ACHIEVEMENT_TYPES, ACHIEVEMENT_CATEGORIES } = require('../constants');

/**
 * Create database indexes
 */
async function createIndexes(db) {
  try {
    // Users indexes
    await db.collection(COLLECTIONS.USERS).createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { createdAt: -1 } },
    ]);

    // Categories indexes
    await db.collection(COLLECTIONS.CATEGORIES).createIndexes([
      { key: { name: 1, userId: 1, isPrivate: 1 }, unique: true }, // Unique name per user/scope
      { key: { order: 1 } },
      { key: { isPrivate: 1 } },
      { key: { userId: 1 } },
      { key: { isPrivate: 1, userId: 1 } },
      { key: { difficulty: 1 } },
    ]);

    // Vocabulary indexes
    await db.collection(COLLECTIONS.VOCABULARY).createIndexes([
      { key: { categoryId: 1 } },
      { key: { difficulty: 1 } },
      { key: { traditional: 1 } },
      { key: { simplified: 1 } },
      { key: { pinyin: 1 } },
      { key: { traditional: 'text', simplified: 'text', pinyin: 'text', meaning: 'text' } },
    ]);

    // User Progress indexes
    await db.collection(COLLECTIONS.USER_PROGRESS).createIndexes([
      { key: { userId: 1, vocabularyId: 1 }, unique: true },
      { key: { userId: 1, status: 1 } },
      { key: { userId: 1, nextReview: 1 } },
      { key: { lastPracticed: -1 } },
    ]);

    // Game Sessions indexes
    await db.collection(COLLECTIONS.GAME_SESSIONS).createIndexes([
      { key: { userId: 1 } },
      { key: { gameType: 1 } },
      { key: { createdAt: -1 } },
    ]);

    // Activities indexes (only for game_test.html)
    await db.collection(COLLECTIONS.ACTIVITIES).createIndexes([
      { key: { userId: 1 } },
      { key: { activityType: 1 } },
      { key: { gameType: 1 } },
      { key: { categoryId: 1 } },
      { key: { difficulty: 1 } },
      { key: { createdAt: -1 } },
      { key: { userId: 1, createdAt: -1 } },
      { key: { userId: 1, activityType: 1 } },
    ]);

    // Achievements indexes
    await db.collection(COLLECTIONS.ACHIEVEMENTS).createIndexes([
      { key: { userId: 1 } },
      { key: { achievementType: 1 } },
      { key: { userId: 1, achievementType: 1 }, unique: true },
      { key: { isUnlocked: 1 } },
      { key: { category: 1 } },
      { key: { userId: 1, isUnlocked: 1 } },
      { key: { unlockedAt: -1 } },
    ]);

    // Backups indexes
    await db.collection(COLLECTIONS.BACKUPS).createIndexes([
      { key: { createdAt: -1 } },
      { key: { status: 1 } },
      { key: { type: 1 } },
      { key: { name: 1 } },
    ]);

    // Restore logs indexes
    await db.collection(COLLECTIONS.RESTORE_LOGS).createIndexes([
      { key: { backupId: 1 } },
      { key: { startedAt: -1 } },
      { key: { status: 1 } },
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
    throw error;
  }
}

/**
 * Validate collections
 */
async function setupCollectionValidation(db) {
  try {
    // Users validation
    await db.command({
      collMod: COLLECTIONS.USERS,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            },
            password: {
              bsonType: 'string',
            },
            role: {
              enum: Object.values(USER_ROLES),
            },
            fullName: {
              bsonType: 'string',
            },
            avatar: {
              bsonType: 'string',
            },
            settings: {
              bsonType: 'object',
              properties: {
                theme: { enum: ['light', 'dark'] },
                language: { enum: ['en', 'vi', 'tw'] },
                voice: { 
                  bsonType: 'string',
                  description: 'Voice for text-to-speech (e.g., zh-TW for Taiwanese Mandarin)'
                },
                sound: {
                  bsonType: 'object',
                  properties: {
                    bgMusic: { bsonType: ['int', 'double'] },
                    gameSFX: { bsonType: ['int', 'double'] }
                  }
                }
              }
            }
          },
        },
      },
      validationLevel: 'moderate',
    }).catch(() => {
      // Collection might not exist yet, ignore error
    });

    // Categories validation
    await db.command({
      collMod: COLLECTIONS.CATEGORIES,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'userId'],
          properties: {
            name: {
              bsonType: 'string',
            },
            userId: {
              bsonType: 'objectId',
            },
            description: {
              bsonType: 'string',
            },
            isPrivate: {
              bsonType: 'bool',
            },
            difficulty: {
              enum: Object.values(DIFFICULTY_LEVELS),
            },
            order: {
              bsonType: 'int',
            },
            icon: {
              bsonType: 'string',
            }
          },
        },
      },
      validationLevel: 'moderate',
    }).catch(() => {
      // Ignore if collection doesn't exist
    });

    // Vocabulary validation
    await db.command({
      collMod: COLLECTIONS.VOCABULARY,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['categoryId', 'traditional', 'pinyin', 'meaning'],
          properties: {
            categoryId: {
              bsonType: 'objectId',
            },
            traditional: {
              bsonType: 'string',
            },
            simplified: {
              bsonType: 'string',
            },
            pinyin: {
              bsonType: 'string',
            },
            meaning: {
              bsonType: 'string',
            },
            difficulty: {
              enum: Object.values(DIFFICULTY_LEVELS),
            },
            imageUrl: {
              bsonType: 'string',
              description: 'URL of vocabulary image'
            },
            example: {
              bsonType: 'string',
            },
          },
        },
      },
      validationLevel: 'moderate',
    }).catch(() => {
      // Ignore if collection doesn't exist
    });

    // Activities validation (only for game_test.html)
    await db.command({
      collMod: COLLECTIONS.ACTIVITIES,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'activityType', 'gameType', 'score', 'totalQuestions', 'correctAnswers', 'percentage'],
          properties: {
            userId: {
              bsonType: 'objectId',
            },
            activityType: {
              enum: Object.values(ACTIVITY_TYPES),
            },
            gameType: {
              bsonType: 'string',
            },
            categoryId: {
              bsonType: 'objectId',
            },
            difficulty: {
              enum: Object.values(DIFFICULTY_LEVELS),
            },
            score: {
              bsonType: ['int', 'double'],
              minimum: 0,
            },
            totalQuestions: {
              bsonType: 'int',
              minimum: 1,
            },
            correctAnswers: {
              bsonType: 'int',
              minimum: 0,
            },
            percentage: {
              bsonType: ['int', 'double'],
              minimum: 0,
              maximum: 100,
            },
            answers: {
              bsonType: 'array',
            },
            duration: {
              bsonType: ['int', 'double'],
              minimum: 0,
            },
            xpEarned: {
              bsonType: ['int', 'double'],
              minimum: 0,
            },
            createdAt: {
              bsonType: 'date',
            },
          },
        },
      },
      validationLevel: 'moderate',
    }).catch(() => {
      // Ignore if collection doesn't exist
    });

    // Achievements validation
    await db.command({
      collMod: COLLECTIONS.ACHIEVEMENTS,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'achievementType', 'title', 'description', 'category', 'progress', 'target', 'isUnlocked'],
          properties: {
            userId: {
              bsonType: 'objectId',
            },
            achievementType: {
              enum: Object.values(ACHIEVEMENT_TYPES),
            },
            title: {
              bsonType: 'string',
            },
            description: {
              bsonType: 'string',
            },
            icon: {
              bsonType: 'string',
            },
            category: {
              enum: Object.values(ACHIEVEMENT_CATEGORIES),
            },
            progress: {
              bsonType: ['int', 'double'],
              minimum: 0,
            },
            target: {
              bsonType: ['int', 'double'],
              minimum: 1,
            },
            isUnlocked: {
              bsonType: 'bool',
            },
            unlockedAt: {
              bsonType: 'date',
            },
            createdAt: {
              bsonType: 'date',
            },
            updatedAt: {
              bsonType: 'date',
            },
          },
        },
      },
      validationLevel: 'moderate',
    }).catch(() => {
      // Ignore if collection doesn't exist
    });

    // Backups validation
    await db.command({
      collMod: COLLECTIONS.BACKUPS,
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'type', 'status', 'filePath', 'createdAt'],
          properties: {
            name: {
              bsonType: 'string',
            },
            description: {
              bsonType: 'string',
            },
            type: {
              enum: ['manual', 'auto', 'scheduled'],
            },
            status: {
              enum: ['pending', 'in-progress', 'completed', 'failed'],
            },
            filePath: {
              bsonType: 'string',
            },
            size: {
              bsonType: ['int', 'double','long'],
              minimum: 0,
            },
            collections: {
              bsonType: 'array',
            },
            error: {
              bsonType: 'string',
            },
            createdAt: {
              bsonType: 'date',
            },
            updatedAt: {
              bsonType: 'date',
            },
            completedAt: {
              bsonType: 'date',
            },
          },
        },
      },
      validationLevel: 'moderate',
    }).catch(() => {
      // Ignore if collection doesn't exist
    });

    console.log('Collection validation set up successfully');
  } catch (error) {
    console.error('Error setting up validation:', error.message);
  }
}

/**
 * Database Models Export
 */
const Models = {
  Users: COLLECTIONS.USERS,
  Categories: COLLECTIONS.CATEGORIES,
  Vocabulary: COLLECTIONS.VOCABULARY,
  UserProgress: COLLECTIONS.USER_PROGRESS,
  GameSessions: COLLECTIONS.GAME_SESSIONS,
  Activities: COLLECTIONS.ACTIVITIES,
  Achievements: COLLECTIONS.ACHIEVEMENTS,
  Backups: COLLECTIONS.BACKUPS,
  BackupSchedule: COLLECTIONS.BACKUP_SCHEDULE,
  RestoreLogs: COLLECTIONS.RESTORE_LOGS,
};

module.exports = {
  Models,
  createIndexes,
  setupCollectionValidation,
};
