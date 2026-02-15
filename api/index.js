/**
 * Vercel Serverless Function Entry Point
 * This file exports the main app handler for Vercel's serverless platform
 */

const app = require('../src/app');

// Export as default handler for Vercel
module.exports = app;

// Also export as default for ES6 compatibility
module.exports.default = app;
