/**
 * Database Connection
 * Improved MongoDB connection handling
 */

const { MongoClient, ServerApiVersion } = require('mongodb');
const { config, validateConfig } = require('../config');
const { logger } = require('../utils/logger');

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB with retry logic
 */
async function connectToDatabase(retries = 3) {
  try {
    // Return cached connection if available
    if (cachedClient && cachedDb) {
      try {
        // Verify connection is still alive
        await cachedDb.command({ ping: 1 });
        return { client: cachedClient, db: cachedDb };
      } catch (error) {
        // Connection lost, clear cache and reconnect
        logger.warn('Cached connection lost, reconnecting...');
        cachedClient = null;
        cachedDb = null;
      }
    }

    // Validate configuration
    validateConfig();

    logger.info('Connecting to MongoDB...', { 
      uri: config.database.uri.replace(/:\/\/(.+):(.+)@/, '://***:***@'),
      database: config.database.name,
      attempt: 4 - retries
    });

    // Create MongoClient
    const client = new MongoClient(config.database.uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      ...config.database.options,
    });

    // Connect to MongoDB
    await client.connect();
    const db = client.db(config.database.name);

    // Test connection
    await db.command({ ping: 1 });

    // Cache connection
    cachedClient = client;
    cachedDb = db;

    logger.info('MongoDB connected successfully', { 
      database: config.database.name 
    });

    return { client, db };
  } catch (error) {
    logger.error('MongoDB connection error', { 
      error: error.message,
      retriesLeft: retries - 1 
    });

    // Retry if attempts remain
    if (retries > 1) {
      logger.info(`Retrying connection in 2 seconds... (${retries - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectToDatabase(retries - 1);
    }

    // All retries exhausted
    const errorMsg = `Database connection failed after 3 attempts: ${error.message}`;
    logger.error(errorMsg);
    
    // Provide helpful error messages
    if (error.message.includes('timed out')) {
      logger.error('Possible causes:', {
        reasons: [
          '1. MongoDB Atlas cluster is paused (free tier auto-pauses after inactivity)',
          '2. IP address not whitelisted in MongoDB Atlas',
          '3. Network/firewall blocking connection',
          '4. Invalid connection string'
        ]
      });
    }
    
    throw new Error(errorMsg);
  }
}

/**
 * Close database connection
 */
async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    logger.info('MongoDB connection closed');
  }
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!cachedDb) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return cachedDb;
}

module.exports = {
  connectToDatabase,
  closeDatabaseConnection,
  getDatabase,
};
