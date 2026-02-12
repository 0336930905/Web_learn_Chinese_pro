/**
 * Migration: Add settings field to existing users
 * Run this script to add default settings to users who don't have them
 */

const { connectToDatabase, closeDatabaseConnection } = require('../connection');
const { COLLECTIONS } = require('../../constants');
const { logger } = require('../../utils/logger');

async function addSettingsToUsers() {
  let db;
  
  try {
    db = await connectToDatabase();
    const usersCollection = db.collection(COLLECTIONS.USERS);

    // Find all users without settings field or with null/undefined settings
    const usersWithoutSettings = await usersCollection.find({
      $or: [
        { settings: { $exists: false } },
        { settings: null }
      ]
    }).toArray();

    logger.info(`Found ${usersWithoutSettings.length} users without settings`);

    if (usersWithoutSettings.length === 0) {
      logger.info('All users already have settings. No migration needed.');
      return;
    }

    // Default settings
    const defaultSettings = {
      theme: 'light',
      language: 'vi',
      sound: {
        bgMusic: 75,
        gameSFX: 90
      }
    };

    // Update users in bulk
    const bulkOps = usersWithoutSettings.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            settings: defaultSettings,
            updatedAt: new Date()
          }
        }
      }
    }));

    const result = await usersCollection.bulkWrite(bulkOps);

    logger.info(`Migration completed successfully!`);
    logger.info(`Modified ${result.modifiedCount} users`);

  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    if (db) {
      await closeDatabaseConnection();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  addSettingsToUsers()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addSettingsToUsers };
