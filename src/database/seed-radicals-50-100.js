const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const userId = "698774fd2b91e18abd156b3f";
const categoryName = "bộ thủ 50-100";

const rawData = `己	jǐ	Bộ kỷ	Bản thân, riêng mình
巾	jīn	Bộ cân	Khăn mặt, vải vóc
干	gān	Bộ can	Can thiệp, phạm đến
幺	yāo	Bộ yêu	Nhỏ nhắn, mảnh mai
广	guǎng	Bộ mịch	Mái nhà tầng, hiên che
廴	yǐn	Bộ dẫn	Đi xa
廾	gǒng	Bộ xích	Chắp tay
弓	gōng	Bộ cung	Cái cung (vũ khí)
彐	jì	Bộ dặc	Đầu con nhím
彡	shān	Bộ xích	Lông dài, tóc
彳	chì	Bộ xích	Bước chân trái
心	xīn	Bộ tâm	Quả tim, tâm trí
忄	xīn	Bộ tâm đứng	Tâm (dạng đứng)
戈	gē	Bộ qua	Cây qua (vũ khí cổ)
戶	hù	Bộ hộ	Cửa một cánh
手	shǒu	Bộ thủ	Bàn tay
扌	shǒu	Bộ thủ đứng	Tay (dạng đứng)
支	zhī	Bộ chi	Cành cây
攴	pū	Bộ phộc	Đánh khẽ
文	wén	Bộ văn	Văn chương, chữ nghĩa
斗	dǒu	Bộ đấu	Cái đấu (đo lường)
斤	jīn	Bộ cân	Cái rìu
方	fāng	Bộ phương	Phương hướng, hình vuông
无	wú	Bộ vô	Không có
日	rì	Bộ nhật	Mặt trời, ngày
月	yuè	Bộ nguyệt	Mặt trăng, tháng
木	mù	Bộ mộc	Cây cối, gỗ
欠	qiàn	Bộ khiếm	Khiếm khuyết, thiếu thốn
止	zhǐ	Bộ chỉ	Dừng lại
歹	dǎi	Bộ đãi	Xấu xa, cái chết
殳	shū	Bộ điện	Binh khí dài
母	mǔ	Bộ mẫu	Mẹ
比	bǐ	Bộ tỷ	So sánh
毛	máo	Bộ mao	Lông (động vật, người)
氏	shì	Bộ thị	Họ, thị tộc
气	qì	Bộ khí	Khí quyen, hơi nước
水	shuǐ	Bộ thủy	Nước
氵	shuǐ	Bộ thủy đứng	Nước (dạng đứng)
火	huǒ	Bộ hỏa	Lửa
灬	huǒ	Bộ hỏa đứng	Lửa (dạng nằm)
爪	zhǎo	Bộ trảo	Móng vuốt
父	fù	Bộ phụ	Cha
爻	yáo	Bộ hào	Đan xen
爿	qiáng	Bộ phiến	Mảnh mộc, giường
牙	yá	Bộ nha	Răng
牛	niú	Bộ ngưu	Con trâu, bò
犬	quǎn	Bộ khuyển	Con chó
玄	xuán	Bộ huyền	Huyền bí, đen tối
玉	yù	Bộ ngọc	Đá quý, ngọc
瓜	guā	Bộ qua	Quả dưa`;

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
      description: '50 bộ thủ cơ bản cho người mới bắt đầu (50-100)',
      isPrivate: true,
      difficulty: 'beginner',
      order: 2,
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
