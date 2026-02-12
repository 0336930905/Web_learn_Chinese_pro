/**
 * Translation Service
 * Auto-translate vocabulary meanings from Vietnamese to English and Traditional Chinese
 */

class TranslationService {
  constructor() {
    // Comprehensive translation dictionary
    this.translations = {
      // Numbers 0-20
      'Số 0': { en: 'Number 0', tw: '數字0' },
      'Số 1': { en: 'Number 1', tw: '數字1' },
      'Số 2': { en: 'Number 2', tw: '數字2' },
      'Số 3': { en: 'Number 3', tw: '數字3' },
      'Số 4': { en: 'Number 4', tw: '數字4' },
      'Số 5': { en: 'Number 5', tw: '數字5' },
      'Số 6': { en: 'Number 6', tw: '數字6' },
      'Số 7': { en: 'Number 7', tw: '數字7' },
      'Số 8': { en: 'Number 8', tw: '數字8' },
      'Số 9': { en: 'Number 9', tw: '數字9' },
      'Số 10': { en: 'Number 10', tw: '數字10' },
      'Số 11': { en: 'Number 11', tw: '數字11' },
      'Số 12': { en: 'Number 12', tw: '數字12' },
      'Số 13': { en: 'Number 13', tw: '數字13' },
      'Số 14': { en: 'Number 14', tw: '數字14' },
      'Số 15': { en: 'Number 15', tw: '數字15' },
      'Số 16': { en: 'Number 16', tw: '數字16' },
      'Số 17': { en: 'Number 17', tw: '數字17' },
      'Số 18': { en: 'Number 18', tw: '數字18' },
      'Số 19': { en: 'Number 19', tw: '數字19' },
      'Số 20': { en: 'Number 20', tw: '數字20' },
      
      // Colors
      'Màu đỏ': { en: 'Red', tw: '紅色' },
      'Màu xanh': { en: 'Blue', tw: '藍色' },
      'Màu vàng': { en: 'Yellow', tw: '黃色' },
      'Màu xanh lá': { en: 'Green', tw: '綠色' },
      'Màu cam': { en: 'Orange', tw: '橙色' },
      'Màu tím': { en: 'Purple', tw: '紫色' },
      'Màu hồng': { en: 'Pink', tw: '粉紅色' },
      'Màu trắng': { en: 'White', tw: '白色' },
      'Màu đen': { en: 'Black', tw: '黑色' },
      'Màu nâu': { en: 'Brown', tw: '棕色' },
      'Màu xám': { en: 'Gray', tw: '灰色' },
      
      // Greetings
      'Xin chào': { en: 'Hello', tw: '你好' },
      'Cảm ơn': { en: 'Thank you', tw: '謝謝' },
      'Tạm biệt': { en: 'Goodbye', tw: '再見' },
      'Xin lỗi': { en: 'Sorry', tw: '對不起' },
      'Vâng': { en: 'Yes', tw: '是' },
      'Không': { en: 'No', tw: '不是' },
      'Chào buổi sáng': { en: 'Good morning', tw: '早安' },
      'Chào buổi chiều': { en: 'Good afternoon', tw: '午安' },
      'Chúc ngủ ngon': { en: 'Good night', tw: '晚安' },
      'Bạn khỏe không?': { en: 'How are you?', tw: '你好嗎？' },
      
      // Family
      'Bố': { en: 'Father', tw: '父親' },
      'Mẹ': { en: 'Mother', tw: '母親' },
      'Anh trai': { en: 'Older brother', tw: '哥哥' },
      'Em trai': { en: 'Younger brother', tw: '弟弟' },
      'Chị gái': { en: 'Older sister', tw: '姐姐' },
      'Em gái': { en: 'Younger sister', tw: '妹妹' },
      'Ông': { en: 'Grandfather', tw: '爺爺' },
      'Bà': { en: 'Grandmother', tw: '奶奶' },
      'Con trai': { en: 'Son', tw: '兒子' },
      'Con gái': { en: 'Daughter', tw: '女兒' },
      
      // Food & Drinks
      'Cơm': { en: 'Rice', tw: '米飯' },
      'Gạo': { en: 'Rice (uncooked)', tw: '米' },
      'Nước': { en: 'Water', tw: '水' },
      'Trà': { en: 'Tea', tw: '茶' },
      'Cà phê': { en: 'Coffee', tw: '咖啡' },
      'Sữa': { en: 'Milk', tw: '牛奶' },
      'Bánh mì': { en: 'Bread', tw: '麵包' },
      'Thịt': { en: 'Meat', tw: '肉' },
      'Rau': { en: 'Vegetables', tw: '蔬菜' },
      'Trái cây': { en: 'Fruit', tw: '水果' },
      'Táo': { en: 'Apple', tw: '蘋果' },
      'Chuối': { en: 'Banana', tw: '香蕉' },
      'Cam': { en: 'Orange', tw: '橙子' },
      
      // Animals
      'Chó': { en: 'Dog', tw: '狗' },
      'Mèo': { en: 'Cat', tw: '貓' },
      'Chim': { en: 'Bird', tw: '鳥' },
      'Cá': { en: 'Fish', tw: '魚' },
      'Gà': { en: 'Chicken', tw: '雞' },
      'Vịt': { en: 'Duck', tw: '鴨' },
      'Lợn': { en: 'Pig', tw: '豬' },
      'Bò': { en: 'Cow', tw: '牛' },
      'Ngựa': { en: 'Horse', tw: '馬' },
      'Voi': { en: 'Elephant', tw: '大象' },
      'Sư tử': { en: 'Lion', tw: '獅子' },
      'Hổ': { en: 'Tiger', tw: '老虎' },
      'Khỉ': { en: 'Monkey', tw: '猴子' },
      'Gấu': { en: 'Bear', tw: '熊' },
      
      // Work Communication
      'Xin chào': { en: 'Hello', tw: '你好' },
      'Tên tôi là': { en: 'My name is', tw: '我叫' },
      'Rất vui được gặp bạn': { en: 'Nice to meet you', tw: '很高興見到你' },
      'Công việc': { en: 'Work', tw: '工作' },
      'Văn phòng': { en: 'Office', tw: '辦公室' },
      'Họp': { en: 'Meeting', tw: '會議' },
      'Email': { en: 'Email', tw: '電子郵件' },
      'Điện thoại': { en: 'Phone', tw: '電話' },
      'Máy tính': { en: 'Computer', tw: '電腦' },
      
      // Emotions & Personality
      'Vui': { en: 'Happy', tw: '快樂' },
      'Buồn': { en: 'Sad', tw: '悲傷' },
      'Tức giận': { en: 'Angry', tw: '生氣' },
      'Sợ hãi': { en: 'Scared', tw: '害怕' },
      'Ngạc nhiên': { en: 'Surprised', tw: '驚訝' },
      'Thích': { en: 'Like', tw: '喜歡' },
      'Ghét': { en: 'Hate', tw: '討厭' },
      'Yêu': { en: 'Love', tw: '愛' },
      'Tốt': { en: 'Good', tw: '好' },
      'Xấu': { en: 'Bad', tw: '壞' },
      
      // Travel
      'Sân bay': { en: 'Airport', tw: '機場' },
      'Khách sạn': { en: 'Hotel', tw: '酒店' },
      'Nhà hàng': { en: 'Restaurant', tw: '餐廳' },
      'Ga tàu': { en: 'Train station', tw: '火車站' },
      'Bến xe buýt': { en: 'Bus station', tw: '公車站' },
      'Taxi': { en: 'Taxi', tw: '計程車' },
      'Vé': { en: 'Ticket', tw: '票' },
      'Hộ chiếu': { en: 'Passport', tw: '護照' },
      'Hành lý': { en: 'Luggage', tw: '行李' },
      'Bản đồ': { en: 'Map', tw: '地圖' },
    };
  }

  /**
   * Translate Vietnamese meaning to target language
   * @param {string} viMeaning - Vietnamese meaning
   * @param {string} targetLang - Target language ('en' or 'tw')
   * @returns {string} - Translated meaning or original if not found
   */
  translate(viMeaning, targetLang) {
    if (targetLang === 'vi') {
      return viMeaning; // No translation needed for Vietnamese
    }

    const translation = this.translations[viMeaning];
    if (translation && translation[targetLang]) {
      return translation[targetLang];
    }

    // Return original if translation not found
    return viMeaning;
  }

  /**
   * Check if translation exists for a meaning
   * @param {string} viMeaning - Vietnamese meaning
   * @returns {boolean}
   */
  hasTranslation(viMeaning) {
    return this.translations.hasOwnProperty(viMeaning);
  }

  /**
   * Get all available translations for a meaning
   * @param {string} viMeaning - Vietnamese meaning
   * @returns {object} - Object with vi, en, tw properties
   */
  getAllTranslations(viMeaning) {
    const translation = this.translations[viMeaning];
    return {
      vi: viMeaning,
      en: translation?.en || viMeaning,
      tw: translation?.tw || viMeaning
    };
  }

  /**
   * Add new translation to dictionary
   * @param {string} viMeaning - Vietnamese meaning
   * @param {string} enMeaning - English meaning
   * @param {string} twMeaning - Traditional Chinese meaning
   */
  addTranslation(viMeaning, enMeaning, twMeaning) {
    this.translations[viMeaning] = {
      en: enMeaning,
      tw: twMeaning
    };
  }

  /**
   * Get statistics about translations
   * @returns {object} - Statistics object
   */
  getStats() {
    const total = Object.keys(this.translations).length;
    const categories = {
      numbers: Object.keys(this.translations).filter(k => k.startsWith('Số ')).length,
      colors: Object.keys(this.translations).filter(k => k.startsWith('Màu ')).length,
      animals: Object.keys(this.translations).filter(k => ['Chó', 'Mèo', 'Chim', 'Cá', 'Gà', 'Vịt', 'Lợn', 'Bò', 'Ngựa', 'Voi', 'Sư tử', 'Hổ', 'Khỉ', 'Gấu'].includes(k)).length,
    };
    
    return {
      total,
      categories,
      coverage: `${total} vocabulary items`
    };
  }
}

module.exports = TranslationService;
