/**
 * Reset and Migrate Categories
 * 
 * This script performs a complete reset and migration:
 * 1. Cleans all old categories
 * 2. Runs the private categories migration
 * 3. Sets up the database for the new schema
 * 
 * Run: node src/database/migrations/reset-categories.js
 */

// Load environment variables
require('dotenv').config();

const { logger } = require('../../utils/logger');
const cleanCategories = require('./clean-old-categories');
const migratePrivateCategories = require('./add-private-categories');

async function resetAndMigrate() {
  try {
    logger.info('========================================');
    logger.info('Starting Complete Categories Reset');
    logger.info('========================================\n');

    // Step 1: Clean old data
    logger.info('Step 1: Cleaning old categories...');
    await cleanCategories();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Run migration
    logger.info('\nStep 2: Running private categories migration...');
    await migratePrivateCategories();

    logger.info('\n========================================');
    logger.info('✅ Complete Reset and Migration Finished!');
    logger.info('========================================');
    logger.info('\nYou can now:');
    logger.info('1. Start your server: npm start');
    logger.info('2. Create new categories with the updated schema');
    logger.info('3. Private categories will be automatically created for users');
    logger.info('4. Public categories will be created by admins\n');

  } catch (error) {
    logger.error('Reset and migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  resetAndMigrate()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = resetAndMigrate;
