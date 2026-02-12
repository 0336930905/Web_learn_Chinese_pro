/**
 * Routes Index
 * Central routing configuration
 */

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const categoryRoutes = require('./category.routes');
const vocabularyRoutes = require('./vocabulary.routes');
const progressRoutes = require('./progress.routes');
const gameRoutes = require('./game.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');
const achievementsRoutes = require('./achievements.routes');
const activityRoutes = require('./activity');
const chatbotRoutes = require('./chatbot.routes');
const backupRoutes = require('./backup.routes');

/**
 * Simple router implementation for serverless
 */
class Router {
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
      PATCH: {},
    };
    this.middlewares = [];
  }

  use(pathOrMiddleware, middleware) {
    if (typeof pathOrMiddleware === 'function') {
      this.middlewares.push({ path: '', handler: pathOrMiddleware });
    } else {
      this.middlewares.push({ path: pathOrMiddleware, handler: middleware });
    }
  }

  get(path, ...handlers) {
    this.routes.GET[path] = handlers;
  }

  post(path, ...handlers) {
    this.routes.POST[path] = handlers;
  }

  put(path, ...handlers) {
    this.routes.PUT[path] = handlers;
  }

  delete(path, ...handlers) {
    this.routes.DELETE[path] = handlers;
  }

  patch(path, ...handlers) {
    this.routes.PATCH[path] = handlers;
  }

  async handle(req, res) {
    const method = req.method;
    const path = req.path || req.url;

    try {
      // Execute middlewares
      for (const mw of this.middlewares) {
        if (!mw.path || path.startsWith(mw.path)) {
          await new Promise((resolve, reject) => {
            let nextCalled = false;
            
            const next = (err) => {
              if (nextCalled) return; // Prevent double calling
              nextCalled = true;
              
              if (err) reject(err);
              else resolve();
            };
            
            try {
              const result = mw.handler(req, res, next);
              
              // If handler returns a promise, wait for it
              if (result && typeof result.then === 'function') {
                result.then(() => {
                  if (!nextCalled) resolve(); // Auto-resolve if next wasn't called
                }).catch(reject);
              }
              // If response already sent, resolve immediately
              else if (res.writableEnded || res.headersSent) {
                if (!nextCalled) resolve();
              }
              // If synchronous and didn't call next, we need to wait a tick
              else {
                // Use setImmediate to allow next() to be called
                setImmediate(() => {
                  if (!nextCalled) {
                    // Middleware didn't call next, assume success
                    resolve();
                  }
                });
              }
            } catch (error) {
              reject(error);
            }
          });
          
          // Stop if response sent
          if (res.writableEnded || res.headersSent) return;
        }
      }

      // Find matching route
      const routes = this.routes[method] || {};
      
      for (const [routePath, handlers] of Object.entries(routes)) {
        const match = this.matchPath(routePath, path);
        if (match) {
          req.params = match.params;
          
          // Execute handlers
          for (const handler of handlers) {
            await new Promise((resolve, reject) => {
              let nextCalled = false;
              
              const next = (err) => {
                if (nextCalled) return;
                nextCalled = true;
                
                if (err) reject(err);
                else resolve();
              };
              
              try {
                const result = handler(req, res, next);
                
                // If handler returns a promise, wait for it
                if (result && typeof result.then === 'function') {
                  result.then(() => {
                    if (!nextCalled) resolve();
                  }).catch(reject);
                }
                // If response already sent, resolve immediately
                else if (res.writableEnded || res.headersSent) {
                  if (!nextCalled) resolve();
                }
                // If synchronous and didn't call next
                else {
                  setImmediate(() => {
                    if (!nextCalled) resolve();
                  });
                }
              } catch (error) {
                reject(error);
              }
            });
            
            // If response already sent, stop executing further handlers
            if (res.writableEnded || res.headersSent) {
              return;
            }
          }
          return;
        }
      }

      // No route found
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${method} ${path} not found`,
        },
      });
    } catch (error) {
      console.error('Router error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error.message || 'Internal server error',
          },
        });
      }
    }
  }

  matchPath(routePath, requestPath) {
    const routeParts = routePath.split('/').filter(Boolean);
    const requestParts = requestPath.split('/').filter(Boolean);

    if (routeParts.length !== requestParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = requestParts[i];
      } else if (routeParts[i] !== requestParts[i]) {
        return null;
      }
    }

    return { params };
  }
}

/**
 * Setup all routes
 */
function setupRoutes(db) {
  const router = new Router();

  // Setup route handlers
  const authRouter = new Router();
  const adminRouter = new Router();
  const categoryRouter = new Router();
  const vocabularyRouter = new Router();
  const progressRouter = new Router();
  const gameRouter = new Router();
  const dashboardRouter = new Router();
  const settingsRouter = new Router();
  const achievementsRouter = new Router();
  const activityRouter = new Router();
  const chatbotRouter = new Router();
  const backupRouter = new Router();

  authRoutes(authRouter, db);
  adminRoutes(adminRouter, db);
  categoryRoutes(categoryRouter, db);
  vocabularyRoutes(vocabularyRouter, db);
  progressRoutes(progressRouter, db);
  gameRoutes(gameRouter, db);
  dashboardRoutes(dashboardRouter, db);
  settingsRoutes(settingsRouter, db);
  achievementsRoutes(achievementsRouter, db);
  activityRoutes(activityRouter, db);
  chatbotRoutes(chatbotRouter, db);
  backupRoutes(backupRouter, db);

  return {
    '/api/auth': authRouter,
    '/api/admin': adminRouter,
    '/api/categories': categoryRouter,
    '/api/vocabulary': vocabularyRouter,
    '/api/progress': progressRouter,
    '/api/games': gameRouter,
    '/api/dashboard': dashboardRouter,
    '/api/settings': settingsRouter,
    '/api/achievements': achievementsRouter,
    '/api/activities': activityRouter,
    '/api/chatbot': chatbotRouter,
    '/api/backup': backupRouter,
  };
}

module.exports = { Router, setupRoutes };
