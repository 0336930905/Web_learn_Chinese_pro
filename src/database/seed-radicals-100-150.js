const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const userId = "698774fd2b91e18abd156b3f";
const categoryName = "bộ thủ 100-150";

const rawData = `甘	gān	Bộ cam	Ngọt
生	shēng	Bộ sinh	Sinh đẻ, nảy nở
用	yòng	Bộ dụng	Dùng, sử dụng
田	tián	Bộ điền	Ruộng vườn
疋	shū	Bộ sơ	Đơn vị đo, chân
疒	nè	Bộ nạch	Bệnh tật
白	bái	Bộ bạch	Màu trắng
皮	pí	Bộ bì	Da (động vật, người)
皿	mǐn	Bộ mãnh	Bát đĩa, đồ đựng
目	mù	Bộ mục	Con mắt
矛	máo	Bộ mâu	Cái mâu (vũ khí)
石	shí	Bộ thạch	Đá, sỏi
示	shì	Bộ kỳ	Chỉ dẫn, thần linh
禾	hé	Bộ hòa	Lúa mạ
穴	xué	Bộ huyệt	Hang ổ, lỗ hổng
立	lì	Bộ lập	Đứng thẳng, thiết lập
竹	zhú	Bộ trúc	Cây tre, trúc
米	mǐ	Bộ mễ	Gạo, ngũ cốc
糸	sī	Bộ ty	Sợi tơ nhỏ
缶	fǒu	Bộ phữu	Đồ sành sứ (vò, hũ)
网	wǎng	Bộ võng	Cái lưới
羊	yáng	Bộ dương	Con dê
羽	yǔ	Bộ vũ	Lông vũ, cánh chim
老	lǎo	Bộ lão	Già cả, người già
而	ér	Bộ nhi	Mà, lại còn
耳	ěr	Bộ nhĩ	Cái tai
耒	lěi	Bộ canh	Cái cày
肉	ròu	Bộ nhục	Thịt
臣	chén	Bộ thần	Quan lại, bề tôi
自	zì	Bộ tự	Tự bản thân, từ đâu
至	zhì	Bộ chí	Đến, đi đến
臼	jiù	Bộ cữu	Cái cối giã
舌	shé	Bộ thiệt	Cái lưỡi
舛	chuǎn	Bộ 舛	Sai lầm, trái ngược
舟	zhōu	Bộ chu	Cái thuyền
艮	gèn	Bộ cấn	Quẻ Cấn (dừng lại)
色	sè	Bộ sắc	Màu sắc, dáng vẻ
艸	cǎo	Bộ thảo	Cỏ cây
虍	hū	Bộ hổ	Vằn hổ, con hổ
虫	chóng	Bộ trùng	Sâu bọ, côn trùng
血	xuè	Bộ huyết	Máu
行	xíng	Bộ hành	Đi lại, thi hành
衣	yī	Bộ y	Áo mặc
西	xī	Bộ tây	Phương Tây
見	jiàn	Bộ kiến	Nhìn thấy, trông thấy
角	jiǎo	Bộ giác	Cái sừng
言	yán	Bộ ngôn	Lời nói, ngôn ngữ
谷	gǔ	Bộ cốc	Khe suối, thung lũng
豆	dòu	Bộ đậu	Hạt đậu, đồ tế lễ
豕	shǐ	Bộ trĩ	Con lợn (heo)`;

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
      description: '50 bộ thủ cơ bản cho người mới bắt đầu (100-150)',
      isPrivate: true,
      difficulty: 'beginner',
      order: 3,
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
