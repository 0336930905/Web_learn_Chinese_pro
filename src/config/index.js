/**
 * Application Configuration
 * Centralized configuration management
 */

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: 'v1',
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME || 'learn-taiwanese-pro',
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 15000, // Increased from 5s to 15s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000, // Added connection timeout
      retryWrites: true,
      retryReads: true,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Password Configuration
  password: {
    saltRounds: 10,
    minLength: 8,
    maxLength: 128,
  },

  // Pagination Configuration
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Content-Type',
      'Date',
      'X-Api-Version',
      'Authorization',
    ],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Game Configuration
  game: {
    minWordsForQuiz: 4,
    pointsPerCorrectAnswer: 10,
    streakBonus: 5,
  },

  // Learning Configuration
  learning: {
    dailyGoal: 20, // words per day
    reviewIntervals: [1, 3, 7, 14, 30], // days
    masteryThreshold: 0.8, // 80% accuracy
  },
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

const validateConfig = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  
  if (missing.length > 0 && config.server.env === 'production') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
  
  return true;
};

module.exports = {
  config,
  validateConfig,
};
