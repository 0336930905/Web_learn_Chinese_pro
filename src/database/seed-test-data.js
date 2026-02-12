/**
 * Seed Test Data Script
 * Inserts 9 categories (3 Easy, 3 Medium, 3 Hard) with 15 vocabulary words each
 * Target User ID: 6989da7b3f807106aa410352 (Admin)
 */

const { ObjectId } = require('mongodb');
require('dotenv').config(); // Load environment variables
const { connectToDatabase, closeDatabaseConnection } = require('./connection');
const { COLLECTIONS, DIFFICULTY_LEVELS } = require('../constants');

// Target Admin ID
const ADMIN_ID = new ObjectId('6989da7b3f807106aa410352');

// Data Definitions
const CATEGORY_SETS = [
  // EASY
  {
    name: 'Giao tiếp hàng ngày',
    description: 'Các câu giao tiếp cơ bản thường dùng',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    icon: 'chat',
    words: [
      { traditional: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào', difficulty: 'Easy' },
      { traditional: '謝謝', pinyin: 'xiè xie', meaning: 'Cảm ơn', difficulty: 'Easy' },
      { traditional: '對不起', pinyin: 'duì bu qǐ', meaning: 'Xin lỗi', difficulty: 'Easy' },
      { traditional: '沒關係', pinyin: 'méi guān xi', meaning: 'Không sao đâu', difficulty: 'Easy' },
      { traditional: '再見', pinyin: 'zài jiàn', meaning: 'Tạm biệt', difficulty: 'Easy' },
      { traditional: '早安', pinyin: 'zǎo ān', meaning: 'Chào buổi sáng', difficulty: 'Easy' },
      { traditional: '晚安', pinyin: 'wǎn ān', meaning: 'Chúc ngủ ngon', difficulty: 'Easy' },
      { traditional: '好久不見', pinyin: 'hǎo jiǔ bú jiàn', meaning: 'Lâu rồi không gặp', difficulty: 'Easy' },
      { traditional: '請', pinyin: 'qǐng', meaning: 'Mời / Xin vui lòng', difficulty: 'Easy' },
      { traditional: '是', pinyin: 'shì', meaning: 'Đúng / Phải', difficulty: 'Easy' },
      { traditional: '不是', pinyin: 'bú shì', meaning: 'Không phải', difficulty: 'Easy' },
      { traditional: '有', pinyin: 'yǒu', meaning: 'Có', difficulty: 'Easy' },
      { traditional: '沒有', pinyin: 'méi yǒu', meaning: 'Không có', difficulty: 'Easy' },
      { traditional: '幫忙', pinyin: 'bāng máng', meaning: 'Giúp đỡ', difficulty: 'Easy' },
      { traditional: '多少錢', pinyin: 'duō shǎo qián', meaning: 'Bao nhiêu tiền?', difficulty: 'Easy' }
    ]
  },
  {
    name: 'Số đếm và Thời gian',
    description: 'Học cách đếm số và nói về thời gian',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    icon: 'schedule',
    words: [
      { traditional: '一', pinyin: 'yī', meaning: 'Một', difficulty: 'Easy' },
      { traditional: '二', pinyin: 'èr', meaning: 'Hai', difficulty: 'Easy' },
      { traditional: '三', pinyin: 'sān', meaning: 'Ba', difficulty: 'Easy' },
      { traditional: '十', pinyin: 'shí', meaning: 'Mười', difficulty: 'Easy' },
      { traditional: '百', pinyin: 'bǎi', meaning: 'Trăm', difficulty: 'Easy' },
      { traditional: '今天', pinyin: 'jīn tiān', meaning: 'Hôm nay', difficulty: 'Easy' },
      { traditional: '明天', pinyin: 'míng tiān', meaning: 'Ngày mai', difficulty: 'Easy' },
      { traditional: '昨天', pinyin: 'zuó tiān', meaning: 'Hôm qua', difficulty: 'Easy' },
      { traditional: '現在', pinyin: 'xiàn zài', meaning: 'Bây giờ', difficulty: 'Easy' },
      { traditional: '點', pinyin: 'diǎn', meaning: 'Giờ (đồng hồ)', difficulty: 'Easy' },
      { traditional: '分', pinyin: 'fēn', meaning: 'Phút', difficulty: 'Easy' },
      { traditional: '早上', pinyin: 'zǎo shang', meaning: 'Buổi sáng', difficulty: 'Easy' },
      { traditional: '晚上', pinyin: 'wǎn shang', meaning: 'Buổi tối', difficulty: 'Easy' },
      { traditional: '星期', pinyin: 'xīng qī', meaning: 'Tuần / Thứ', difficulty: 'Easy' },
      { traditional: '年月', pinyin: 'nián yuè', meaning: 'Năm tháng', difficulty: 'Easy' }
    ]
  },
  {
    name: 'Gia đình',
    description: 'Từ vựng về các thành viên trong gia đình',
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    icon: 'family_restroom',
    words: [
      { traditional: '爸爸', pinyin: 'bà ba', meaning: 'Bố', difficulty: 'Easy' },
      { traditional: '媽媽', pinyin: 'mā ma', meaning: 'Mẹ', difficulty: 'Easy' },
      { traditional: '哥哥', pinyin: 'gē ge', meaning: 'Anh trai', difficulty: 'Easy' },
      { traditional: '弟弟', pinyin: 'dì di', meaning: 'Em trai', difficulty: 'Easy' },
      { traditional: '姐姐', pinyin: 'jiě jie', meaning: 'Chị gái', difficulty: 'Easy' },
      { traditional: '妹妹', pinyin: 'mèi mei', meaning: 'Em gái', difficulty: 'Easy' },
      { traditional: '爺爺', pinyin: 'yé ye', meaning: 'Ông nội', difficulty: 'Easy' },
      { traditional: '奶奶', pinyin: 'nǎi nai', meaning: 'Bà nội', difficulty: 'Easy' },
      { traditional: '家', pinyin: 'jiā', meaning: 'Nhà / Gia đình', difficulty: 'Easy' },
      { traditional: '孩子', pinyin: 'hái zi', meaning: 'Con cái / Trẻ em', difficulty: 'Easy' },
      { traditional: '兒子', pinyin: 'ér zi', meaning: 'Con trai', difficulty: 'Easy' },
      { traditional: '女兒', pinyin: 'nǚ ér', meaning: 'Con gái', difficulty: 'Easy' },
      { traditional: '結婚', pinyin: 'jié hūn', meaning: 'Kết hôn', difficulty: 'Easy' },
      { traditional: '愛', pinyin: 'ài', meaning: 'Yêu', difficulty: 'Easy' },
      { traditional: '朋友', pinyin: 'péng you', meaning: 'Bạn bè', difficulty: 'Easy' }
    ]
  },

  // MEDIUM
  {
    name: 'Nhà hàng & Ẩm thực',
    description: 'Gọi món và nói về đồ ăn',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    icon: 'restaurant',
    words: [
      { traditional: '菜單', pinyin: 'cài dān', meaning: 'Thực đơn', difficulty: 'Medium' },
      { traditional: '服務員', pinyin: 'fú wù yuán', meaning: 'Người phục vụ', difficulty: 'Medium' },
      { traditional: '點菜', pinyin: 'diǎn cài', meaning: 'Gọi món', difficulty: 'Medium' },
      { traditional: '好吃', pinyin: 'hǎo chī', meaning: 'Ngon', difficulty: 'Medium' },
      { traditional: '買單', pinyin: 'mǎi dān', meaning: 'Thanh toán', difficulty: 'Medium' },
      { traditional: '餐廳', pinyin: 'cān tīng', meaning: 'Nhà hàng', difficulty: 'Medium' },
      { traditional: '飲料', pinyin: 'yǐn liào', meaning: 'Đồ uống', difficulty: 'Medium' },
      { traditional: '牛肉麵', pinyin: 'niú ròu miàn', meaning: 'Mì bò', difficulty: 'Medium' },
      { traditional: '筷子', pinyin: 'kuài zi', meaning: 'Đũa', difficulty: 'Medium' },
      { traditional: '湯', pinyin: 'tāng', meaning: 'Canh / Súp', difficulty: 'Medium' },
      { traditional: '甜點', pinyin: 'tián diǎn', meaning: 'Tráng miệng', difficulty: 'Medium' },
      { traditional: '辣', pinyin: 'là', meaning: 'Cay', difficulty: 'Medium' },
      { traditional: '素食', pinyin: 'sù shí', meaning: 'Đồ chay', difficulty: 'Medium' },
      { traditional: '餓', pinyin: 'è', meaning: 'Đói', difficulty: 'Medium' },
      { traditional: '飽', pinyin: 'bǎo', meaning: 'No', difficulty: 'Medium' }
    ]
  },
  {
    name: 'Du lịch & Đi lại',
    description: 'Từ vựng khi đi du lịch và phương tiện',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    icon: 'flight',
    words: [
      { traditional: '飛機', pinyin: 'fēi jī', meaning: 'Máy bay', difficulty: 'Medium' },
      { traditional: '護照', pinyin: 'hù zhào', meaning: 'Hộ chiếu', difficulty: 'Medium' },
      { traditional: '行李', pinyin: 'xíng lǐ', meaning: 'Hành lý', difficulty: 'Medium' },
      { traditional: '飯店', pinyin: 'fàn diàn', meaning: 'Khách sạn', difficulty: 'Medium' },
      { traditional: '訂票', pinyin: 'dìng piào', meaning: 'Đặt vé', difficulty: 'Medium' },
      { traditional: '公車', pinyin: 'gōng chē', meaning: 'Xe buýt', difficulty: 'Medium' },
      { traditional: '捷運', pinyin: 'jié yùn', meaning: 'Tàu điện ngầm (MRT)', difficulty: 'Medium' },
      { traditional: '車站', pinyin: 'chē zhàn', meaning: 'Nhà ga / Bến xe', difficulty: 'Medium' },
      { traditional: '地圖', pinyin: 'dì tú', meaning: 'Bản đồ', difficulty: 'Medium' },
      { traditional: '風景', pinyin: 'fēng jǐng', meaning: 'Phong cảnh', difficulty: 'Medium' },
      { traditional: '照片', pinyin: 'zhào piàn', meaning: 'Bức ảnh', difficulty: 'Medium' },
      { traditional: '出發', pinyin: 'chū fā', meaning: 'Xuất phát', difficulty: 'Medium' },
      { traditional: '到達', pinyin: 'dào dá', meaning: 'Đến nơi', difficulty: 'Medium' },
      { traditional: '迷路', pinyin: 'mí lù', meaning: 'Lạc đường', difficulty: 'Medium' },
      { traditional: '觀光', pinyin: 'guān guāng', meaning: 'Tham quan', difficulty: 'Medium' }
    ]
  },
  {
    name: 'Mua sắm',
    description: 'Từ vựng dùng khi mua sắm, trả giá',
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    icon: 'shopping_bag',
    words: [
      { traditional: '商店', pinyin: 'shāng diàn', meaning: 'Cửa hàng', difficulty: 'Medium' },
      { traditional: '衣服', pinyin: 'yī fu', meaning: 'Quần áo', difficulty: 'Medium' },
      { traditional: '試穿', pinyin: 'shì chuān', meaning: 'Mặc thử', difficulty: 'Medium' },
      { traditional: '打折', pinyin: 'dǎ zhé', meaning: 'Giảm giá', difficulty: 'Medium' },
      { traditional: '便宜', pinyin: 'pián yi', meaning: 'Rẻ', difficulty: 'Medium' },
      { traditional: '貴', pinyin: 'guì', meaning: 'Đắt', difficulty: 'Medium' },
      { traditional: '現金', pinyin: 'xiàn jīn', meaning: 'Tiền mặt', difficulty: 'Medium' },
      { traditional: '信用卡', pinyin: 'xìn yòng kǎ', meaning: 'Thẻ tín dụng', difficulty: 'Medium' },
      { traditional: '收據', pinyin: 'shōu jù', meaning: 'Hóa đơn', difficulty: 'Medium' },
      { traditional: '退貨', pinyin: 'tuì huò', meaning: 'Trả hàng', difficulty: 'Medium' },
      { traditional: '尺寸', pinyin: 'chǐ cùn', meaning: 'Kích cỡ', difficulty: 'Medium' },
      { traditional: '錢包', pinyin: 'qián bāo', meaning: 'Ví tiền', difficulty: 'Medium' },
      { traditional: '市場', pinyin: 'shì chǎng', meaning: 'Chợ', difficulty: 'Medium' },
      { traditional: '顧客', pinyin: 'gù kè', meaning: 'Khách hàng', difficulty: 'Medium' },
      { traditional: '品質', pinyin: 'pǐn zhí', meaning: 'Chất lượng', difficulty: 'Medium' }
    ]
  },

  // HARD
  {
    name: 'Kinh doanh & Công việc',
    description: 'Từ vựng chuyên ngành kinh tế và văn phòng',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    icon: 'business_center',
    words: [
      { traditional: '會議', pinyin: 'huì yì', meaning: 'Cuộc họp', difficulty: 'Hard' },
      { traditional: '老闆', pinyin: 'lǎo bǎn', meaning: 'Ông chủ', difficulty: 'Hard' },
      { traditional: '同事', pinyin: 'tóng shì', meaning: 'Đồng nghiệp', difficulty: 'Hard' },
      { traditional: '薪水', pinyin: 'xīn shuǐ', meaning: 'Lương', difficulty: 'Hard' },
      { traditional: '辭職', pinyin: 'cí zhí', meaning: 'Từ chức', difficulty: 'Hard' },
      { traditional: '面試', pinyin: 'miàn shì', meaning: 'Phỏng vấn', difficulty: 'Hard' },
      { traditional: '合同', pinyin: 'hé tong', meaning: 'Hợp đồng', difficulty: 'Hard' },
      { traditional: '談判', pinyin: 'tán pàn', meaning: 'Đàm phán', difficulty: 'Hard' },
      { traditional: '投資', pinyin: 'tóu zī', meaning: 'Đầu tư', difficulty: 'Hard' },
      { traditional: '廣告', pinyin: 'guǎng gào', meaning: 'Quảng cáo', difficulty: 'Hard' },
      { traditional: '計劃', pinyin: 'jì huà', meaning: 'Kế hoạch', difficulty: 'Hard' },
      { traditional: '報告', pinyin: 'bào gào', meaning: 'Báo cáo', difficulty: 'Hard' },
      { traditional: '責任', pinyin: 'zé rèn', meaning: 'Trách nhiệm', difficulty: 'Hard' },
      { traditional: '效率', pinyin: 'xiào lǜ', meaning: 'Hiệu suất', difficulty: 'Hard' },
      { traditional: '成功', pinyin: 'chéng gōng', meaning: 'Thành công', difficulty: 'Hard' }
    ]
  },
  {
    name: 'Y tế & Sức khỏe',
    description: 'Từ vựng về bệnh viện và sức khỏe',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    icon: 'medical_services',
    words: [
      { traditional: '醫院', pinyin: 'yī yuàn', meaning: 'Bệnh viện', difficulty: 'Hard' },
      { traditional: '醫生', pinyin: 'yī shēng', meaning: 'Bác sĩ', difficulty: 'Hard' },
      { traditional: '護士', pinyin: 'hù shi', meaning: 'Y tá', difficulty: 'Hard' },
      { traditional: '感冒', pinyin: 'gǎn mào', meaning: 'Cảm cúm', difficulty: 'Hard' },
      { traditional: '發燒', pinyin: 'fā shāo', meaning: 'Sốt', difficulty: 'Hard' },
      { traditional: '掛號', pinyin: 'guà hào', meaning: 'Đăng ký khám', difficulty: 'Hard' },
      { traditional: '藥局', pinyin: 'yào jú', meaning: 'Hiệu thuốc', difficulty: 'Hard' },
      { traditional: '檢查', pinyin: 'jiǎn chá', meaning: 'Kiểm tra', difficulty: 'Hard' },
      { traditional: '保險', pinyin: 'bǎo xiǎn', meaning: 'Bảo hiểm', difficulty: 'Hard' },
      { traditional: '手術', pinyin: 'shǒu shù', meaning: 'Phẫu thuật', difficulty: 'Hard' },
      { traditional: '症狀', pinyin: 'zhèng zhuàng', meaning: 'Triệu chứng', difficulty: 'Hard' },
      { traditional: '恢復', pinyin: 'huī fù', meaning: 'Hồi phục', difficulty: 'Hard' },
      { traditional: '健康', pinyin: 'jiàn kāng', meaning: 'Sức khỏe', difficulty: 'Hard' },
      { traditional: '嚴重', pinyin: 'yán zhòng', meaning: 'Nghiêm trọng', difficulty: 'Hard' },
      { traditional: '治療', pinyin: 'zhì liáo', meaning: 'Điều trị', difficulty: 'Hard' }
    ]
  },
  {
    name: 'Cảm xúc & Tính cách',
    description: 'Diễn tả cảm xúc và tính cách con người',
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    icon: 'psychology',
    words: [
      { traditional: '快樂', pinyin: 'kuài lè', meaning: 'Hạnh phúc', difficulty: 'Hard' },
      { traditional: '難過', pinyin: 'nán guò', meaning: 'Buồn bã', difficulty: 'Hard' },
      { traditional: '生氣', pinyin: 'shēng qì', meaning: 'Tức giận', difficulty: 'Hard' },
      { traditional: '擔心', pinyin: 'dān xīn', meaning: 'Lo lắng', difficulty: 'Hard' },
      { traditional: '緊張', pinyin: 'jǐn zhāng', meaning: 'Căng thẳng', difficulty: 'Hard' },
      { traditional: '害怕', pinyin: 'hài pà', meaning: 'Sợ hãi', difficulty: 'Hard' },
      { traditional: '興奮', pinyin: 'xīng fèn', meaning: 'Hào hứng', difficulty: 'Hard' },
      { traditional: '尷尬', pinyin: 'gān gà', meaning: 'Ngại ngùng / Xấu hổ', difficulty: 'Hard' },
      { traditional: '後悔', pinyin: 'hòu huǐ', meaning: 'Hối hận', difficulty: 'Hard' },
      { traditional: '失望', pinyin: 'shī wàng', meaning: 'Thất vọng', difficulty: 'Hard' },
      { traditional: '誠實', pinyin: 'chéng shí', meaning: 'Thành thật', difficulty: 'Hard' },
      { traditional: '勇敢', pinyin: 'yǒng gǎn', meaning: 'Dũng cảm', difficulty: 'Hard' },
      { traditional: '聰明', pinyin: 'cōng míng', meaning: 'Thông minh', difficulty: 'Hard' },
      { traditional: '溫柔', pinyin: 'wēn róu', meaning: 'Dịu dàng', difficulty: 'Hard' },
      { traditional: '幽默', pinyin: 'yōu mò', meaning: 'Hài hước', difficulty: 'Hard' }
    ]
  }
];

async function seedData() {
  try {
    console.log('Connecting to database...');
    const { db } = await connectToDatabase();
    
    console.log(`Starting seed for User ID: ${ADMIN_ID}`);

    for (const catData of CATEGORY_SETS) {
      // 1. Create Category
      const category = {
        userId: ADMIN_ID,
        name: catData.name,
        description: catData.description,
        difficulty: catData.difficulty,
        icon: catData.icon,
        isPrivate: false, // Explicitly Public for this seed
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Check if exists to avoid duplicates (by name + userId)
      const existingCat = await db.collection(COLLECTIONS.CATEGORIES).findOne({
        userId: ADMIN_ID,
        name: catData.name
      });

      let categoryId;

      if (existingCat) {
        console.log(`Category "${catData.name}" already exists. Updating...`);
        await db.collection(COLLECTIONS.CATEGORIES).updateOne(
          { _id: existingCat._id },
          { $set: category }
        );
        categoryId = existingCat._id;
      } else {
        const result = await db.collection(COLLECTIONS.CATEGORIES).insertOne(category);
        categoryId = result.insertedId;
        console.log(`Created Category: ${catData.name}`);
      }

      // 2. Insert Vocabulary
      const wordsToInsert = catData.words.map(w => ({
        categoryId: categoryId,
        traditional: w.traditional,
        simplified: w.traditional, // Simplification for demo
        pinyin: w.pinyin,
        meaning: w.meaning,
        difficulty: w.difficulty,
        examples: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Delete old words for this category to clean slate
      await db.collection(COLLECTIONS.VOCABULARY).deleteMany({ categoryId: categoryId });
      
      const vocabResult = await db.collection(COLLECTIONS.VOCABULARY).insertMany(wordsToInsert);
      console.log(`  Added ${vocabResult.insertedCount} vocabulary words to "${catData.name}"`);
    }

    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Seed Error:', error);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run the seed
seedData();
