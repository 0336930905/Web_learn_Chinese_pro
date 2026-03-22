const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const userId = "698774fd2b91e18abd156b3f";
const categoryName = "bộ thủ 0-50";

const rawData = `一	yī	Bộ nhất	Số một
丨	gǔn	Bộ cổn	Nét sổ dọc
丶	zhǔ	Bộ chủ	Điểm, dấu chấm
丿	piě	Bộ phiệt	Nét phẩy, xiên trái
乙	yǐ	Bộ ất	Vị trí thứ 2 (thiên can)
亅	jué	Bộ quyết	Nét sổ có móc
二	èr	Bộ nhị	Số hai
亠	tóu	Bộ đầu	Phần trên cùng
人	rén	Bộ nhân	Người
亻	rén	Bộ nhân đứng	Người (nhân đứng)
儿	ér	Bộ nhi	Trẻ con
入	rù	Bộ nhập	Vào, đi vào
八	bā	Bộ bát	Số tám
冂	jiōng	Bộ quynh	Vùng biên giới
冖	mì	Bộ mịch	Cái khăn trùm, che đậy
冫	bīng	Bộ băng	Nước đá, lạnh giá
几	jǐ	Bộ kỷ	Cái ghế nhỏ
凵	kǎn	Bộ khảm	Há miệng, hố thẳm
刀	dāo	Bộ đao	Con dao
刂	dāo	Bộ đao đứng	Con dao (đao đứng)
力	lì	Bộ lực	Sức mạnh
勹	bāo	Bộ bao	Bao bọc, gói lại
匕	bǐ	Bộ tỷ	Cái thìa
匚	fāng	Bộ phương	Đồ đựng hình vuông
匸	xǐ	Bộ hạp	Che đậy, giấu giếm
十	shí	Bộ thập	Số mười
卜	bǔ	Bộ bốc	Xem bói
卩	jié	Bộ tiết	Đốt tre, ấn tín
厂	chǎng	Bộ hán	Sườn núi, vách đá
厶	sī	Bộ tư	Riêng tư
口	kǒu	Bộ khẩu	Cái miệng
囗	wéi	Bộ vi	Vây quanh, bao quanh
土	tǔ	Bộ thổ	Đất đai
士	shì	Bộ sĩ	Kẻ sĩ, người có học
夂	zhǐ	Bộ tuy	Đi chậm
夊	suī	Bộ trì	Đi chậm chạp, kéo lê
夕	xī	Bộ tịch	Đêm tối, chiều tà
大	dà	Bộ đại	To lớn
女	nǚ	Bộ nữ	Phụ nữ, con gái
子	zǐ	Bộ tử	Con cái, đứa trẻ
宀	mián	Bộ miên	Mái nhà, mái che
寸	cùn	Bộ thốn	Đơn vị đo chiều dài (tấc)
小	xiǎo	Bộ tiểu	Nhỏ bé
尢	yóu	Bộ doãn	Yếu đuối
尸	shī	Bộ thi	Xác chết, thây ma
屮	chè	Bộ triệt	Mầm non, cỏ mới mọc
山	shān	Bộ sơn	Núi non
川	chuān	Bộ xuyên	Sông ngòi
工	gōng	Bộ công	Công việc, thợ thuyền
己	jǐ	Bộ kỷ	Bản thân, riêng mình`;

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
      description: '50 bộ thủ cơ bản cho người mới bắt đầu',
      isPrivate: true,
      difficulty: 'beginner',
      order: 1,
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
