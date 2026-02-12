/**
 * Database Seeding Script
 * Populate database with sample data
 */

const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { connectToDatabase, closeDatabaseConnection } = require('./connection');
const { COLLECTIONS, USER_ROLES, DIFFICULTY_LEVELS } = require('../constants');
const { logger } = require('../utils/logger');

/**
 * Sample Users
 */
async function getSampleUsers() {
  return [
    {
      _id: new ObjectId(),
      email: 'admin@learntaiwanese.com',
      password: await bcrypt.hash('admin123', 10),
      role: USER_ROLES.ADMIN,
      fullName: 'Admin User',
      avatar: 'https://i.pravatar.cc/150?img=1',
      streak: { current: 0, longest: 0, lastStudyDate: null },
      stats: { totalWords: 0, experience: 0, level: 1, accuracy: 0 },
      settings: {
        theme: 'light',
        language: 'vi',
        sound: {
          bgMusic: 75,
          gameSFX: 90
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      email: 'student@example.com',
      password: await bcrypt.hash('student123', 10),
      role: USER_ROLES.STUDENT,
      fullName: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=2',
      streak: { current: 5, longest: 12, lastStudyDate: new Date() },
      stats: { totalWords: 50, experience: 500, level: 5, accuracy: 0.85 },
      settings: {
        theme: 'dark',
        language: 'vi',
        sound: {
          bgMusic: 60,
          gameSFX: 80
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

/**
 * Sample Categories
 */
function getSampleCategories() {
  return [
    {
      _id: new ObjectId(),
      name: 'Chào hỏi',
      description: 'Các câu chào hỏi cơ bản',
      icon: '👋',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Gia đình',
      description: 'Từ vựng về gia đình',
      icon: '👨‍👩‍👧‍👦',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Số đếm',
      description: 'Các con số và số đếm',
      icon: '🔢',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Thức ăn',
      description: 'Từ vựng về đồ ăn',
      icon: '🍜',
      difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Màu sắc',
      description: 'Tên các màu sắc',
      icon: '🎨',
      difficulty: DIFFICULTY_LEVELS.ADVANCED,
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

/**
 * Sample Vocabulary
 */
function getSampleVocabulary(categories) {
  const vocabulary = [];

  // Greetings (Chào hỏi)
  const greetings = [
    { traditional: '你好', simplified: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào', example: '你好！很高興見到你。' },
    { traditional: '早安', simplified: '早安', pinyin: 'zǎo ān', meaning: 'Chào buổi sáng', example: '早安！今天天氣真好。' },
    { traditional: '謝謝', simplified: '谢谢', pinyin: 'xiè xie', meaning: 'Cảm ơn', example: '謝謝你的幫助。' },
    { traditional: '不客氣', simplified: '不客气', pinyin: 'bù kè qì', meaning: 'Không có gì', example: '不客氣，這是我應該做的。' },
    { traditional: '對不起', simplified: '对不起', pinyin: 'duì bù qǐ', meaning: 'Xin lỗi', example: '對不起，我來晚了。' },
    { traditional: '再見', simplified: '再见', pinyin: 'zài jiàn', meaning: 'Tạm biệt', example: '再見！明天見。' }
  ];

  greetings.forEach(word => {
    vocabulary.push({
      _id: new ObjectId(),
      categoryId: categories[0]._id,
      ...word,
      audioUrl: '',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // Family (Gia đình)
  const family = [
    { traditional: '爸爸', simplified: '爸爸', pinyin: 'bà ba', meaning: 'Bố', example: '我的爸爸是老師。' },
    { traditional: '媽媽', simplified: '妈妈', pinyin: 'mā ma', meaning: 'Mẹ', example: '媽媽在廚房做飯。' },
    { traditional: '哥哥', simplified: '哥哥', pinyin: 'gē ge', meaning: 'Anh trai', example: '我哥哥很高。' },
    { traditional: '姐姐', simplified: '姐姐', pinyin: 'jiě jie', meaning: 'Chị gái', example: '姐姐在大學讀書。' },
    { traditional: '弟弟', simplified: '弟弟', pinyin: 'dì di', meaning: 'Em trai', example: '弟弟喜歡打籃球。' },
    { traditional: '妹妹', simplified: '妹妹', pinyin: 'mèi mei', meaning: 'Em gái', example: '妹妹很可愛。' }
  ];

  family.forEach(word => {
    vocabulary.push({
      _id: new ObjectId(),
      categoryId: categories[1]._id,
      ...word,
      audioUrl: '',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // Numbers (Số đếm)
  const numbers = [
    { traditional: '一', simplified: '一', pinyin: 'yī', meaning: 'Một', example: '我有一個弟弟。' },
    { traditional: '二', simplified: '二', pinyin: 'èr', meaning: 'Hai', example: '我家有二隻貓。' },
    { traditional: '三', simplified: '三', pinyin: 'sān', meaning: 'Ba', example: '三個人一起去。' },
    { traditional: '四', simplified: '四', pinyin: 'sì', meaning: 'Bốn', example: '四月是春天。' },
    { traditional: '五', simplified: '五', pinyin: 'wǔ', meaning: 'Năm', example: '我五點下班。' },
    { traditional: '六', simplified: '六', pinyin: 'liù', meaning: 'Sáu', example: '六月很熱。' },
    { traditional: '七', simplified: '七', pinyin: 'qī', meaning: 'Bảy', example: '七天一個星期。' },
    { traditional: '八', simplified: '八', pinyin: 'bā', meaning: 'Tám', example: '八點吃早餐。' },
    { traditional: '九', simplified: '九', pinyin: 'jiǔ', meaning: 'Chín', example: '九月開學。' },
    { traditional: '十', simplified: '十', pinyin: 'shí', meaning: 'Mười', example: '十個學生。' }
  ];

  numbers.forEach(word => {
    vocabulary.push({
      _id: new ObjectId(),
      categoryId: categories[2]._id,
      ...word,
      audioUrl: '',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // Food (Thức ăn)
  const food = [
    { traditional: '飯', simplified: '饭', pinyin: 'fàn', meaning: 'Cơm', example: '我要吃飯。' },
    { traditional: '麵', simplified: '面', pinyin: 'miàn', meaning: 'Mì', example: '牛肉麵很好吃。' },
    { traditional: '茶', simplified: '茶', pinyin: 'chá', meaning: 'Trà', example: '我喜歡喝茶。' },
    { traditional: '咖啡', simplified: '咖啡', pinyin: 'kā fēi', meaning: 'Cà phê', example: '早上喝咖啡。' },
    { traditional: '水', simplified: '水', pinyin: 'shuǐ', meaning: 'Nước', example: '請給我一杯水。' },
    { traditional: '肉', simplified: '肉', pinyin: 'ròu', meaning: 'Thịt', example: '我不吃肉。' }
  ];

  food.forEach(word => {
    vocabulary.push({
      _id: new ObjectId(),
      categoryId: categories[3]._id,
      ...word,
      audioUrl: '',
      difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // Colors (Màu sắc)
  const colors = [
    { traditional: '紅色', simplified: '红色', pinyin: 'hóng sè', meaning: 'Màu đỏ', example: '我喜歡紅色。' },
    { traditional: '藍色', simplified: '蓝色', pinyin: 'lán sè', meaning: 'Màu xanh dương', example: '天空是藍色的。' },
    { traditional: '綠色', simplified: '绿色', pinyin: 'lǜ sè', meaning: 'Màu xanh lá', example: '樹葉是綠色的。' },
    { traditional: '黃色', simplified: '黄色', pinyin: 'huáng sè', meaning: 'Màu vàng', example: '香蕉是黃色的。' },
    { traditional: '白色', simplified: '白色', pinyin: 'bái sè', meaning: 'Màu trắng', example: '雪是白色的。' },
    { traditional: '黑色', simplified: '黑色', pinyin: 'hēi sè', meaning: 'Màu đen', example: '我的貓是黑色的。' }
  ];

  colors.forEach(word => {
    vocabulary.push({
      _id: new ObjectId(),
      categoryId: categories[4]._id,
      ...word,
      audioUrl: '',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  return vocabulary;
}

/**
 * Seed Database
 */
async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    const { db } = await connectToDatabase();

    // Clear existing data
    logger.info('Clearing existing data...');
    await db.collection(COLLECTIONS.USERS).deleteMany({});
    await db.collection(COLLECTIONS.CATEGORIES).deleteMany({});
    await db.collection(COLLECTIONS.VOCABULARY).deleteMany({});
    await db.collection(COLLECTIONS.USER_PROGRESS).deleteMany({});
    await db.collection(COLLECTIONS.GAME_SESSIONS).deleteMany({});

    // Insert users
    logger.info('Inserting users...');
    const users = await getSampleUsers();
    await db.collection(COLLECTIONS.USERS).insertMany(users);
    logger.info(`Inserted ${users.length} users`);

    // Find admin user for categories
    const adminUser = users.find(u => u.role === USER_ROLES.ADMIN);
    if (!adminUser) throw new Error('Admin user not generated');

    // Insert categories
    logger.info('Inserting categories...');
    let categories = getSampleCategories();
    // Assign all sample categories to the admin and make them public
    categories = categories.map(c => ({ ...c, userId: adminUser._id, isPrivate: false }));
    
    await db.collection(COLLECTIONS.CATEGORIES).insertMany(categories);
    logger.info(`Inserted ${categories.length} categories`);

    // Insert vocabulary
    logger.info('Inserting vocabulary...');
    const vocabulary = getSampleVocabulary(categories);
    await db.collection(COLLECTIONS.VOCABULARY).insertMany(vocabulary);
    logger.info(`Inserted ${vocabulary.length} vocabulary items`);

    logger.info('✓ Database seeding completed successfully!');
    
    // Print credentials
    console.log('\n📝 Sample Credentials:');
    console.log('Admin: admin@learntaiwanese.com / admin123');
    console.log('Student: student@example.com / student123');

    return true;
  } catch (error) {
    logger.error('Seeding failed', { error: error.message });
    throw error;
  } finally {
    await closeDatabaseConnection();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✓ Seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
