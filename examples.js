const { connectDB, getDB, closeDB } = require('./database/connection');
const { ObjectId } = require('mongodb');

/**
 * Example: Các thao tác cơ bản với database
 */

async function examples() {
  try {
    // Kết nối database
    await connectDB();
    const db = getDB();
    
    console.log('\n📚 EXAMPLES - Database Operations\n');
    
    // =====================================================
    // 1. LẤY DANH SÁCH CATEGORIES CỦA ADMIN (PUBLIC)
    // =====================================================
    console.log('1️⃣ Lấy danh sách categories của Admin:');
    const adminCategories = await db.collection('categories')
      .find({ type: 'admin', isPublic: true })
      .sort({ order: 1 })
      .toArray();
    
    console.log(`   Tìm thấy ${adminCategories.length} categories:`);
    adminCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.wordCount} từ)`);
    });
    
    // =====================================================
    // 2. LẤY TỪ VỰNG THEO CATEGORY
    // =====================================================
    console.log('\n2️⃣ Lấy từ vựng theo category:');
    if (adminCategories.length > 0) {
      const firstCategory = adminCategories[0];
      const vocabulary = await db.collection('vocabulary')
        .find({ categoryId: firstCategory._id })
        .limit(5)
        .toArray();
      
      console.log(`   Category: ${firstCategory.name}`);
      vocabulary.forEach(word => {
        console.log(`   - ${word.traditional} (${word.pinyin}) = ${word.vietnamese}`);
      });
    }
    
    // =====================================================
    // 3. TÌM KIẾM TỪ VỰNG (TEXT SEARCH)
    // =====================================================
    console.log('\n3️⃣ Tìm kiếm từ vựng:');
    const searchResults = await db.collection('vocabulary')
      .find({ 
        $or: [
          { traditional: { $regex: '早', $options: 'i' } },
          { vietnamese: { $regex: 'sáng', $options: 'i' } }
        ]
      })
      .toArray();
    
    console.log(`   Tìm thấy ${searchResults.length} từ:`);
    searchResults.forEach(word => {
      console.log(`   - ${word.traditional} = ${word.vietnamese}`);
    });
    
    // =====================================================
    // 4. LẤY THÔNG TIN USER VÀ STATS
    // =====================================================
    console.log('\n4️⃣ Thông tin học viên:');
    const student = await db.collection('users')
      .findOne({ role: 'student' });
    
    if (student) {
      console.log(`   Email: ${student.email}`);
      console.log(`   Cấp độ: ${student.stats.level}`);
      console.log(`   Kinh nghiệm: ${student.stats.experience}`);
      console.log(`   Tổng từ đã học: ${student.stats.totalWords}`);
      console.log(`   Chuỗi học hiện tại: ${student.streak.current} ngày`);
      console.log(`   Độ chính xác: ${student.stats.accuracy}%`);
    }
    
    // =====================================================
    // 5. LẤY TỪ CẦN ÔN TẬP HÔM NAY
    // =====================================================
    console.log('\n5️⃣ Từ vựng cần ôn tập hôm nay:');
    if (student) {
      const today = new Date();
      const wordsToReview = await db.collection('user_progress')
        .find({
          userId: student._id,
          nextReviewDate: { $lte: today }
        })
        .toArray();
      
      console.log(`   Có ${wordsToReview.length} từ cần ôn tập`);
      
      // Lấy chi tiết từ vựng
      for (const progress of wordsToReview.slice(0, 3)) {
        const vocab = await db.collection('vocabulary')
          .findOne({ _id: progress.vocabularyId });
        if (vocab) {
          console.log(`   - ${vocab.traditional} (Level ${progress.memoryLevel})`);
        }
      }
    }
    
    // =====================================================
    // 6. TOP 10 HỌC VIÊN
    // =====================================================
    console.log('\n6️⃣ Top 10 học viên:');
    const topStudents = await db.collection('users')
      .find({ role: 'student' })
      .sort({ 'stats.experience': -1 })
      .limit(10)
      .toArray();
    
    topStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} - ${student.stats.experience} exp (Level ${student.stats.level})`);
    });
    
    // =====================================================
    // 7. LỊCH SỬ HOẠT ĐỘNG 7 NGÀY GẦN NHẤT
    // =====================================================
    console.log('\n7️⃣ Lịch sử hoạt động (7 ngày):');
    if (student) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activities = await db.collection('activities')
        .aggregate([
          {
            $match: {
              userId: student._id,
              createdAt: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ])
        .toArray();
      
      activities.forEach(activity => {
        console.log(`   - ${activity._id}: ${activity.count} lần`);
      });
    }
    
    // =====================================================
    // 8. THỐNG KÊ TỪ VỰNG THEO DIFFICULTY
    // =====================================================
    console.log('\n8️⃣ Thống kê từ vựng theo độ khó:');
    const vocabStats = await db.collection('vocabulary')
      .aggregate([
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
      .toArray();
    
    vocabStats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} từ`);
    });
    
    // =====================================================
    // 9. CẬP NHẬT TIẾN ĐỘ HỌC TẬP (EXAMPLE)
    // =====================================================
    console.log('\n9️⃣ Cập nhật tiến độ học tập:');
    
    // Lấy một từ vựng để example
    const vocabularyList = await db.collection('vocabulary').find().limit(1).toArray();
    
    if (student && vocabularyList.length > 0) {
      const vocabToLearn = vocabularyList[0];
      const isCorrect = true; // Giả sử trả lời đúng
      
      // Calculate next review date based on spaced repetition
      const currentLevel = 1;
      const newLevel = isCorrect ? currentLevel + 1 : 1;
      const intervals = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + intervals[newLevel]);
      
      await db.collection('user_progress').updateOne(
        { 
          userId: student._id, 
          vocabularyId: vocabToLearn._id 
        },
        {
          $set: {
            memoryLevel: newLevel,
            nextReviewDate: nextReviewDate,
            lastStudiedAt: new Date(),
            updatedAt: new Date()
          },
          $inc: {
            reviewCount: 1,
            correctCount: isCorrect ? 1 : 0,
            wrongCount: isCorrect ? 0 : 1
          }
        },
        { upsert: true }
      );
      
      console.log(`   ✅ Đã cập nhật tiến độ cho từ: ${vocabToLearn.traditional}`);
      console.log(`   Memory Level: ${newLevel}/5`);
      console.log(`   Ôn lại sau: ${intervals[newLevel]} ngày`);
    }
    
    // =====================================================
    // 10. TẠO THÔNG BÁO
    // =====================================================
    console.log('\n🔟 Tạo thông báo:');
    if (student) {
      await db.collection('notifications').insertOne({
        userId: student._id,
        type: 'achievement',
        title: 'Chúc mừng!',
        message: 'Bạn đã hoàn thành 5 từ vựng hôm nay!',
        data: { wordsCompleted: 5 },
        isRead: false,
        createdAt: new Date()
      });
      console.log('   ✅ Đã tạo thông báo mới');
    }
    
    console.log('\n✅ Examples completed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closeDB();
  }
}

// Run examples
examples();
