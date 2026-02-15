/**
 * Vercel Catch-All API Route
 * Handles all /api/* requests and forwards to main app handler
 */

const app = require('../src/app');

module.exports = app;
module.exports.default = app;
