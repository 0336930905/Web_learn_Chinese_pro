/**
 * Services Index
 * Centralized export of all services
 */

const UserService = require('./UserService');
const VocabularyService = require('./VocabularyService');
const CategoryService = require('./CategoryService');
const ProgressService = require('./ProgressService');
const GameService = require('./GameService');
const DashboardService = require('./DashboardService');
const achievementService = require('./achievementService');
const TranslationService = require('./TranslationService');
const chatbotFallback = require('./chatbotFallback');
const geminiService = require('./geminiService');

module.exports = {
  UserService,
  VocabularyService,
  CategoryService,
  ProgressService,
  GameService,
  DashboardService,
  achievementService,
  TranslationService,
  chatbotFallback,
  geminiService,
};
