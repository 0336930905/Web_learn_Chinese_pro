/**
 * Services Index
 * Export all services
 */

const UserService = require('./UserService');
const CategoryService = require('./CategoryService');
const VocabularyService = require('./VocabularyService');
const ProgressService = require('./ProgressService');
const GameService = require('./GameService');
const DashboardService = require('./DashboardService');
const TranslationService = require('./TranslationService');

module.exports = {
  UserService,
  CategoryService,
  VocabularyService,
  ProgressService,
  GameService,
  DashboardService,
  TranslationService,
};
