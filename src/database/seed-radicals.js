const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const rawData = `yī	一	Bộ nhất	Số một
gǔn	丨	Bộ cổn	Nét sổ dọc
zhǔ	丶	Bộ chủ	Điểm, dấu chấm
piě	丿	Bộ phiệt	Nét phẩy, xiên trái
yǐ	乙	Bộ ất	Vị trí thứ 2 (thiên can)
jué	亅	Bộ quyết	Nét sổ có móc
èr	二	Bộ nhị	Số hai
tóu	亠	Bộ đầu	Phần trên cùng
rén	人	Bộ nhân	Người
rén	亻	Bộ nhân đứng	Người (nhân đứng)
ér	儿	Bộ nhi	Trẻ con
rù	入	Bộ nhập	Vào, đi vào
bā	八	Bộ bát	Số tám
jiōng	冂	Bộ quynh	Vùng biên giới
mì	冖	Bộ mịch	Cái khăn trùm, che đậy
bīng	冫	Bộ băng	Nước đá, lạnh giá
jǐ	几	Bộ kỷ	Cái ghế nhỏ
kǎn	凵	Bộ khảm	Há miệng, hố thẳm
dāo	刀	Bộ đao	Con dao
dāo	刂	Bộ đao đứng	Con dao (đao đứng)
lì	力	Bộ lực	Sức mạnh
bāo	勹	Bộ bao	Bao bọc, gói lại
bǐ	匕	Bộ tỷ	Cái thìa
fāng	匚	Bộ phương	Đồ đựng hình vuông
xǐ	匸	Bộ hạp	Che đậy, giấu giếm
shí	十	Bộ thập	Số mười
bǔ	卜	Bộ bốc	Xem bói
jié	卩	Bộ tiết	Đốt tre, ấn tín
chǎng	厂	Bộ hán	Sườn núi, vách đá
sī	厶	Bộ tư	Riêng tư
kǒu	口	Bộ khẩu	Cái miệng
wéi	囗	Bộ vi	Vây quanh, bao quanh
tǔ	土	Bộ thổ	Đất đai
shì	士	Bộ sĩ	Kẻ sĩ, người có học
zhǐ	夂	Bộ tuy	Đi chậm
suī	夊	Bộ trì	Đi chậm chạp, kéo lê
xī	夕	Bộ tịch	Đêm tối, chiều tà
dà	大	Bộ đại	To lớn
nǚ	女	Bộ nữ	Phụ nữ, con gái
zǐ	子	Bộ tử	Con cái, đứa trẻ
mián	宀	Bộ miên	Mái nhà, mái che
cùn	寸	Bộ thốn	Đơn vị đo chiều dài (tấc)
xiǎo	小	Bộ tiểu	Nhỏ bé
yóu	尢	Bộ doãn	Yếu đuối
shī	尸	Bộ thi	Xác chết, thây ma
chè	屮	Bộ triệt	Mầm non, cỏ mới mọc
shān	山	Bộ sơn	Núi non
chuān	川	Bộ xuyên	Sông ngòi
gōng	工	Bộ công	Công việc, thợ thuyền
jǐ	己	Bộ kỷ	Bản thân, riêng mình
jīn	巾	Bộ cân	Khăn mặt, vải vóc
gān	干	Bộ can	Can thiệp, phạm đến
yāo	幺	Bộ yêu	Nhỏ nhắn, mảnh mai
guǎng	广	Bộ mịch	Mái nhà tầng, hiên che
yǐn	廴	Bộ dẫn	Đi xa
gǒng	廾	Bộ xích	Chắp tay
gōng	弓	Bộ cung	Cái cung (vũ khí)
jì	彐	Bộ dặc	Đầu con nhím
shān	彡	Bộ xích	Lông dài, tóc
chì	彳	Bộ xích	Bước chân trái
xīn	心	Bộ tâm	Quả tim, tâm trí
xīn	忄	Bộ tâm đứng	Tâm (dạng đứng)
gē	戈	Bộ qua	Cây qua (vũ khí cổ)
hù	戶	Bộ hộ	Cửa một cánh
shǒu	手	Bộ thủ	Bàn tay
shǒu	扌	Bộ thủ đứng	Tay (dạng đứng)
zhī	支	Bộ chi	Cành cây
pū	攴	Bộ phộc	Đánh khẽ
wén	文	Bộ văn	Văn chương, chữ nghĩa
dǒu	斗	Bộ đấu	Cái đấu (đo lường)
jīn	斤	Bộ cân	Cái rìu
fāng	方	Bộ phương	Phương hướng, hình vuông
wú	无	Bộ vô	Không có
rì	日	Bộ nhật	Mặt trời, ngày
yuè	月	Bộ nguyệt	Mặt trăng, tháng
mù	木	Bộ mộc	Cây cối, gỗ
qiàn	欠	Bộ khiếm	Khiếm khuyết, thiếu thốn
zhǐ	止	Bộ chỉ	Dừng lại
dǎi	歹	Bộ đãi	Xấu xa, cái chết
shū	殳	Bộ điện	Binh khí dài
mǔ	母	Bộ mẫu	Mẹ
bǐ	比	Bộ tỷ	So sánh
máo	毛	Bộ mao	Lông (động vật, người)
shì	氏	Bộ thị	Họ, thị tộc
qì	气	Bộ khí	Khí quyen, hơi nước
shuǐ	水	Bộ thủy	Nước
shuǐ	氵	Bộ thủy đứng	Nước (dạng đứng)
huǒ	火	Bộ hỏa	Lửa
huǒ	灬	Bộ hỏa đứng	Lửa (dạng nằm)
zhǎo	爪	Bộ trảo	Móng vuốt
fù	父	Bộ phụ	Cha
yáo	爻	Bộ hào	Đan xen
qiáng	爿	Bộ phiến	Mảnh mộc, giường
yá	牙	Bộ nha	Răng
niú	牛	Bộ ngưu	Con trâu, bò
quǎn	犬	Bộ khuyển	Con chó
xuán	玄	Bộ huyền	Huyền bí, đen tối
yù	玉	Bộ ngọc	Đá quý, ngọc
guā	瓜	Bộ qua	Quả dưa
gān	甘	Bộ cam	Ngọt
shēng	生	Bộ sinh	Sinh đẻ, nảy nở
yòng	用	Bộ dụng	Dùng, sử dụng
tián	田	Bộ điền	Ruộng vườn
shū	疋	Bộ sơ	Đơn vị đo, chân
nè	疒	Bộ nạch	Bệnh tật
bái	白	Bộ bạch	Màu trắng
pí	皮	Bộ bì	Da (động vật, người)
mǐn	皿	Bộ mãnh	Bát đĩa, đồ đựng
mù	目	Bộ mục	Con mắt
máo	矛	Bộ mâu	Cái mâu (vũ khí)
shí	石	Bộ thạch	Đá, sỏi
shì	示	Bộ kỳ	Chỉ dẫn, thần linh
hé	禾	Bộ hòa	Lúa mạ
xué	穴	Bộ huyệt	Hang ổ, lỗ hổng
lì	立	Bộ lập	Đứng thẳng, thiết lập
zhú	竹	Bộ trúc	Cây tre, trúc
mǐ	米	Bộ mễ	Gạo, ngũ cốc
sī	糸	Bộ ty	Sợi tơ nhỏ
fǒu	缶	Bộ phữu	Đồ sành sứ (vò, hũ)
wǎng	网	Bộ võng	Cái lưới
yáng	羊	Bộ dương	Con dê
yǔ	羽	Bộ vũ	Lông vũ, cánh chim
lǎo	老	Bộ lão	Già cả, người già
ér	而	Bộ nhi	Mà, lại còn
ěr	耳	Bộ nhĩ	Cái tai
lěi	耒	Bộ canh	Cái cày
ròu	肉	Bộ nhục	Thịt
chén	臣	Bộ thần	Quan lại, bề tôi
zì	自	Bộ tự	Tự bản thân, từ đâu
zhì	至	Bộ chí	Đến, đi đến
jiù	臼	Bộ cữu	Cái cối giã
shé	舌	Bộ thiệt	Cái lưỡi
chuǎn	舛	Bộ 舛	Sai lầm, trái ngược
zhōu	舟	Bộ chu	Cái thuyền
gèn	艮	Bộ cấn	Quẻ Cấn (dừng lại)
sè	色	Bộ sắc	Màu sắc, dáng vẻ
cǎo	艸	Bộ thảo	Cỏ cây
hū	虍	Bộ hổ	Vằn hổ, con hổ
chóng	虫	Bộ trùng	Sâu bọ, côn trùng
xuè	血	Bộ huyết	Máu
xíng	行	Bộ hành	Đi lại, thi hành
yī	衣	Bộ y	Áo mặc
xī	西	Bộ tây	Phương Tây
jiàn	見	Bộ kiến	Nhìn thấy, trông thấy
jiǎo	角	Bộ giác	Cái sừng
yán	言	Bộ ngôn	Lời nói, ngôn ngữ
gǔ	谷	Bộ cốc	Khe suối, thung lũng
dòu	豆	Bộ đậu	Hạt đậu, đồ tế lễ
shǐ	豕	Bộ trĩ	Con lợn (heo)
bèi	貝	Bộ bối	Tiền bạc, vỏ sò
chì	赤	Bộ xích	Màu đỏ
zǒu	走	Bộ tẩu	Đi bộ, chạy
zú	足	Bộ túc	Chân, bước chân
shēn	身	Bộ thân	Thân thể, thân mình
chē	車	Bộ xa	Xe cộ
xīn	辛	Bộ tân	Cay, vất vả
chén	辰	Bộ thần	Nhật nguyệt, thời gian (can chi)
chuò	辵	Bộ sước	Chợt đi chợt dừng (bộ quai sước)
yì	邑	Bộ dậu	Vùng đất, kinh đô
yì	阝	Bộ dậu phải	Vùng đất (dạng bên phải chữ)
yǒu	酉	Bộ phu	Rượu, chi Dậu
biàn	釆	Bộ thích	Phân biệt, làm rõ
lǐ	里	Bộ lý	Làng xóm, dặm (đo lường)
jīn	金	Bộ kim	Kim loại, vàng
cháng	長	Bộ trường	Dài, đứng đầu
mén	門	Bộ môn	Cửa hai cánh
fù	阜	Bộ phụ	Gò đất, đống đất
lì	隶	Bộ lệ	Kịp, bắt kịp
zhuī	隹	Bộ chuy	Chim đuôi ngắn
yǔ	雨	Bộ vũ	Mưa
qīng	青	Bộ thanh	Màu xanh
fēi	非	Bộ phi	Sai lầm, không phải
miàn	面	Bộ diện	Mặt, bề mặt
gé	革	Bộ cách	Da thú đã thuộc
wéi	韋	Bộ vi	Da thú, vây quanh
yīn	音	Bộ âm	Âm thanh
yè	頁	Bộ hiệt	Trang giấy, đầu
fēng	風	Bộ phong	Gió
fēi	飞	Bộ phi	Bay
shí	食	Bộ thực	Ăn, thực phẩm
shǒu	首	Bộ thủ	Đầu, bắt đầu
xiāng	香	Bộ hương	Mùi thơm
mǎ	馬	Bộ mã	Con ngựa
gǔ	骨	Bộ cốt	Xương
gāo	高	Bộ cao	Cao ráo
biāo	髟	Bộ phát	Tóc dài, bờm
dòu	鬥	Bộ đấu	Đánh nhau, chiến đấu
chàng	鬯	Bộ tấn	Rượu nghệ, lễ tế
guǐ	鬼	Bộ quỷ	Con quỷ, ma quỷ
yú	魚	Bộ ngư	Con cá
niǎo	鳥	Bộ điểu	Con chim
lù	鹿	Bộ lộc	Con hươu
mài	麥	Bộ mạch	Lúa mạch
má	麻	Bộ ma	Cây gai, cây ma
huáng	黃	Bộ hoàng	Màu vàng
shǔ	黍	Bộ thử	Lúa nếp
hēi	黑	Bộ hắc	Màu đen
zhǐ	黹	Bộ chỉ	Thêu thùa, may vá
mǐn	黽	Bộ mặc	Con ếch, động vật lưỡng cư
dǐng	鼎	Bộ đỉnh	Cái đỉnh (đồ tế lễ)
gǔ	鼓	Bộ cổ	Cái trống
shǔ	鼠	Bộ thử	Con chuột
bí	鼻	Bộ tị	Cái mũi
qí	齊	Bộ tề	Ngang bằng, chỉnh tề
chǐ	齒	Bộ xỉ	Răng
lóng	龍	Bộ long	Con rồng
guī	龜	Bộ quy	Con rùa
yuè	龠	Bộ quy	Nhạc khí, ống sáo`;

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
    const vocabularyCollection = db.collection('vocabulary');

    const userId = new ObjectId("699478895d5de866a72fd412");
    const categoryId = new ObjectId("69bb28deebf1146394fbaa81");

    const documentsToInsert = rawData.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split('\t');
      if (parts.length >= 4) {
        const pinyin = parts[0].trim();
        const character = parts[1].trim();
        const radicalName = parts[2].trim();
        const meaningText = parts[3].trim();
        
        return {
          categoryId: categoryId,
          traditional: character,
          simplified: character, // radicals usually the same or you can map them, just save the character supplied
          pinyin: pinyin,
          meaning: `${radicalName} - ${meaningText}`,
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      return null;
    }).filter(doc => doc !== null);

    if (documentsToInsert.length > 0) {
      const result = await vocabularyCollection.insertMany(documentsToInsert);
      console.log(`Successfully inserted ${result.insertedCount} vocabulary documents.`);
    } else {
      console.log('No documents valid to insert.');
    }
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedData();
