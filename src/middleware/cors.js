/**
 * CORS Middleware
 * Cross-Origin Resource Sharing configuration
 */

const { config } = require('../config');

/**
 * CORS Headers Middleware
 */
const corsMiddleware = (req, res, next) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', config.cors.credentials);
  res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
  res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(','));
  res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(','));

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

module.exports = { corsMiddleware };
