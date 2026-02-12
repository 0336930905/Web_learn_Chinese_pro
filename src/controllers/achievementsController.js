/**
 * Achievements Controller
 * Handle user achievements, stats, and progress tracking
 */

const { ObjectId } = require('mongodb');
const { COLLECTIONS, DIFFICULTY_LEVELS } = require('../constants');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user achievements and statistics
 */
async function getUserAchievements(req, res) {
  try {
    const userId = new ObjectId(req.user.userId);
    const db = req.db;

    // Get user info with stats
    const user = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: userId },
      { projection: { fullName: 1, avatar: 1, email: 1, stats: 1 } }
    );

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Calculate total words learned (unique vocabulary with progress)
    const wordsLearned = await db.collection(COLLECTIONS.USER_PROGRESS).countDocuments({
      userId: userId
    });

    // Calculate accuracy from game sessions
    const gameSessions = await db.collection(COLLECTIONS.GAME_SESSIONS).find({
      userId: userId
    }).toArray();

    let totalQuestions = 0;
    let correctAnswers = 0;
    let totalGamesPlayed = gameSessions.length;

    gameSessions.forEach(session => {
      if (session.answers && Array.isArray(session.answers)) {
        totalQuestions += session.answers.length;
        correctAnswers += session.answers.filter(a => a.correct).length;
      }
    });

    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Calculate total practice time (in hours)
    const totalPracticeMinutes = gameSessions.reduce((sum, session) => {
      return sum + (session.duration || 0);
    }, 0);
    const totalPracticeHours = (totalPracticeMinutes / 60).toFixed(1);

    // Get learning progress by difficulty (based on test results)
    // This tracks actual test performance by difficulty level
    const testResultsByDifficulty = await db.collection(COLLECTIONS.GAME_SESSIONS).aggregate([
      { 
        $match: { 
          userId: userId,
          gameType: 'test-comprehensive',
          difficulty: { $in: ['beginner', 'intermediate', 'advanced'] }
        } 
      },
      {
        $group: {
          _id: '$difficulty',
          totalQuestions: { $sum: '$totalQuestions' },
          correctAnswers: { 
            $sum: { 
              $size: {
                $filter: {
                  input: { $ifNull: ['$answers', []] },
                  as: 'answer',
                  cond: { $eq: ['$$answer.correct', true] }
                }
              }
            }
          }
        }
      }
    ]).toArray();

    // Also get total available questions per difficulty from vocabulary
    // This gives us the "total possible" for each difficulty
    const totalByDifficulty = await db.collection(COLLECTIONS.VOCABULARY).aggregate([
      {
        $lookup: {
          from: COLLECTIONS.CATEGORIES,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.difficulty',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Create difficulty progress map with correct database values
    const difficultyMapping = [
      { dbValue: DIFFICULTY_LEVELS.BEGINNER, displayName: 'Easy' },
      { dbValue: DIFFICULTY_LEVELS.INTERMEDIATE, displayName: 'Medium' },
      { dbValue: DIFFICULTY_LEVELS.ADVANCED, displayName: 'Hard' }
    ];
    
    const difficultyProgress = difficultyMapping.map(({ dbValue, displayName }) => {
      const testData = testResultsByDifficulty.find(t => t._id === dbValue);
      const learned = testData?.correctAnswers || 0;
      const total = totalByDifficulty.find(t => t._id === dbValue)?.count || 1; // Avoid division by zero
      
      return {
        level: displayName,
        learned,
        total,
        percentage: total > 0 ? Math.round((learned / total) * 100) : 0
      };
    });

    // Calculate streak (consecutive days with practice)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get sessions grouped by date
    const sessionsLast30Days = await db.collection(COLLECTIONS.GAME_SESSIONS).aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]).toArray();

    const practiceDays = sessionsLast30Days.map(s => s._id);
    
    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (practiceDays.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    practiceDays.sort().forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (!lastDate || (currentDate - lastDate) / (1000 * 60 * 60 * 24) === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
      
      lastDate = currentDate;
    });

    // Calculate perfect days (days with 90%+ accuracy)
    const perfectDays = await db.collection(COLLECTIONS.GAME_SESSIONS).aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalAnswers: { $sum: { $size: { $ifNull: ['$answers', []] } } },
          correctAnswers: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ['$answers', []] },
                  as: 'answer',
                  cond: { $eq: ['$$answer.correct', true] }
                }
              }
            }
          }
        }
      },
      {
        $match: {
          totalAnswers: { $gt: 0 },
          $expr: {
            $gte: [
              { $divide: ['$correctAnswers', '$totalAnswers'] },
              0.9
            ]
          }
        }
      },
      { $count: 'perfectDays' }
    ]).toArray();

    const perfectDaysCount = perfectDays.length > 0 ? perfectDays[0].perfectDays : 0;

    // Get recent game sessions (last 5 for display)
    const recentSessions = await db.collection(COLLECTIONS.GAME_SESSIONS).aggregate([
      { $match: { userId: userId } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          gameType: 1,
          score: 1,
          createdAt: 1,
          totalQuestions: { $size: { $ifNull: ['$answers', []] } },
          correctAnswers: {
            $size: {
              $filter: {
                input: { $ifNull: ['$answers', []] },
                as: 'answer',
                cond: { $eq: ['$$answer.correct', true] }
              }
            }
          }
        }
      }
    ]).toArray();

    // Format recent activity
    const recentActivity = recentSessions.map(session => ({
      gameType: session.gameType,
      score: session.correctAnswers || 0,
      total: session.totalQuestions || 0,
      accuracy: session.totalQuestions > 0 
        ? Math.round((session.correctAnswers / session.totalQuestions) * 100) 
        : 0,
      date: session.createdAt
    }));

    // Get XP and level from user stats if available, otherwise calculate from game sessions
    let totalXP, level, currentLevelXP;
    const nextLevelXP = 1000;
    
    if (user.stats && typeof user.stats.experience === 'number') {
      // Use stored stats from user document
      totalXP = user.stats.experience;
      level = user.stats.level || Math.floor(totalXP / 1000) + 1;
      currentLevelXP = totalXP % 1000;
    } else {
      // Fallback: Calculate XP from game sessions (10 XP per correct answer)
      totalXP = correctAnswers * 10;
      level = Math.floor(totalXP / 1000) + 1;
      currentLevelXP = totalXP % 1000;
    }

    // Calculate badges/achievements
    const badges = [];
    
    if (wordsLearned >= 10) badges.push({ icon: '📚', name: 'First Steps', unlocked: true });
    if (wordsLearned >= 50) badges.push({ icon: '🎯', name: 'Learner', unlocked: true });
    if (wordsLearned >= 100) badges.push({ icon: '🌟', name: 'Scholar', unlocked: true });
    if (wordsLearned >= 300) badges.push({ icon: '👑', name: 'Master', unlocked: true });
    
    if (currentStreak >= 3) badges.push({ icon: '🔥', name: '3 Day Streak', unlocked: true });
    if (currentStreak >= 7) badges.push({ icon: '⚡', name: 'Week Warrior', unlocked: true });
    if (currentStreak >= 30) badges.push({ icon: '💎', name: 'Consistent', unlocked: true });
    
    if (accuracy >= 80) badges.push({ icon: '🎪', name: 'Sharp Mind', unlocked: true });
    if (accuracy >= 90) badges.push({ icon: '🏆', name: 'Perfectionist', unlocked: true });
    
    if (totalGamesPlayed >= 10) badges.push({ icon: '🎮', name: 'Game On', unlocked: true });
    if (totalGamesPlayed >= 50) badges.push({ icon: '🎯', name: 'Dedicated', unlocked: true });

    // Add locked badges
    if (wordsLearned < 500) badges.push({ icon: '👑', name: 'Vocabulary King', unlocked: false });
    if (currentStreak < 60) badges.push({ icon: '🔥', name: '60 Day Streak', unlocked: false });
    if (accuracy < 95) badges.push({ icon: '💯', name: 'Perfect Score', unlocked: false });

    return successResponse(res, {
      user: {
        fullName: user.fullName || 'User',
        email: user.email,
        avatar: user.avatar || null
      },
      stats: {
        level,
        currentXP: currentLevelXP,
        nextLevelXP,
        totalXP,
        wordsLearned,
        totalPracticeHours: parseFloat(totalPracticeHours),
        accuracy,
        perfectDays: perfectDaysCount,
        totalGamesPlayed,
        currentStreak,
        longestStreak
      },
      difficultyProgress,
      badges,
      recentActivity,
      calendar: practiceDays // Array of date strings with practice
    }, 'Achievements fetched successfully');

  } catch (error) {
    console.error('Error fetching achievements:', error);
    console.error('Error stack:', error.stack);
    return errorResponse(res, error.message || 'Failed to fetch achievements', 500, 'ACHIEVEMENTS_ERROR');
  }
}

module.exports = {
  getUserAchievements
};
