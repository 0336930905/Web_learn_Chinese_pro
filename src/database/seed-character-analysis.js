/**
 * Seed file for character_analyses collection
 * Populates MongoDB with test Vietnamese-Chinese word mappings
 * Usage: node src/database/seed-character-analysis.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learn-taiwanese-pro';

const testData = [
  {
    vietnameseWord: 'học',
    originalWord: 'học',
    chineseCharacter: '學',
    chineseWord: '學習',
    pinyin: 'xué',
    englishMeaning: 'to study, to learn',
    vietnameseMeaning: 'học tập',
    relatedWords: [
      {
        word: '學生',
        pinyin: 'xuésheng',
        meaning: 'student',
        vietnameseMeaning: 'học sinh'
      },
      {
        word: '學校',
        pinyin: 'xuéxiào',
        meaning: 'school',
        vietnameseMeaning: 'trường học'
      },
      {
        word: '教學',
        pinyin: 'jiàoxué',
        meaning: 'teaching',
        vietnameseMeaning: 'giảng dạy'
      },
      {
        word: '學科',
        pinyin: 'xuékē',
        meaning: 'subject',
        vietnameseMeaning: 'môn học'
      },
      {
        word: '學者',
        pinyin: 'xuézhě',
        meaning: 'scholar',
        vietnameseMeaning: 'nhà khoa học'
      },
      {
        word: '大學',
        pinyin: 'dàxué',
        meaning: 'university',
        vietnameseMeaning: 'đại học'
      },
      {
        word: '上學',
        pinyin: 'shàngxué',
        meaning: 'to go to school',
        vietnameseMeaning: 'đi học'
      },
      {
        word: '同學',
        pinyin: 'tóngxué',
        meaning: 'classmate',
        vietnameseMeaning: 'bạn cùng lớp'
      },
      {
        word: '學年',
        pinyin: 'xuéniáń',
        meaning: 'school year',
        vietnameseMeaning: 'năm học'
      },
      {
        word: '學位',
        pinyin: 'xuéwèi',
        meaning: 'degree',
        vietnameseMeaning: 'bằng cấp'
      },
      {
        word: '學費',
        pinyin: 'xuéfèi',
        meaning: 'tuition',
        vietnameseMeaning: 'học phí'
      },
      {
        word: '教科書',
        pinyin: 'jiàokēshū',
        meaning: 'textbook',
        vietnameseMeaning: 'sách giáo khoa'
      },
      {
        word: '研究所',
        pinyin: 'yánjiūsuǒ',
        meaning: 'research institute',
        vietnameseMeaning: 'viện nghiên cứu'
      },
      {
        word: '學分',
        pinyin: 'xuéfèn',
        meaning: 'credit',
        vietnameseMeaning: 'tiết học'
      },
      {
        word: '學會',
        pinyin: 'xuéhuì',
        meaning: 'learned society',
        vietnameseMeaning: 'hội khoa học'
      }
    ],
    examples: [
      {
        vietnamese: 'Tôi đang học tiếng Trung\nrất chăm chỉ',
        chinese: '我正在學中\n文非常勤奮',
        pinyin: 'wǒ zhèngzài\n xué zhōngwén fēi\ncháng qínfèn'
      },
      {
        vietnamese: 'Học sinh lớp\n năm luôn yêu thích',
        chinese: '五年級學生\n總是喜歡學習',
        pinyin: 'wǔ niánjí xuésheng\n zǒngshì xǐhuān xuéxí'
      },
      {
        vietnamese: 'Trường học có\n thư viện rất đẹp',
        chinese: '學校有圖書\n館非常漂亮',
        pinyin: 'xuéxiào yǒu túshū\n guǎn fēicháng piàoliang'
      }
    ],
    characterBreakdown: '學 = 爻(xiao - interaction) + 子(zi - child) → 学习 (to study with a teacher/elder)',
    hskLevel: '1',
    usageContext: 'education',
    createdAt: new Date(),
    usageCount: 0,
    lastAccessedAt: new Date(),
    source: 'seed'
  },
  {
    vietnameseWord: 'sách',
    originalWord: 'sách',
    chineseCharacter: '書',
    chineseWord: '書籍',
    pinyin: 'shū',
    englishMeaning: 'book, letter',
    vietnameseMeaning: 'sách, thư',
    relatedWords: [
      {
        word: '書店',
        pinyin: 'shūdiàn',
        meaning: 'bookstore',
        vietnameseMeaning: 'cửa hàng sách'
      },
      {
        word: '讀書',
        pinyin: 'dúshū',
        meaning: 'to read books',
        vietnameseMeaning: 'đọc sách'
      },
      {
        word: '書架',
        pinyin: 'shūjiá',
        meaning: 'bookshelf',
        vietnameseMeaning: 'kệ sách'
      },
      {
        word: '圖書館',
        pinyin: 'túshūguǎn',
        meaning: 'library',
        vietnameseMeaning: 'thư viện'
      },
      {
        word: '書籍',
        pinyin: 'shūjí',
        meaning: 'books',
        vietnameseMeaning: 'sách vở'
      },
      {
        word: '書評',
        pinyin: 'shūpíng',
        meaning: 'book review',
        vietnameseMeaning: 'bình luận sách'
      },
      {
        word: '著書',
        pinyin: 'zháoshū',
        meaning: 'to write a book',
        vietnameseMeaning: 'viết sách'
      },
      {
        word: '書籤',
        pinyin: 'shūqiān',
        meaning: 'bookmark',
        vietnameseMeaning: 'dấu trang sách'
      },
      {
        word: '書法',
        pinyin: 'shūfǎ',
        meaning: 'calligraphy',
        vietnameseMeaning: 'thư pháp'
      },
      {
        word: '小說',
        pinyin: 'xiǎoshuō',
        meaning: 'novel',
        vietnameseMeaning: 'tiểu thuyết'
      },
      {
        word: '寫書',
        pinyin: 'xiěshū',
        meaning: 'to write a book',
        vietnameseMeaning: 'viết cuốn sách'
      },
      {
        word: '書桌',
        pinyin: 'shūzhuō',
        meaning: 'desk',
        vietnameseMeaning: 'bàn sách'
      },
      {
        word: '藏書',
        pinyin: 'cáng shū',
        meaning: 'book collection',
        vietnameseMeaning: 'bộ sưu tập sách'
      },
      {
        word: '翻譯書',
        pinyin: 'fānyì shū',
        meaning: 'translated book',
        vietnameseMeaning: 'sách dịch'
      },
      {
        word: '原著',
        pinyin: 'yuánzhù',
        meaning: 'original work',
        vietnameseMeaning: 'tác phẩm gốc'
      }
    ],
    examples: [
      {
        vietnamese: 'Tôi thích đọc sách\ntrong thư viện',
        chinese: '我喜歡在圖書\n館讀書很舒服',
        pinyin: 'wǒ xǐhuān zài túshū\nguǎn dúshū hěn shūfu'
      },
      {
        vietnamese: 'Quyển sách này rất\nthú vị và hay',
        chinese: '這本書很有趣\n非常精彩',
        pinyin: 'zhè běn shū hěn yǒuqù\n fēicháng jīngcǎi'
      },
      {
        vietnamese: 'Cửa hàng sách có\n nhiều loại sách mới',
        chinese: '書店有很多新\n書籍可以購買',
        pinyin: 'shūdiàn yǒu hěn duō xīn\nshūjí kěyǐ gòumǎi'
      }
    ],
    characterBreakdown: '書 = 聿(yù - brush) + 日(ri - sun/page) → 书籍 (written words on pages)',
    hskLevel: '2',
    usageContext: 'daily life',
    createdAt: new Date(),
    usageCount: 0,
    lastAccessedAt: new Date(),
    source: 'seed'
  },
  {
    vietnameseWord: 'nhà',
    originalWord: 'nhà',
    chineseCharacter: '家',
    chineseWord: '家房',
    pinyin: 'jiā',
    englishMeaning: 'home, house, family',
    vietnameseMeaning: 'nhà, gia đình',
    relatedWords: [
      {
        word: '房子',
        pinyin: 'fángzi',
        meaning: 'house',
        vietnameseMeaning: 'ngôi nhà'
      },
      {
        word: '家人',
        pinyin: 'jiārén',
        meaning: 'family members',
        vietnameseMeaning: 'thành viên gia đình'
      },
      {
        word: '家庭',
        pinyin: 'jiātíng',
        meaning: 'family',
        vietnameseMeaning: 'gia đình'
      },
      {
        word: '回家',
        pinyin: 'huíjiā',
        meaning: 'to go home',
        vietnameseMeaning: 'về nhà'
      },
      {
        word: '家務',
        pinyin: 'jiāwù',
        meaning: 'housework',
        vietnameseMeaning: 'việc nhà'
      },
      {
        word: '家具',
        pinyin: 'jiājù',
        meaning: 'furniture',
        vietnameseMeaning: 'đồ nội thất'
      },
      {
        word: '窗口',
        pinyin: 'chuāngkǒu',
        meaning: 'window',
        vietnameseMeaning: 'cửa sổ nhà'
      },
      {
        word: '屋頂',
        pinyin: 'wūdǐng',
        meaning: 'roof',
        vietnameseMeaning: 'mái nhà'
      },
      {
        word: '樓梯',
        pinyin: 'lóutī',
        meaning: 'stairs',
        vietnameseMeaning: 'cầu thang'
      },
      {
        word: '廚房',
        pinyin: 'chúfáng',
        meaning: 'kitchen',
        vietnameseMeaning: 'bếp'
      },
      {
        word: '臥室',
        pinyin: 'wòshì',
        meaning: 'bedroom',
        vietnameseMeaning: 'phòng ngủ'
      },
      {
        word: '家主',
        pinyin: 'jiāzhǔ',
        meaning: 'homeowner',
        vietnameseMeaning: 'chủ nhân nhà'
      },
      {
        word: '鄰居',
        pinyin: 'línnjū',
        meaning: 'neighbor',
        vietnameseMeaning: 'hàng xóm'
      },
      {
        word: '屏風',
        pinyin: 'píngfēng',
        meaning: 'screen',
        vietnameseMeaning: 'phong bì'
      },
      {
        word: '家常',
        pinyin: 'jiācháng',
        meaning: 'ordinary',
        vietnameseMeaning: 'thường ngày'
      }
    ],
    examples: [
      {
        vietnamese: 'Tôi yêu gia đình\ncủa tôi rất nhiều',
        chinese: '我愛我的家人\n非常非常多',
        pinyin: 'wǒ ài wǒ de jiārén\n fēicháng fēicháng duō'
      },
      {
        vietnamese: 'Ngôi nhà của tôi\nrất đẹp và rộng',
        chinese: '我的房子很漂亮\n並且非常寬敞',
        pinyin: 'wǒ de fángzi hěn piàoliang\n bìngqiě fēicháng kuānchang'
      },
      {
        vietnamese: 'Anh ta sống cùng\ngia đình ở nhà',
        chinese: '他和家人一起\n住在會家裡面',
        pinyin: 'tā hé jiārén yīqī\n zhù zài huì jiā lǐmiàn'
      }
    ],
    characterBreakdown: '家 = 宀(mian - roof) + 豕(shi - pig) → 家 (family under one roof)',
    hskLevel: '1',
    usageContext: 'home & family',
    createdAt: new Date(),
    usageCount: 0,
    lastAccessedAt: new Date(),
    source: 'seed'
  },
  {
    vietnameseWord: 'bạn',
    originalWord: 'bạn',
    chineseCharacter: '友',
    chineseWord: '朋友',
    pinyin: 'yǒu',
    englishMeaning: 'friend, friendly',
    vietnameseMeaning: 'bạn, thân thiện',
    relatedWords: [
      {
        word: '朋友',
        pinyin: 'péngyou',
        meaning: 'friend',
        vietnameseMeaning: 'bạn bè'
      },
      {
        word: '友誼',
        pinyin: 'yǒuyì',
        meaning: 'friendship',
        vietnameseMeaning: 'tình bạn'
      },
      {
        word: '友善',
        pinyin: 'yǒushàn',
        meaning: 'friendly, kind',
        vietnameseMeaning: 'thân thiện'
      },
      {
        word: '交友',
        pinyin: 'jiāoyǒu',
        meaning: 'to make friends',
        vietnameseMeaning: 'kết bạn'
      },
      {
        word: '摯友',
        pinyin: 'zhìyou',
        meaning: 'intimate friend',
        vietnameseMeaning: 'bạn thân'
      },
      {
        word: '知友',
        pinyin: 'zhīyou',
        meaning: 'intimate friend',
        vietnameseMeaning: 'tri kỷ'
      },
      {
        word: '益友',
        pinyin: 'yìyou',
        meaning: 'helpful friend',
        vietnameseMeaning: 'bạn tốt'
      },
      {
        word: '友邦',
        pinyin: 'yǒubāng',
        meaning: 'friendly nation',
        vietnameseMeaning: 'nước bạn'
      },
      {
        word: '友愛',
        pinyin: 'yǒuài',
        meaning: 'brotherly love',
        vietnameseMeaning: 'tình cảm anh em'
      },
      {
        word: '友人',
        pinyin: 'yǒurén',
        meaning: 'friend',
        vietnameseMeaning: 'người bạn'
      },
      {
        word: '友情',
        pinyin: 'yǒuqíng',
        meaning: 'friendly affection',
        vietnameseMeaning: 'thân tình'
      },
      {
        word: '友好',
        pinyin: 'yǒuhǎo',
        meaning: 'friendly',
        vietnameseMeaning: 'hòa bình'
      },
      {
        word: '知心友',
        pinyin: 'zhīxīnyou',
        meaning: 'close friend',
        vietnameseMeaning: 'tri kỷ thân tín'
      },
      {
        word: '密友',
        pinyin: 'mìyou',
        meaning: 'special friend',
        vietnameseMeaning: 'bạn tin cậy'
      },
      {
        word: '舊友',
        pinyin: 'jiùyou',
        meaning: 'old friend',
        vietnameseMeaning: 'bạn cũ'
      }
    ],
    examples: [
      {
        vietnamese: 'Anh ấy là bạn tốt\ncủa tôi rất lâu',
        chinese: '他是我的好朋\n友已經很多年',
        pinyin: 'tā shì wǒ de hǎo péngyou\n yǐjīng hěn duō nián'
      },
      {
        vietnamese: 'Chúng tôi là những\nnguười bạn tốt',
        chinese: '我們是很好的\n朋友非常親密',
        pinyin: 'wǒmen shì hěn hǎo de\n péngyou fēicháng qīnmì'
      },
      {
        vietnamese: 'Tôi thích những người\nbạn thân thiện',
        chinese: '我喜歡親切善良\n的朋友和同志',
        pinyin: 'wǒ xǐhuān qīnqiè shànliáng\n de péngyou hé tóngzhì'
      }
    ],
    characterBreakdown: '友 = 又(you - again) + 力(li - strength) → 朋友 (hands together in friendship)',
    hskLevel: '1',
    usageContext: 'social relations',
    createdAt: new Date(),
    usageCount: 0,
    lastAccessedAt: new Date(),
    source: 'seed'
  }
];

async function seedDatabase() {
  let client;

  try {
    console.log('🌱 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();
    const collection = db.collection('character_analyses');

    // Check if records already exist
    const existingCount = await collection.countDocuments();
    console.log(`📊 Existing records: ${existingCount}`);

    // Delete existing seed data
    const deleteResult = await collection.deleteMany({ source: 'seed' });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing seed records`);

    // Insert test data
    const insertResult = await collection.insertMany(testData);
    console.log(`✅ Successfully inserted ${insertResult.insertedCount} test records:\n`);

    // Display inserted records
    testData.forEach((item) => {
      console.log(`   📖 ${item.vietnameseWord} → ${item.chineseCharacter} (${item.chineseWord})`);
    });

    // Show sample data
    console.log('\n📋 Sample Document Structure:');
    const sample = await collection.findOne({ vietnameseWord: 'học' });
    console.log(JSON.stringify(sample, null, 2));

    console.log('\n✨ Database seeding complete!');
    console.log('\n📍 Test the API with:');
    console.log('   POST /api/character-analysis/analyze');
    console.log('   Body: { "vietnameseWord": "học" }');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
