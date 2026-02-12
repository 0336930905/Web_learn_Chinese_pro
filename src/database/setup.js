/**
 * Database Setup Script
 * Initialize database with indexes and validation
 */

const { connectToDatabase, closeDatabaseConnection } = require('./connection');
const { createIndexes, setupCollectionValidation } = require('./models');
const { logger } = require('../utils/logger');

async function setupDatabase() {
  try {
    logger.info('Starting database setup...');

    // Connect to database
    const { db } = await connectToDatabase();

    // Create indexes
    logger.info('Creating indexes...');
    await createIndexes(db);

    // Setup validation
    logger.info('Setting up collection validation...');
    await setupCollectionValidation(db);

    logger.info('Database setup completed successfully');

    return true;
  } catch (error) {
    logger.error('Database setup failed', { error: error.message });
    throw error;
  } finally {
    await closeDatabaseConnection();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✓ Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Database setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
