/**
 * Achievement Service
 * Handle achievement logic and updates for game_test.html
 */

const { ObjectId } = require('mongodb');
const { COLLECTIONS, ACTIVITY_TYPES, ACHIEVEMENT_TYPES } = require('../constants');
const { ACHIEVEMENT_DEFINITIONS, calculateXP } = require('../constants/achievements');

/**
 * Record a test activity (only from game_test.html)
 * @param {Object} db - Database connection
 * @param {ObjectId} userId - User ID
 * @param {Object} testData - Test result data
 * @returns {Promise<Object>} Created activity with XP earned
 */
async function recordTestActivity(db, userId, testData) {
  try {
    
    // Calculate XP earned
    const xpEarned = calculateXP(testData);
    
    // Create activity document
    const activity = {
      userId: new ObjectId(userId),
      activityType: ACTIVITY_TYPES.TEST_COMPLETED,
      gameType: 'test',
      categoryId: testData.categoryId ? new ObjectId(testData.categoryId) : null,
      difficulty: testData.difficulty,
      score: testData.score,
      totalQuestions: testData.totalQuestions,
      correctAnswers: testData.correctAnswers,
      percentage: testData.percentage,
      answers: testData.answers || [],
      duration: testData.duration || null,
      xpEarned,
      createdAt: new Date(),
    };
    
    // Insert activity
    const result = await db.collection(COLLECTIONS.ACTIVITIES).insertOne(activity);
    
    // Check and update achievements
    await checkAndUpdateAchievements(db, userId);
    
    return {
      activityId: result.insertedId,
      xpEarned,
      activity,
    };
  } catch (error) {
    console.error('Error recording test activity:', error);
    throw error;
  }
}

/**
 * Check and update user achievements after completing a test
 * @param {Object} db - Database connection
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} Newly unlocked achievements
 */
async function checkAndUpdateAchievements(db, userId) {
  try {
    const userObjectId = new ObjectId(userId);
    
    // Get all user's test activities
    const activities = await db.collection(COLLECTIONS.ACTIVITIES)
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get user's current achievements
    const existingAchievements = await db.collection(COLLECTIONS.ACHIEVEMENTS)
      .find({ userId: userObjectId })
      .toArray();
    
    const newlyUnlocked = [];
    
    // Check each achievement definition
    for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
      // Skip if already exists
      const existing = existingAchievements.find(a => a.achievementType === achievementDef.type);
      
      if (!existing) {
        // Check if user qualifies for this achievement
        if (achievementDef.requirement(activities)) {
          // Create new achievement (unlocked immediately if requirement met)
          const newAchievement = {
            userId: userObjectId,
            achievementType: achievementDef.type,
            title: achievementDef.title,
            description: achievementDef.description,
            icon: achievementDef.icon,
            category: achievementDef.category,
            progress: achievementDef.target, // Set to target since requirement is met
            target: achievementDef.target,
            isUnlocked: true,
            unlockedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await db.collection(COLLECTIONS.ACHIEVEMENTS).insertOne(newAchievement);
          newlyUnlocked.push(newAchievement);
        } else {
          // Calculate progress for achievements not yet unlocked
          const progress = calculateProgress(achievementDef, activities);
          
          if (progress > 0) {
            // Create achievement with progress
            const newAchievement = {
              userId: userObjectId,
              achievementType: achievementDef.type,
              title: achievementDef.title,
              description: achievementDef.description,
              icon: achievementDef.icon,
              category: achievementDef.category,
              progress,
              target: achievementDef.target,
              isUnlocked: false,
              unlockedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await db.collection(COLLECTIONS.ACHIEVEMENTS).insertOne(newAchievement);
          }
        }
      } else if (!existing.isUnlocked) {
        // Update progress for existing but not unlocked achievements
        const progress = calculateProgress(achievementDef, activities);
        const isNowUnlocked = achievementDef.requirement(activities);
        
        const updateData = {
          progress,
          updatedAt: new Date(),
        };
        
        if (isNowUnlocked) {
          updateData.isUnlocked = true;
          updateData.unlockedAt = new Date();
          newlyUnlocked.push({ ...existing, ...updateData });
        }
        
        await db.collection(COLLECTIONS.ACHIEVEMENTS).updateOne(
          { _id: existing._id },
          { $set: updateData }
        );
      }
    }
    
    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
}

/**
 * Calculate progress for an achievement
 * @param {Object} achievementDef - Achievement definition
 * @param {Array} activities - User activities
 * @returns {number} Current progress
 */
function calculateProgress(achievementDef, activities) {
  switch (achievementDef.type) {
    case ACHIEVEMENT_TYPES.FIRST_TEST:
      return activities.length;
      
    case ACHIEVEMENT_TYPES.TEST_MASTER:
      return activities.length;
      
    case ACHIEVEMENT_TYPES.HUNDRED_TESTS:
      return activities.length;
      
    case ACHIEVEMENT_TYPES.PERFECT_SCORE:
      return activities.filter(a => a.percentage === 100).length;
      
    case ACHIEVEMENT_TYPES.SPEED_RUNNER:
      return activities.filter(a => a.duration && a.duration < 300).length;
      
    case ACHIEVEMENT_TYPES.BEGINNER_CHAMPION:
    case ACHIEVEMENT_TYPES.INTERMEDIATE_CHAMPION:
    case ACHIEVEMENT_TYPES.ADVANCED_CHAMPION:
    case ACHIEVEMENT_TYPES.NATIVE_CHAMPION: {
      // Get difficulty from achievement type
      const difficultyMap = {
        [ACHIEVEMENT_TYPES.BEGINNER_CHAMPION]: 'beginner',
        [ACHIEVEMENT_TYPES.INTERMEDIATE_CHAMPION]: 'intermediate',
        [ACHIEVEMENT_TYPES.ADVANCED_CHAMPION]: 'advanced',
        [ACHIEVEMENT_TYPES.NATIVE_CHAMPION]: 'native',
      };
      const difficulty = difficultyMap[achievementDef.type];
      return activities.filter(a => a.difficulty === difficulty && a.percentage >= 90).length;
    }
      
    case ACHIEVEMENT_TYPES.STREAK_3:
    case ACHIEVEMENT_TYPES.STREAK_7:
    case ACHIEVEMENT_TYPES.STREAK_30: {
      // Calculate current streak
      const dates = activities
        .map(a => new Date(a.createdAt).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort();
      
      let maxStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      
      return maxStreak;
    }
      
    default:
      return 0;
  }
}

/**
 * Get user's activities with pagination
 * @param {Object} db - Database connection
 * @param {ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Activities with pagination info
 */
async function getUserActivities(db, userId, options = {}) {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = options;
    
    const skip = (page - 1) * limit;
    
    const activities = await db.collection(COLLECTIONS.ACTIVITIES)
      .find({ userId: new ObjectId(userId) })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const totalCount = await db.collection(COLLECTIONS.ACTIVITIES)
      .countDocuments({ userId: new ObjectId(userId) });
    
    return {
      activities,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    };
  } catch (error) {
    console.error('Error getting user activities:', error);
    throw error;
  }
}

/**
 * Get user's achievements
 * @param {Object} db - Database connection
 * @param {ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} User achievements
 */
async function getUserAchievements(db, userId, options = {}) {
  try {
    const { category = null, unlockedOnly = false } = options;
    
    const query = { userId: new ObjectId(userId) };
    
    if (category) {
      query.category = category;
    }
    
    if (unlockedOnly) {
      query.isUnlocked = true;
    }
    
    const achievements = await db.collection(COLLECTIONS.ACHIEVEMENTS)
      .find(query)
      .sort({ isUnlocked: -1, unlockedAt: -1, progress: -1 })
      .toArray();
    
    return achievements;
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
}

/**
 * Get user's statistics
 * @param {Object} db - Database connection
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
async function getUserStats(db, userId) {
  try {
    const userObjectId = new ObjectId(userId);
    
    // Get all activities
    const activities = await db.collection(COLLECTIONS.ACTIVITIES)
      .find({ userId: userObjectId })
      .toArray();
    
    // Get achievements
    const achievements = await db.collection(COLLECTIONS.ACHIEVEMENTS)
      .find({ userId: userObjectId })
      .toArray();
    
    const unlockedAchievements = achievements.filter(a => a.isUnlocked);
    
    // Calculate total XP
    const totalXP = activities.reduce((sum, activity) => sum + (activity.xpEarned || 0), 0);
    
    // Calculate average score
    const avgScore = activities.length > 0
      ? activities.reduce((sum, a) => sum + a.percentage, 0) / activities.length
      : 0;
    
    // Get best score
    const bestScore = activities.length > 0
      ? Math.max(...activities.map(a => a.percentage))
      : 0;
    
    // Count by difficulty
    const byDifficulty = {
      beginner: activities.filter(a => a.difficulty === 'beginner').length,
      intermediate: activities.filter(a => a.difficulty === 'intermediate').length,
      advanced: activities.filter(a => a.difficulty === 'advanced').length,
      native: activities.filter(a => a.difficulty === 'native').length,
    };
    
    // Calculate current streak
    const dates = activities
      .map(a => new Date(a.createdAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort()
      .reverse(); // Most recent first
    
    let currentStreak = 0;
    const today = new Date().toDateString();
    
    if (dates.length > 0 && dates[0] === today) {
      currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    return {
      totalTests: activities.length,
      totalXP,
      averageScore: Math.round(avgScore * 10) / 10,
      bestScore,
      currentStreak,
      byDifficulty,
      achievements: {
        total: ACHIEVEMENT_DEFINITIONS.length,
        unlocked: unlockedAchievements.length,
        percentage: Math.round((unlockedAchievements.length / ACHIEVEMENT_DEFINITIONS.length) * 100),
      },
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

module.exports = {
  recordTestActivity,
  checkAndUpdateAchievements,
  getUserActivities,
  getUserAchievements,
  getUserStats,
};
