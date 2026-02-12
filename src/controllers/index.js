/**
 * Controllers Index
 * Export all controllers
 */

const authController = require('./authController');
const adminController = require('./adminController');
const categoryController = require('./categoryController');
const vocabularyController = require('./vocabularyController');
const progressController = require('./progressController');
const gameController = require('./gameController');
const dashboardController = require('./dashboardController');
const settingsController = require('./settingsController');
const achievementsController = require('./achievementsController');
const chatbotController = require('./chatbotController');
const backupController = require('./backupController');

module.exports = {
  authController,
  adminController,
  categoryController,
  vocabularyController,
  progressController,
  gameController,
  dashboardController,
  settingsController,
  achievementsController,
  chatbotController,
  backupController,
};
