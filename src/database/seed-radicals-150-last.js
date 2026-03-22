const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const userId = "698774fd2b91e18abd156b3f";
const categoryName = "bộ thủ 150-các từ còn lại";

const rawData = `貝	bèi	Bộ bối	Tiền bạc, vỏ sò
赤	chì	Bộ xích	Màu đỏ
走	zǒu	Bộ tẩu	Đi bộ, chạy
足	zú	Bộ túc	Chân, bước chân
身	shēn	Bộ thân	Thân thể, thân mình
車	chē	Bộ xa	Xe cộ
辛	xīn	Bộ tân	Cay, vất vả
辰	chén	Bộ thần	Nhật nguyệt, thời gian (can chi)
辵	chuò	Bộ sước	Chợt đi chợt dừng (bộ quai sước)
邑	yì	Bộ dậu	Vùng đất, kinh đô
阝	yì	Bộ dậu phải	Vùng đất (dạng bên phải chữ)
酉	yǒu	Bộ phu	Rượu, chi Dậu
釆	biàn	Bộ thích	Phân biệt, làm rõ
里	lǐ	Bộ lý	Làng xóm, dặm (đo lường)
金	jīn	Bộ kim	Kim loại, vàng
長	cháng	Bộ trường	Dài, đứng đầu
門	mén	Bộ môn	Cửa hai cánh
阜	fù	Bộ phụ	Gò đất, đống đất
隶	lì	Bộ lệ	Kịp, bắt kịp
隹	zhuī	Bộ chuy	Chim đuôi ngắn
雨	yǔ	Bộ vũ	Mưa
青	qīng	Bộ thanh	Màu xanh
非	fēi	Bộ phi	Sai lầm, không phải
面	miàn	Bộ diện	Mặt, bề mặt
革	gé	Bộ cách	Da thú đã thuộc
韋	wéi	Bộ vi	Da thú, vây quanh
音	yīn	Bộ âm	Âm thanh
頁	yè	Bộ hiệt	Trang giấy, đầu
風	fēng	Bộ phong	Gió
飛	fēi	Bộ phi	Bay
食	shí	Bộ thực	Ăn, thực phẩm
首	shǒu	Bộ thủ	Đầu, bắt đầu
香	xiāng	Bộ hương	Mùi thơm
馬	mǎ	Bộ mã	Con ngựa
骨	gǔ	Bộ cốt	Xương
高	gāo	Bộ cao	Cao ráo
髟	biāo	Bộ phát	Tóc dài, bờm
鬥	dòu	Bộ đấu	Đánh nhau, chiến đấu
鬯	chàng	Bộ tấn	Rượu nghệ, lễ tế
鬼	guǐ	Bộ quỷ	Con quỷ, ma quỷ
魚	yú	Bộ ngư	Con cá
鳥	niǎo	Bộ điểu	Con chim
鹿	lù	Bộ lộc	Con hươu
麥	mài	Bộ mạch	Lúa mạch
麻	má	Bộ ma	Cây gai, cây ma
黃	huáng	Bộ hoàng	Màu vàng
黍	shǔ	Bộ thử	Lúa nếp
黑	hēi	Bộ hắc	Màu đen
黹	zhǐ	Bộ chỉ	Thêu thùa, may vá
黽	mǐn	Bộ mặc	Con ếch, động vật lưỡng cư
鼎	dǐng	Bộ đỉnh	Cái đỉnh (đồ tế lễ)
鼓	gǔ	Bộ cổ	Cái trống
鼠	shǔ	Bộ thử	Con chuột
鼻	bí	Bộ tị	Cái mũi
齊	qí	Bộ tề	Ngang bằng, chỉnh tề
齒	chǐ	Bộ xỉ	Răng
龍	lóng	Bộ long	Con rồng
龜	guī	Bộ quy	Con rùa
龠	yuè	Bộ quy	Nhạc khí, ống sáo`;

async function seedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(process.env.DB_NAME || 'learn-taiwanese-pro');
    const categoriesCollection = db.collection('categories');
    const vocabularyCollection = db.collection('vocabulary');

    // Step 1: Create or get Category
    console.log(`Creating category: "${categoryName}"...`);
    const categoryDoc = {
      name: categoryName,
      userId: new ObjectId(userId),
      description: '50 bộ thủ cơ bản cho người mới bắt đầu (150+)',
      isPrivate: true,
      difficulty: 'beginner',
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if category already exists
    let categoryId;
    const existingCategory = await categoriesCollection.findOne({
      name: categoryName,
      userId: new ObjectId(userId)
    });

    if (existingCategory) {
      console.log(`Category already exists with ID: ${existingCategory._id}`);
      categoryId = existingCategory._id;
    } else {
      const catResult = await categoriesCollection.insertOne(categoryDoc);
      categoryId = catResult.insertedId;
      console.log(`Category created with ID: ${categoryId}`);
    }

    // Step 2: Parse and insert Vocabulary
    const lines = rawData.split('\n').filter(line => line.trim() !== '');
    const documentsToInsert = [];

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 4) {
        const character = parts[0].trim();
        const pinyin = parts[1].trim();
        const radicalName = parts[2].trim();
        const meaning = parts[3].trim();

        documentsToInsert.push({
          categoryId: categoryId,
          traditional: character,
          simplified: character,
          pinyin: pinyin,
          meaning: `${radicalName} - ${meaning}`,
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    if (documentsToInsert.length > 0) {
      const vocabResult = await vocabularyCollection.insertMany(documentsToInsert);
      console.log(`Successfully inserted ${vocabResult.insertedCount} vocabulary items into category "${categoryName}".`);
    } else {
      console.log('No valid documents to insert.');
    }

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedData();
