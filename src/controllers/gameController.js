/**
 * Game Controller
 * Handles game related requests
 */

const { GameService } = require('../services');
const { asyncHandler } = require('../middleware');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

/**
 * Get Listening Quiz
 * GET /api/games/listening-quiz
 */
const getListeningQuiz = asyncHandler(async (req, res) => {
  const { categoryId, difficulty, count, language } = req.query;

  // Support both categoryId and difficulty modes
  if (!categoryId && !difficulty) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Category ID hoặc Difficulty là bắt buộc',
        field: 'categoryId/difficulty'
      }
    });
  }

  // Default language to Vietnamese if not provided
  const lang = language || 'vi';

  const gameService = new GameService(req.db);
  
  let quizzes;
  if (difficulty) {
    // Get from multiple categories by difficulty
    const userId = req.user?._id;
    quizzes = await gameService.getListeningQuizByDifficulty(difficulty, count, userId, lang);
  } else {
    // Get from specific category
    quizzes = await gameService.getListeningQuiz(categoryId, count, lang);
  }

  return successResponse(res, quizzes, 'Lấy bài quiz thành công');
});

/**
 * Get Matching Game
 * GET /api/games/matching
 */
const getMatchingGame = asyncHandler(async (req, res) => {
  const { categoryId, difficulty, count } = req.query;

  if (!categoryId && !difficulty) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Category ID hoặc Difficulty là bắt buộc',
        field: 'categoryId/difficulty'
      }
    });
  }

  const gameService = new GameService(req.db);
  
  let game;
  if (difficulty) {
    const userId = req.user?._id;
    game = await gameService.getMatchingGameByDifficulty(difficulty, count, userId);
  } else {
    game = await gameService.getMatchingGame(categoryId, count);
  }

  return successResponse(res, game, 'Lấy trò chơi ghép đôi thành công');
});

/**
 * Get Fill In The Blanks Game
 * GET /api/games/fill-in-blanks
 */
const getFillInTheBlanks = asyncHandler(async (req, res) => {
  const { categoryId, difficulty, count } = req.query;

  if (!categoryId && !difficulty) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Category ID hoặc Difficulty là bắt buộc',
        field: 'categoryId/difficulty'
      }
    });
  }

  const gameService = new GameService(req.db);
  
  let questions;
  if (difficulty) {
    const userId = req.user?._id;
    questions = await gameService.getFillInTheBlanksByDifficulty(difficulty, count, userId);
  } else {
    questions = await gameService.getFillInTheBlanks(categoryId, count);
  }

  return successResponse(res, questions, 'Lấy câu hỏi điền chỗ trống thành công');
});

/**
 * Save Game Session
 * POST /api/games/session
 */
const saveGameSession = asyncHandler(async (req, res) => {
  const gameService = new GameService(req.db);
  const session = await gameService.saveGameSession(req.user.userId, req.body);

  return successResponse(res, session, 'Lưu phiên chơi thành công');
});

/**
 * Get Game History
 * GET /api/games/history
 */
const getGameHistory = asyncHandler(async (req, res) => {
  const gameService = new GameService(req.db);
  const result = await gameService.getGameHistory(req.user.userId, req.query);

  return successResponse(res, result.sessions, 'Lấy lịch sử chơi game thành công');
});

/**
 * Get Vocabulary Cards
 * GET /api/games/vocabulary-cards
 */
const getVocabularyCards = asyncHandler(async (req, res) => {
  const { categoryId, difficulty, count } = req.query;

  if (!categoryId && !difficulty) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Category ID hoặc Difficulty là bắt buộc',
        field: 'categoryId/difficulty'
      }
    });
  }

  const gameService = new GameService(req.db);
  
  let cards;
  if (difficulty) {
    const userId = req.user?._id;
    cards = await gameService.getVocabularyCardsByDifficulty(difficulty, count, userId);
  } else {
    cards = await gameService.getVocabularyCards(categoryId, count);
  }

  return successResponse(res, cards, 'Lấy thẻ từ vựng thành công');
});

/**
 * Get Reverse Quiz
 * GET /api/games/reverse-quiz
 */
const getReverseQuiz = asyncHandler(async (req, res) => {
  const { categoryId, difficulty, count } = req.query;

  if (!categoryId && !difficulty) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Category ID hoặc Difficulty là bắt buộc',
        field: 'categoryId/difficulty'
      }
    });
  }

  const gameService = new GameService(req.db);
  
  let quizzes;
  if (difficulty) {
    const userId = req.user?._id;
    quizzes = await gameService.getReverseQuizByDifficulty(difficulty, count, userId);
  } else {
    quizzes = await gameService.getReverseQuiz(categoryId, count);
  }

  return successResponse(res, quizzes, 'Lấy bài quiz ngược thành công');
});

/**
 * Get Comprehensive Test Questions
 * GET /api/games/test/questions
 */
const getTestQuestions = asyncHandler(async (req, res) => {
  const { level } = req.query; // 'easy', 'medium', 'hard'

  const gameService = new GameService(req.db);
  const questions = await gameService.getTestQuestions(level);

  return successResponse(res, questions, 'Lấy bộ câu hỏi kiểm tra thành công');
});

/**
 * Submit Test Result
 * POST /api/games/test/submit
 */
const submitTestResult = asyncHandler(async (req, res) => {
  const { score, totalQuestions, details, level } = req.body;
  const userId = req.user._id;

  const gameService = new GameService(req.db);
  const result = await gameService.submitTestResult(userId, { score, totalQuestions, details, level });

  return successResponse(res, result, 'Nộp bài kiểm tra thành công');
});

module.exports = {
  getListeningQuiz,
  getMatchingGame,
  getFillInTheBlanks,
  saveGameSession,
  getGameHistory,
  getVocabularyCards,
  getReverseQuiz,
  getTestQuestions,
  submitTestResult
};
