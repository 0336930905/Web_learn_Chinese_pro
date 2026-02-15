/**
 * EXAMPLE: Individual function file approach
 * File: api/auth.js
 * Handles: /api/auth (and sub-routes via routing)
 */

const { connectToDatabase } = require('../src/database');
const { authController } = require('../src/controllers');

module.exports = async (req, res) => {
  const { db } = await connectToDatabase();
  
  if (req.url === '/api/auth/login' || req.url.endsWith('/login')) {
    return authController.login({ ...req, db }, res);
  }
  
  if (req.url === '/api/auth/register' || req.url.endsWith('/register')) {
    return authController.register({ ...req, db }, res);
  }
  
  res.status(404).json({ error: 'Not found' });
};
