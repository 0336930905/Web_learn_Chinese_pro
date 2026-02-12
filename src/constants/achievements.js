/**
 * Achievement Definitions
 * Các thành tựu có thể đạt được từ game_test.html
 */

const { ACHIEVEMENT_TYPES, ACHIEVEMENT_CATEGORIES, DIFFICULTY_LEVELS } = require('./index');

/**
 * Achievement definitions with requirements
 * Each achievement has:
 * - type: unique identifier
 * - title: display name (Vietnamese)
 * - description: achievement description
 * - icon: emoji icon
 * - category: achievement category
 * - target: number to reach for completion
 * - requirement: function to check if user qualifies
 */
const ACHIEVEMENT_DEFINITIONS = [
  // Test-based achievements
  {
    type: ACHIEVEMENT_TYPES.FIRST_TEST,
    title: 'Bước Đầu Tiên',
    description: 'Hoàn thành bài kiểm tra đầu tiên',
    icon: '🎯',
    category: ACHIEVEMENT_CATEGORIES.TEST,
    target: 1,
    requirement: (activities) => activities.length >= 1,
  },
  {
    type: ACHIEVEMENT_TYPES.PERFECT_SCORE,
    title: 'Hoàn Hảo',
    description: 'Đạt 100% trong một bài kiểm tra',
    icon: '💯',
    category: ACHIEVEMENT_CATEGORIES.TEST,
    target: 1,
    requirement: (activities) => activities.some(a => a.percentage === 100),
  },
  {
    type: ACHIEVEMENT_TYPES.TEST_MASTER,
    title: 'Bậc Thầy Kiểm Tra',
    description: 'Hoàn thành 10 bài kiểm tra',
    icon: '🏆',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    target: 10,
    requirement: (activities) => activities.length >= 10,
  },
  {
    type: ACHIEVEMENT_TYPES.SPEED_RUNNER,
    title: 'Tốc Độ Ánh Sáng',
    description: 'Hoàn thành bài kiểm tra trong dưới 5 phút',
    icon: '⚡',
    category: ACHIEVEMENT_CATEGORIES.TEST,
    target: 1,
    requirement: (activities) => activities.some(a => a.duration && a.duration < 300),
  },
  
  // Difficulty-specific achievements
  {
    type: ACHIEVEMENT_TYPES.BEGINNER_CHAMPION,
    title: 'Nhà Vô Địch Sơ Cấp',
    description: 'Đạt trên 90% trong bài kiểm tra mức Beginner',
    icon: '🌱',
    category: ACHIEVEMENT_CATEGORIES.DIFFICULTY,
    target: 1,
    requirement: (activities) => 
      activities.some(a => a.difficulty === DIFFICULTY_LEVELS.BEGINNER && a.percentage >= 90),
  },
  {
    type: ACHIEVEMENT_TYPES.INTERMEDIATE_CHAMPION,
    title: 'Nhà Vô Địch Trung Cấp',
    description: 'Đạt trên 90% trong bài kiểm tra mức Intermediate',
    icon: '🌿',
    category: ACHIEVEMENT_CATEGORIES.DIFFICULTY,
    target: 1,
    requirement: (activities) => 
      activities.some(a => a.difficulty === DIFFICULTY_LEVELS.INTERMEDIATE && a.percentage >= 90),
  },
  {
    type: ACHIEVEMENT_TYPES.ADVANCED_CHAMPION,
    title: 'Nhà Vô Địch Nâng Cao',
    description: 'Đạt trên 90% trong bài kiểm tra mức Advanced',
    icon: '🌳',
    category: ACHIEVEMENT_CATEGORIES.DIFFICULTY,
    target: 1,
    requirement: (activities) => 
      activities.some(a => a.difficulty === DIFFICULTY_LEVELS.ADVANCED && a.percentage >= 90),
  },
  {
    type: ACHIEVEMENT_TYPES.NATIVE_CHAMPION,
    title: 'Nhà Vô Địch Bản Ngữ',
    description: 'Đạt trên 90% trong bài kiểm tra mức Native',
    icon: '🎓',
    category: ACHIEVEMENT_CATEGORIES.DIFFICULTY,
    target: 1,
    requirement: (activities) => 
      activities.some(a => a.difficulty === DIFFICULTY_LEVELS.NATIVE && a.percentage >= 90),
  },
  
  // Streak achievements (test on consecutive days)
  {
    type: ACHIEVEMENT_TYPES.STREAK_3,
    title: 'Chuỗi 3 Ngày',
    description: 'Hoàn thành bài kiểm tra 3 ngày liên tiếp',
    icon: '🔥',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    target: 3,
    requirement: (activities) => {
      // Check if user has done tests on 3 consecutive days
      const dates = activities
        .map(a => new Date(a.createdAt).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index) // unique dates
        .sort();
      
      let maxStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      
      return maxStreak >= 3;
    },
  },
  {
    type: ACHIEVEMENT_TYPES.STREAK_7,
    title: 'Chuỗi 7 Ngày',
    description: 'Hoàn thành bài kiểm tra 7 ngày liên tiếp',
    icon: '🔥🔥',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    target: 7,
    requirement: (activities) => {
      const dates = activities
        .map(a => new Date(a.createdAt).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort();
      
      let maxStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      
      return maxStreak >= 7;
    },
  },
  {
    type: ACHIEVEMENT_TYPES.STREAK_30,
    title: 'Chuỗi 30 Ngày',
    description: 'Hoàn thành bài kiểm tra 30 ngày liên tiếp',
    icon: '🔥🔥🔥',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    target: 30,
    requirement: (activities) => {
      const dates = activities
        .map(a => new Date(a.createdAt).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort();
      
      let maxStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      
      return maxStreak >= 30;
    },
  },
  
  // Milestone achievements
  {
    type: ACHIEVEMENT_TYPES.HUNDRED_TESTS,
    title: 'Kỷ Lục Gia',
    description: 'Hoàn thành 100 bài kiểm tra',
    icon: '🎖️',
    category: ACHIEVEMENT_CATEGORIES.MILESTONE,
    target: 100,
    requirement: (activities) => activities.length >= 100,
  },
];

/**
 * XP (Experience Points) calculation
 * Based on test performance
 */
function calculateXP(activity) {
  let baseXP = 50; // Base XP for completing a test
  
  // Bonus based on percentage
  const percentageBonus = Math.floor(activity.percentage * 2); // Max 200 XP for 100%
  
  // Difficulty multiplier
  let difficultyMultiplier = 1;
  switch (activity.difficulty) {
    case DIFFICULTY_LEVELS.BEGINNER:
      difficultyMultiplier = 1;
      break;
    case DIFFICULTY_LEVELS.INTERMEDIATE:
      difficultyMultiplier = 1.5;
      break;
    case DIFFICULTY_LEVELS.ADVANCED:
      difficultyMultiplier = 2;
      break;
    case DIFFICULTY_LEVELS.NATIVE:
      difficultyMultiplier = 3;
      break;
  }
  
  // Perfect score bonus
  const perfectBonus = activity.percentage === 100 ? 100 : 0;
  
  // Speed bonus (if completed in under 5 minutes)
  const speedBonus = activity.duration && activity.duration < 300 ? 50 : 0;
  
  const totalXP = Math.floor(
    (baseXP + percentageBonus + perfectBonus + speedBonus) * difficultyMultiplier
  );
  
  return totalXP;
}

module.exports = {
  ACHIEVEMENT_DEFINITIONS,
  calculateXP,
};
