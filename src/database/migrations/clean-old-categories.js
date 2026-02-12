/**
 * Clean Old Categories
 * 
 * This script deletes all existing categories from the database.
 * USE WITH CAUTION - This will delete ALL category data!
 * 
 * Run: node src/database/migrations/clean-old-categories.js
 */

// Load environment variables
require('dotenv').config();

const { MongoClient } = require('mongodb');
const { logger } = require('../../utils/logger');
const readline = require('readline');

async function cleanCategories() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  logger.info('Starting categories cleanup...');

  const client = await MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    const vocabularyCollection = db.collection('vocabulary');

    // Count existing data
    const categoryCount = await categoriesCollection.countDocuments();
    const vocabularyCount = await vocabularyCollection.countDocuments();

    logger.info(`Found ${categoryCount} categories and ${vocabularyCount} vocabulary items`);

    if (categoryCount === 0) {
      logger.info('No categories to delete. Database is already clean.');
      return;
    }

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(
        `\n⚠️  WARNING: This will delete ALL ${categoryCount} categories and ${vocabularyCount} vocabulary items!\nAre you sure? Type 'DELETE ALL' to confirm: `,
        (answer) => {
          rl.close();
          resolve(answer);
        }
      );
    });

    if (answer !== 'DELETE ALL') {
      logger.info('Operation cancelled by user.');
      return;
    }

    // Delete all vocabulary items first
    logger.info('Deleting all vocabulary items...');
    const vocabResult = await vocabularyCollection.deleteMany({});
    logger.info(`✅ Deleted ${vocabResult.deletedCount} vocabulary items`);

    // Delete all categories
    logger.info('Deleting all categories...');
    const categoryResult = await categoriesCollection.deleteMany({});
    logger.info(`✅ Deleted ${categoryResult.deletedCount} categories`);

    // Verify deletion
    const remainingCategories = await categoriesCollection.countDocuments();
    const remainingVocabulary = await vocabularyCollection.countDocuments();

    logger.info(`\nCleanup verification:`);
    logger.info(`  Remaining categories: ${remainingCategories}`);
    logger.info(`  Remaining vocabulary: ${remainingVocabulary}`);

    if (remainingCategories === 0 && remainingVocabulary === 0) {
      logger.info('\n✅ Database cleanup completed successfully!');
      logger.info('You can now create new categories with the updated schema.');
    } else {
      logger.warn('\n⚠️  Warning: Some data may not have been deleted.');
    }

  } catch (error) {
    logger.error('Cleanup failed:', error);
    throw error;
  } finally {
    await client.close();
    logger.info('Database connection closed');
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanCategories()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      logger.error('Fatal error during cleanup:', error);
      process.exit(1);
    });
}

module.exports = cleanCategories;
