/**
 * Seed script: Add 4 Taiwanese categories + vocabulary for haohaon502@gmail.com
 * Run: node src/database/seed-taiwanese-user.js
 */

require('dotenv').config();
const { ObjectId } = require('mongodb');
const { connectToDatabase, closeDatabaseConnection } = require('./connection');
const { COLLECTIONS, DIFFICULTY_LEVELS } = require('../constants');

const TARGET_EMAIL = 'haohaon502@gmail.com';

// ─────────────────────────────────────────────
// Category definitions
// ─────────────────────────────────────────────
function buildCategories(userId) {
  const now = new Date();
  return [
    {
      _id: new ObjectId(),
      name: 'Chào hỏi cơ bản',
      description: 'Các câu chào hỏi cơ bản trong tiếng Đài Loan (Min Nam)',
      icon: '👋',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      order: 1,
      userId: new ObjectId(userId),
      isPrivate: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: 'Câu hỏi xã giao',
      description: 'Các câu hỏi giao tiếp xã hội thường gặp',
      icon: '💬',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      order: 2,
      userId: new ObjectId(userId),
      isPrivate: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: 'Phản xạ cơ bản (Rất quan trọng)',
      description: 'Những từ phản xạ cơ bản, cần thuộc lòng để giao tiếp tức thì',
      icon: '⚡',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      order: 3,
      userId: new ObjectId(userId),
      isPrivate: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      name: 'Phát âm quan trọng ngày 1–2',
      description: 'Các âm đặc trưng cần làm quen từ những ngày học đầu tiên',
      icon: '🔊',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
      order: 4,
      userId: new ObjectId(userId),
      isPrivate: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// ─────────────────────────────────────────────
// Vocabulary definitions (pinyin = POJ romanization)
// ─────────────────────────────────────────────
function buildVocabulary(categories) {
  const now = new Date();
  const [cat1, cat2, cat3, cat4] = categories;
  const vocab = [];

  // ── Category 1: Chào hỏi cơ bản ──────────────
  const greetings = [
    {
      traditional: '你好',
      simplified: '你好',
      pinyin: 'Lí hó',
      meaning: 'Xin chào',
      example: '你好！很高興見到你。(Lí hó! Chin hoaⁿ-hí khòaⁿ-tio̍h lí.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '你好無？',
      simplified: '你好吗？',
      pinyin: 'Lí hó-bô?',
      meaning: 'Bạn khỏe không?',
      example: '你好無？我真好。(Lí hó-bô? Guá chin hó.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '我',
      simplified: '我',
      pinyin: 'Guá',
      meaning: 'Tôi',
      example: '我是越南人。(Guá sī Oa̍t-lâm-lâng.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '你',
      simplified: '你',
      pinyin: 'Lí',
      meaning: 'Bạn',
      example: '你好！(Lí hó!)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '是',
      simplified: '是',
      pinyin: 'Sī',
      meaning: 'Là',
      example: '我是學生。(Guá sī ha̍k-seng.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '我是…',
      simplified: '我是…',
      pinyin: 'Guá sī…',
      meaning: 'Tôi là…',
      example: '我是越南人。(Guá sī Oa̍t-lâm-lâng.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '多謝',
      simplified: '多谢',
      pinyin: 'Tō-siā',
      meaning: 'Cảm ơn',
      example: '多謝你的幫助。(Tō-siā lí ê pang-chō.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '毋免',
      simplified: '毋免',
      pinyin: 'M̄-bián',
      meaning: 'Không cần / Không có gì',
      example: '毋免客氣。(M̄-bián kheh-khì.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '失禮',
      simplified: '失礼',
      pinyin: 'Sit-lé',
      meaning: 'Xin lỗi',
      example: '失禮，我來晚矣。(Sit-lé, guá lâi bān-á.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '再會',
      simplified: '再会',
      pinyin: 'Chài-hōe',
      meaning: 'Tạm biệt',
      example: '再會！下擺見。(Chài-hōe! Ē-pái kìⁿ.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '拜拜',
      simplified: '拜拜',
      pinyin: 'Pài-pài',
      meaning: 'Bye bye',
      example: '拜拜！(Pài-pài!)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
  ];

  greetings.forEach(w =>
    vocab.push({ _id: new ObjectId(), categoryId: cat1._id, ...w, audioUrl: '', createdAt: now, updatedAt: now })
  );

  // ── Category 2: Câu hỏi xã giao ──────────────
  const socialQuestions = [
    {
      traditional: '你叫什麼名？',
      simplified: '你叫什么名？',
      pinyin: 'Lí kiò siáⁿ-mih miâ?',
      meaning: 'Bạn tên gì?',
      example: '你叫什麼名？(Lí kiò siáⁿ-mih miâ?)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '我叫…',
      simplified: '我叫…',
      pinyin: 'Guá kiò…',
      meaning: 'Tôi tên là…',
      example: '我叫阿明。(Guá kiò A-bêng.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '幾歲？',
      simplified: '几岁？',
      pinyin: 'Kuí hòe?',
      meaning: 'Bao nhiêu tuổi?',
      example: '你幾歲？(Lí kuí hòe?)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '你幾歲？',
      simplified: '你几岁？',
      pinyin: 'Lí kuí hòe?',
      meaning: 'Bạn bao nhiêu tuổi?',
      example: '你幾歲？我二十歲。(Lí kuí hòe? Guá jī-cha̍p hòe.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '我…歲',
      simplified: '我…岁',
      pinyin: 'Guá … hòe',
      meaning: 'Tôi … tuổi',
      example: '我二十歲。(Guá jī-cha̍p hòe.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '你住佇佗位？',
      simplified: '你住在哪里？',
      pinyin: 'Lí tī tó-uī?',
      meaning: 'Bạn sống ở đâu?',
      example: '你住佇佗位？(Lí tī tó-uī?)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '我住佇…',
      simplified: '我住在…',
      pinyin: 'Guá tī…',
      meaning: 'Tôi sống ở…',
      example: '我住佇台北。(Guá tī Tâi-pak.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
  ];

  socialQuestions.forEach(w =>
    vocab.push({ _id: new ObjectId(), categoryId: cat2._id, ...w, audioUrl: '', createdAt: now, updatedAt: now })
  );

  // ── Category 3: Phản xạ cơ bản (Rất quan trọng) ──
  const reflexWords = [
    {
      traditional: '好',
      simplified: '好',
      pinyin: 'Hó',
      meaning: 'Tốt',
      example: '好！我知。(Hó! Guá chai.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '無',
      simplified: '无',
      pinyin: 'Bô',
      meaning: 'Không (có)',
      example: '我無空。(Guá bô-khang.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '有',
      simplified: '有',
      pinyin: 'Ū',
      meaning: 'Có',
      example: '我有錢。(Guá ū chîⁿ.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '毋知',
      simplified: '不知',
      pinyin: 'M̄ tsai',
      meaning: 'Không biết',
      example: '我毋知。(Guá m̄ tsai.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '毋曉',
      simplified: '不懂',
      pinyin: 'M̄ hiáu',
      meaning: 'Không hiểu',
      example: '我毋曉講臺語。(Guá m̄ hiáu kóng Tâi-gí.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '是喔',
      simplified: '是哦',
      pinyin: 'Sī--ooh',
      meaning: 'À vậy à',
      example: '是喔？真的？(Sī--ooh? Chin--ê?)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '真的',
      simplified: '真的',
      pinyin: 'Chin--ê',
      meaning: 'Thật đó',
      example: '真的！我無騙你。(Chin--ê! Guá bô phiàn lí.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
  ];

  reflexWords.forEach(w =>
    vocab.push({ _id: new ObjectId(), categoryId: cat3._id, ...w, audioUrl: '', createdAt: now, updatedAt: now })
  );

  // ── Category 4: Phát âm quan trọng ngày 1–2 ──
  const pronunciation = [
    {
      traditional: '我',
      simplified: '我',
      pinyin: 'Guá',
      meaning: 'Tôi — Âm "gua" (phát âm như "goa")',
      example: '我是越南人。(Guá sī Oa̍t-lâm-lâng.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '你',
      simplified: '你',
      pinyin: 'Lí',
      meaning: 'Bạn — Âm "lí" (phát âm ngắn, sắc)',
      example: '你好！(Lí hó!)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '是',
      simplified: '是',
      pinyin: 'Sī',
      meaning: 'Là — Âm "si" kéo nhẹ (thanh bằng)',
      example: '我是學生。(Guá sī ha̍k-seng.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '無',
      simplified: '无',
      pinyin: 'Bô',
      meaning: 'Không — Âm "bô" tròn miệng (thanh huyền)',
      example: '我無錢。(Guá bô chîⁿ.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
    {
      traditional: '毋',
      simplified: '毋',
      pinyin: 'M̄',
      meaning: 'Chẳng / Không — Âm mũi "m̄" (phụ âm mũi độc lập)',
      example: '毋是我。(M̄ sī guá.)',
      difficulty: DIFFICULTY_LEVELS.BEGINNER,
    },
  ];

  pronunciation.forEach(w =>
    vocab.push({ _id: new ObjectId(), categoryId: cat4._id, ...w, audioUrl: '', createdAt: now, updatedAt: now })
  );

  return vocab;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function run() {
  const { db } = await connectToDatabase();

  // 1. Look up target user
  const user = await db.collection(COLLECTIONS.USERS).findOne({ email: TARGET_EMAIL });
  if (!user) {
    console.error(`✗ User not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }
  console.log(`✓ Found user: ${user.fullName || user.email} (${user._id})`);

  // 2. Build categories
  const categories = buildCategories(user._id.toString());

  // 3. Check for name conflicts (same user, same name)
  for (const cat of categories) {
    const existing = await db.collection(COLLECTIONS.CATEGORIES).findOne({
      userId: user._id,
      name: cat.name,
    });
    if (existing) {
      console.warn(`⚠ Category already exists, skipping: "${cat.name}"`);
      // Replace ObjectId so vocabulary references the real existing id
      cat._id = existing._id;
      cat._skip = true;
    }
  }

  // 4. Insert new categories
  const newCats = categories.filter(c => !c._skip);
  if (newCats.length > 0) {
    await db.collection(COLLECTIONS.CATEGORIES).insertMany(
      newCats.map(({ _skip, ...c }) => c)
    );
    console.log(`✓ Inserted ${newCats.length} categories`);
  } else {
    console.log('ℹ All categories already exist, skipping insert');
  }

  // 5. Build vocabulary
  const vocabulary = buildVocabulary(categories);

  // 6. Insert vocabulary (skip duplicates by traditional + categoryId)
  let insertedCount = 0;
  for (const word of vocabulary) {
    const exists = await db.collection(COLLECTIONS.VOCABULARY).findOne({
      categoryId: word.categoryId,
      traditional: word.traditional,
    });
    if (!exists) {
      await db.collection(COLLECTIONS.VOCABULARY).insertOne(word);
      insertedCount++;
    } else {
      console.warn(`⚠ Vocabulary duplicate skipped: "${word.traditional}" in category ${word.categoryId}`);
    }
  }
  console.log(`✓ Inserted ${insertedCount} vocabulary items`);

  // 7. Summary
  console.log('\n📋 Summary:');
  for (const cat of categories) {
    const count = await db.collection(COLLECTIONS.VOCABULARY).countDocuments({ categoryId: cat._id });
    console.log(`  [${cat.name}] → ${count} words`);
  }

  console.log('\n✅ Done!');
}

run()
  .catch(err => {
    console.error('✗ Error:', err.message);
    process.exit(1);
  })
  .finally(() => closeDatabaseConnection());
