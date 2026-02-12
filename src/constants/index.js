/**
 * Application Constants
 * Centralized constants management
 */

// User Roles
const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

// Vocabulary Difficulty Levels
const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  NATIVE: 'native',
};

// Learning Status for Vocabulary
const LEARNING_STATUS = {
  NEW: 'new',
  LEARNING: 'learning',
  REVIEWING: 'reviewing',
  MASTERED: 'mastered',
};

// Game Types
const GAME_TYPES = {
  LISTENING_QUIZ: 'listening-quiz',
  MATCHING_GAME: 'matching-game',
  TRANSLATION: 'translation',
  FLASHCARD: 'flashcard',
  TEST: 'test', // Ultimate challenge test
};

// Activity Types (only for game_test.html)
const ACTIVITY_TYPES = {
  TEST_COMPLETED: 'test_completed',
};

// Achievement Types
const ACHIEVEMENT_TYPES = {
  // Test-based achievements
  FIRST_TEST: 'first_test',
  PERFECT_SCORE: 'perfect_score',
  TEST_MASTER: 'test_master',
  SPEED_RUNNER: 'speed_runner',
  BEGINNER_CHAMPION: 'beginner_champion',
  INTERMEDIATE_CHAMPION: 'intermediate_champion',
  ADVANCED_CHAMPION: 'advanced_champion',
  NATIVE_CHAMPION: 'native_champion',
  STREAK_3: 'streak_3',
  STREAK_7: 'streak_7',
  STREAK_30: 'streak_30',
  HUNDRED_TESTS: 'hundred_tests',
};

// Achievement Categories
const ACHIEVEMENT_CATEGORIES = {
  TEST: 'test',
  DIFFICULTY: 'difficulty',
  STREAK: 'streak',
  MILESTONE: 'milestone',
};

// Progress Status
const PROGRESS_STATUS = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Codes
const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_USER_EXISTS: 'AUTH_USER_EXISTS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  
  // Database
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};

// Success Messages
const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'Đăng ký thành công',
  USER_LOGGED_IN: 'Đăng nhập thành công',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công',
  RESOURCE_CREATED: 'Tạo mới thành công',
  RESOURCE_UPDATED: 'Cập nhật thành công',
  RESOURCE_DELETED: 'Xóa thành công',
  PROGRESS_SAVED: 'Lưu tiến độ thành công',
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  USER_EXISTS: 'Email đã được đăng ký',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  TOKEN_INVALID: 'Token không hợp lệ',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  RESOURCE_NOT_FOUND: 'Không tìm thấy tài nguyên',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  INTERNAL_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau',
  DB_CONNECTION_ERROR: 'Không thể kết nối database',
};

// Collection Names
const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  VOCABULARY: 'vocabulary',
  USER_PROGRESS: 'user_progress',
  GAME_SESSIONS: 'game_sessions',
  ACTIVITIES: 'activities',
  ACHIEVEMENTS: 'achievements',
  BACKUPS: 'backups',
  BACKUP_SCHEDULE: 'backup_schedule',
  RESTORE_LOGS: 'restore_logs',
};

// Sort Orders
const SORT_ORDER = {
  ASC: 1,
  DESC: -1,
};

// Cache TTL (Time To Live in seconds)
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

// Regex Patterns
const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[0-9]{10,11}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  OBJECTID: /^[0-9a-fA-F]{24}$/,
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  DIFFICULTY_LEVELS,
  LEARNING_STATUS,
  GAME_TYPES,
  ACTIVITY_TYPES,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_CATEGORIES,
  PROGRESS_STATUS,
  HTTP_STATUS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  COLLECTIONS,
  SORT_ORDER,
  CACHE_TTL,
  REGEX_PATTERNS,
};
