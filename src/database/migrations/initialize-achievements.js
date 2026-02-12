/**
 * Migration: Initialize Achievements for Existing Users
 * This script initializes achievement tracking for all existing users
 */

const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');
const { COLLECTIONS } = require('../constants');
const { ACHIEVEMENT_DEFINITIONS } = require('../constants/achievements');

async function initializeAchievementsForUsers() {
  const client = new MongoClient(config.mongodb.uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(config.mongodb.dbName);
    const usersCollection = db.collection(COLLECTIONS.USERS);
    const achievementsCollection = db.collection(COLLECTIONS.ACHIEVEMENTS);
    const activitiesCollection = db.collection(COLLECTIONS.ACTIVITIES);
    
    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\nProcessing user: ${user.email} (${user._id})`);
      
      // Check if user already has achievements
      const existingAchievements = await achievementsCollection.countDocuments({
        userId: user._id
      });
      
      if (existingAchievements > 0) {
        console.log(`  Skipping - user already has ${existingAchievements} achievements`);
        continue;
      }
      
      // Get user's test activities from game_sessions
      const testSessions = await db.collection(COLLECTIONS.GAME_SESSIONS).find({
        userId: user._id,
        gameType: 'test-comprehensive'
      }).toArray();
      
      console.log(`  Found ${testSessions.length} test sessions`);
      
      // Migrate old game sessions to new activities collection
      if (testSessions.length > 0) {
        const activitiesToInsert = testSessions.map(session => ({
          userId: user._id,
          activityType: 'test_completed',
          gameType: 'test',
          categoryId: session.categoryId || null,
          difficulty: session.difficulty || 'mixed',
          score: session.score || 0,
          totalQuestions: session.totalQuestions || 22,
          correctAnswers: session.correctAnswers || 0,
          percentage: Math.round(((session.correctAnswers || 0) / (session.totalQuestions || 22)) * 100),
          answers: session.answers || [],
          duration: session.duration || session.timeTaken || 0,
          xpEarned: session.score || 0, // Use old score as XP
          createdAt: session.createdAt || session.completedAt || new Date()
        }));
        
        try {
          await activitiesCollection.insertMany(activitiesToInsert);
          console.log(`  Migrated ${activitiesToInsert.length} sessions to activities`);
        } catch (err) {
          console.error(`  Error migrating activities: ${err.message}`);
        }
      }
      
      // Get user's activities for checking achievements
      const activities = await activitiesCollection.find({
        userId: user._id
      }).toArray();
      
      // Initialize achievements
      const achievementsToInsert = [];
      
      for (const achievementDef of ACHIEVEMENT_DEFINITIONS) {
        // Check if requirement is met
        const isUnlocked = achievementDef.requirement(activities);
        
        // Calculate progress
        let progress = 0;
        if (!isUnlocked) {
          // Simple progress calculation based on activity count
          if (achievementDef.type.includes('test') || achievementDef.type.includes('champion')) {
            progress = activities.length;
          }
          if (progress > achievementDef.target) progress = achievementDef.target - 1;
        } else {
          progress = achievementDef.target;
        }
        
        const achievement = {
          userId: user._id,
          achievementType: achievementDef.type,
          title: achievementDef.title,
          description: achievementDef.description,
          icon: achievementDef.icon,
          category: achievementDef.category,
          progress: Math.max(0, progress),
          target: achievementDef.target,
          isUnlocked,
          unlockedAt: isUnlocked ? new Date() : null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        achievementsToInsert.push(achievement);
      }
      
      // Insert achievements
      if (achievementsToInsert.length > 0) {
        try {
          await achievementsCollection.insertMany(achievementsToInsert);
          const unlockedCount = achievementsToInsert.filter(a => a.isUnlocked).length;
          console.log(`  Initialized ${achievementsToInsert.length} achievements (${unlockedCount} unlocked)`);
        } catch (err) {
          console.error(`  Error inserting achievements: ${err.message}`);
        }
      }
    }
    
    console.log('\n✅ Achievement initialization completed!');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run migration
if (require.main === module) {
  initializeAchievementsForUsers()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = initializeAchievementsForUsers;
