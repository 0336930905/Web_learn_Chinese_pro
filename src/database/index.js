/**
 * Database Index
 * Export database utilities
 */

const { connectToDatabase, closeDatabaseConnection, getDatabase } = require('./connection');
const { Models, createIndexes, setupCollectionValidation } = require('./models');
const { setupDatabase } = require('./setup');

module.exports = {
  // Connection
  connectToDatabase,
  closeDatabaseConnection,
  getDatabase,

  // Models
  Models,
  createIndexes,
  setupCollectionValidation,

  // Setup
  setupDatabase,
};
