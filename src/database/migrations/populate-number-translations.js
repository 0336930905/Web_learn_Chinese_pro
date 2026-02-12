/**
 * Populate Number Translations
 * Updates meaningEn and meaningTw for number vocabulary (Số 0-20)
 */

const { MongoClient } = require('mongodb');
const { config } = require('../../config');

async function populateNumberTranslations() {
  const client = new MongoClient(config.database.uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(config.database.name);
    const vocabulary = db.collection('vocabulary');
    
    // Translation mappings for numbers
    const numberTranslations = {
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
      
      // Add more translations for other common categories
      'Màu đỏ': { en: 'Red color', tw: '紅色' },
      'Màu xanh': { en: 'Blue color', tw: '藍色' },
      'Màu vàng': { en: 'Yellow color', tw: '黃色' },
      'Màu xanh lá': { en: 'Green color', tw: '綠色' },
      'Màu cam': { en: 'Orange color', tw: '橙色' },
      'Màu tím': { en: 'Purple color', tw: '紫色' },
      'Màu hồng': { en: 'Pink color', tw: '粉紅色' },
      'Màu trắng': { en: 'White color', tw: '白色' },
      'Màu đen': { en: 'Black color', tw: '黑色' },
      
      'Xin chào': { en: 'Hello', tw: '你好' },
      'Cảm ơn': { en: 'Thank you', tw: '謝謝' },
      'Tạm biệt': { en: 'Goodbye', tw: '再見' },
      'Xin lỗi': { en: 'Sorry', tw: '對不起' },
      'Có': { en: 'Yes', tw: '是' },
      'Không': { en: 'No', tw: '不是' },
      
      'Bố': { en: 'Father', tw: '父親' },
      'Mẹ': { en: 'Mother', tw: '母親' },
      'Anh trai': { en: 'Older brother', tw: '哥哥' },
      'Em trai': { en: 'Younger brother', tw: '弟弟' },
      'Chị gái': { en: 'Older sister', tw: '姐姐' },
      'Em gái': { en: 'Younger sister', tw: '妹妹' },
      
      'Gạo': { en: 'Rice', tw: '米飯' },
      'Nước': { en: 'Water', tw: '水' },
      'Trà': { en: 'Tea', tw: '茶' },
      'Cà phê': { en: 'Coffee', tw: '咖啡' },
      'Sữa': { en: 'Milk', tw: '牛奶' },
      'Bánh mì': { en: 'Bread', tw: '麵包' },
      
      'Chó': { en: 'Dog', tw: '狗' },
      'Mèo': { en: 'Cat', tw: '貓' },
      'Chim': { en: 'Bird', tw: '鳥' },
      'Cá': { en: 'Fish', tw: '魚' },
      'Voi': { en: 'Elephant', tw: '大象' },
      'Sư tử': { en: 'Lion', tw: '獅子' },
    };
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // Update each vocabulary item with translations
    for (const [viMeaning, translations] of Object.entries(numberTranslations)) {
      const result = await vocabulary.updateMany(
        { meaning: viMeaning },
        { 
          $set: { 
            meaningEn: translations.en, 
            meaningTw: translations.tw 
          } 
        }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated "${viMeaning}" → EN: "${translations.en}", TW: "${translations.tw}" (${result.modifiedCount} items)`);
        updatedCount += result.modifiedCount;
      } else {
        console.log(`⚠️  Not found: "${viMeaning}"`);
        notFoundCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} vocabulary items`);
    console.log(`   ⚠️  Not found: ${notFoundCount} meanings`);
    console.log(`   📝 Total processed: ${Object.keys(numberTranslations).length} translations`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run migration if executed directly
if (require.main === module) {
  populateNumberTranslations()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { populateNumberTranslations };
