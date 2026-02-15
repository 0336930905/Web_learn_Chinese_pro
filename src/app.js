/**
 * Main Application Entry Point
 * Improved structure with proper error handling and middleware
 */

const { connectToDatabase } = require('./database');
const { corsMiddleware, errorHandler } = require('./middleware');
const { setupRoutes } = require('./routes');
const { logger } = require('./utils/logger');
const { config } = require('./config');

/**
 * Main request handler for Vercel serverless
 */
module.exports = async (req, res) => {
  try {
    // Apply CORS
    corsMiddleware(req, res, () => {});

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Parse request path
    const url = new URL(req.url, `http://${req.headers.host}`);
    let rawPath = url.pathname;
    req.query = Object.fromEntries(url.searchParams);

    // Normalize: strip /api prefix for internal routing
    // Both localhost (server.js sends /api/auth/google) and Vercel (sends /api/auth/google)
    // will have /api prefix. We strip it so routes match /auth, /categories, etc.
    if (rawPath.startsWith('/api')) {
      rawPath = rawPath.substring(4) || '/';
    }
    req.path = rawPath;

    // Log raw request details for debugging
    console.log('🔍 REQUEST:', {
      'req.url': req.url,
      'parsed.pathname': url.pathname,
      'stripped.path': req.path,
      method: req.method,
      host: req.headers.host
    });

    // Parse body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.body) {
      req.body = await parseBody(req);
    }

    // Setup routes
    const routes = setupRoutes(db);

    // Log the incoming request
    console.log('📨 Routing request:', {
      method: req.method,
      path: req.path,
      availableRoutes: Object.keys(routes)
    });

    // Find matching route prefix
    let handled = false;
    for (const [prefix, router] of Object.entries(routes)) {
      if (req.path.startsWith(prefix)) {
        const routePath = req.path;
        req.path = req.path.substring(prefix.length) || '/';
        console.log(`🔀 Routing: ${routePath} → prefix: ${prefix}, new path: ${req.path}`);
        await router.handle(req, res);
        handled = true;
        break;
      }
    }

    // If no route matched and it's a root request, return API info
    if (!handled && req.path === '/') {
      return res.status(200).json({
        success: true,
        message: 'Learn Taiwanese Pro API',
        version: config.server.apiVersion,
        environment: config.server.env,
        endpoints: {
          auth: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile (Auth required)',
          },
          categories: {
            list: 'GET /api/categories (Auth required - returns user\'s private categories)',
            detail: 'GET /api/categories/:id',
            create: 'POST /api/categories (Auth required)',
            update: 'PUT /api/categories/:id (Auth required)',
            delete: 'DELETE /api/categories/:id (Auth required)',
          },
          vocabulary: {
            list: 'GET /api/vocabulary (Auth required - returns vocabulary from user\'s categories)',
            detail: 'GET /api/vocabulary/:id (Auth required)',
            random: 'GET /api/vocabulary/random (Auth required)',
            create: 'POST /api/vocabulary (Auth required - must own category)',
            update: 'PUT /api/vocabulary/:id (Auth required - must own category)',
            delete: 'DELETE /api/vocabulary/:id (Auth required - must own category)',
          },
          progress: {
            list: 'GET /api/progress (Auth required)',
            update: 'POST /api/progress/update (Auth required)',
            review: 'GET /api/progress/review (Auth required)',
            stats: 'GET /api/progress/stats (Auth required)',
          },
          games: {
            listeningQuiz: 'GET /api/games/listening-quiz',
            matching: 'GET /api/games/matching',
            fillInBlanks: 'GET /api/games/fill-in-blanks',
            vocabularyCards: 'GET /api/games/vocabulary-cards',
            reverseQuiz: 'GET /api/games/reverse-quiz',
            saveSession: 'POST /api/games/session (Auth required)',
            history: 'GET /api/games/history (Auth required)',
          },
          dashboard: {
            userStats: 'GET /api/dashboard/stats (Auth required)',
            adminStats: 'GET /api/dashboard/admin (Admin only)',
          },
          settings: {
            get: 'GET /api/settings (Auth required)',
            update: 'PUT /api/settings (Auth required)',
          },
          achievements: {
            get: 'GET /api/achievements (Auth required)',
          },
          chatbot: {
            health: 'GET /api/chatbot/health (Auth required)',
            message: 'POST /api/chatbot/message (Auth required)',
            suggestVocabulary: 'POST /api/chatbot/suggest-vocabulary (Auth required)',
            explainWord: 'POST /api/chatbot/explain-word (Auth required)',
            learningTips: 'GET /api/chatbot/learning-tips (Auth required)',
          },
        },
        documentation: 'https://github.com/yourrepo/docs',
      });
    }

    if (!handled) {
      console.error('❌ No route handler found:', {
        method: req.method,
        path: req.path,
        url: req.url,
        availableRoutes: Object.keys(routes),
        timestamp: new Date().toISOString()
      });

      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.path} not found`,
          debug: {
            path: req.path,
            url: req.url
          }
        }
      });
    }
  } catch (error) {
    logger.error('Request handler error', {
      error: error.message,
      stack: error.stack,
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
