/**
 * Main Application Entry Point
 * Clean production-ready handler
 */

const { connectToDatabase } = require('./database');
const { corsMiddleware, errorHandler } = require('./middleware');
const { setupRoutes } = require('./routes');
const { logger } = require('./utils/logger');
const { config } = require('./config');

/**
 * Main request handler for Vercel serverless & localhost
 */
module.exports = async (req, res) => {
  try {
    // Patch response object for compatibility
    if (!res.status) {
      res.status = function (code) {
        res.statusCode = code;
        return res;
      };
    }
    if (!res.json) {
      res.json = function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
    }

    // Apply CORS
    corsMiddleware(req, res, () => {});

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Parse request path & query
    const url = new URL(req.url, `http://${req.headers.host}`);
    let path = url.pathname;
    req.query = Object.fromEntries(url.searchParams);

    // Strip /api prefix for internal routing
    if (path.startsWith('/api')) {
      path = path.substring(4) || '/';
    }
    req.path = path;

    // Parse body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.body) {
      req.body = await parseBody(req);
    }

    // Setup routes and find matching handler
    const routes = setupRoutes(db);
    let handled = false;

    for (const [prefix, router] of Object.entries(routes)) {
      if (req.path.startsWith(prefix)) {
        req.path = req.path.substring(prefix.length) || '/';
        await router.handle(req, res);
        handled = true;
        break;
      }
    }

    if (!handled && req.path === '/') {
      return res.status(200).json({
        success: true,
        message: 'Learn Taiwanese Pro API',
        version: config.server.apiVersion,
        environment: config.server.env,
      });
    }

    if (!handled) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${path} not found`,
        },
      });
    }
  } catch (error) {
    logger.error('Request handler error', {
      error: error.message,
      path: req.path,
      method: req.method,
    });
    errorHandler(error, req, res, () => {});
  }
};

/**
 * Parse request body
 */
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}
