/**
 * EXAMPLE: Granular function file approach
 * File: api/auth/login.js
 * Handles ONLY: /api/auth/login
 */

const { connectToDatabase } = require('../../src/database');
const { authController } = require('../../src/controllers');

module.exports = async (req, res) => {
  const { db } = await connectToDatabase();
  return authController.login({ ...req, db }, res);
};
