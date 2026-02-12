/**
 * Chatbot Fallback Responses
 * Pre-generated responses when Gemini API is unavailable
 */

class ChatbotFallback {
    constructor() {
        // Greeting responses
        this.greetings = [
            '👋 Xin chào! Tôi là trợ lý VocabHero. Hãy hỏi tôi về từ vựng tiếng Trung nhé! 🎓',
            '😊 Chào bạn! Tôi có thể giúp bạn học từ vựng tiếng Trung. Bạn muốn học về chủ đề nào?',
            '🌟 Hello! Hãy cùng tôi khám phá tiếng Trung thú vị nhé! Bạn muốn bắt đầu từ đâu?'
        ];

        // Learning tips
        this.learningTips = `📚 **5 Tips Học Tiếng Trung Hiệu Quả:**

1. **Học từ vựng theo chủ đề** 📖
   Nhóm từ theo chủ đề (gia đình, đồ ăn...) giúp dễ nhớ hơn.

2. **Luyện viết chữ Hán mỗi ngày** ✍️
   Viết tay giúp ghi nhớ cấu trúc chữ và cách đọc.

3. **Nghe và lặp lại** 🎧
   Luyện nghe native speaker và bắt chước phát âm.

4. **Sử dụng flashcards** 🎴
   Ôn tập định kỳ với flashcard hiệu quả cao.

5. **Thực hành hàng ngày** 💪
   Chỉ 15-20 phút mỗi ngày hiệu quả hơn học dồn!`;

        // Vocabulary topics
        this.vocabularyTopics = {
            'gia đình': `👨‍👩‍👧‍👦 **Từ Vựng Gia Đình:**

1. 爸爸 (bàba) - Bố
2. 妈妈 (māma) - Mẹ
3. 哥哥 (gēge) - Anh trai
4. 姐姐 (jiějie) - Chị gái
5. 弟弟 (dìdi) - Em trai
6. 妹妹 (mèimei) - Em gái
7. 爷爷 (yéye) - Ông (nội)
8. 奶奶 (nǎinai) - Bà (nội)
9. 外公 (wàigōng) - Ông (ngoại)
10. 外婆 (wàipó) - Bà (ngoại)

💡 Ví dụ: 我爱我的家人 (Wǒ ài wǒ de jiārén) - Tôi yêu gia đình tôi`,

            'đồ ăn': `🍜 **Từ Vựng Đồ Ăn:**

1. 米饭 (mǐfàn) - Cơm
2. 面条 (miàntiáo) - Mì
3. 水果 (shuǐguǒ) - Trái cây
4. 蔬菜 (shūcài) - Rau
5. 鸡肉 (jīròu) - Thịt gà
6. 牛肉 (niúròu) - Thịt bò
7. 鱼 (yú) - Cá
8. 豆腐 (dòufu) - Đậu phụ
9. 汤 (tāng) - Súp
10. 茶 (chá) - Trà

💡 Ví dụ: 我喜欢吃中国菜 (Wǒ xǐhuan chī Zhōngguó cài) - Tôi thích ăn món Trung Quốc`,

            'số đếm': `🔢 **Từ Vựng Số Đếm:**

1. 一 (yī) - Một
2. 二 (èr) - Hai
3. 三 (sān) - Ba
4. 四 (sì) - Bốn
5. 五 (wǔ) - Năm
6. 六 (liù) - Sáu
7. 七 (qī) - Bảy
8. 八 (bā) - Tám
9. 九 (jiǔ) - Chín
10. 十 (shí) - Mười

💡 Số lớn: 百 (bǎi) - Trăm, 千 (qiān) - Nghìn, 万 (wàn) - Vạn`,

            'giao thông': `🚗 **Từ Vựng Giao Thông:**

1. 车 (chē) - Xe
2. 公共汽车 (gōnggòng qìchē) - Xe buýt
3. 地铁 (dìtiě) - Tàu điện ngầm
4. 出租车 (chūzū chē) - Taxi
5. 自行车 (zìxíngchē) - Xe đạp
6. 摩托车 (mótuō chē) - Xe máy
7. 火车 (huǒchē) - Tàu hỏa
8. 飞机 (fēijī) - Máy bay
9. 船 (chuán) - Tàu thuyền
10. 马路 (mǎlù) - Đường phố

💡 Ví dụ: 我坐地铁去上班 (Wǒ zuò dìtiě qù shàngbān) - Tôi đi tàu điện ngầm đến công ty`,

            'màu sắc': `🎨 **Từ Vựng Màu Sắc:**

1. 红色 (hóngsè) - Màu đỏ
2. 黄色 (huángsè) - Màu vàng
3. 蓝色 (lánsè) - Màu xanh dương
4. 绿色 (lǜsè) - Màu xanh lá
5. 黑色 (hēisè) - Màu đen
6. 白色 (báisè) - Màu trắng
7. 粉色 (fěnsè) - Màu hồng
8. 紫色 (zǐsè) - Màu tím
9. 橙色 (chéngsè) - Màu cam
10. 灰色 (huīsè) - Màu xám

💡 Ví dụ: 我喜欢蓝色 (Wǒ xǐhuan lánsè) - Tôi thích màu xanh dương`
        };

        // FAQ
        this.faq = {
            'app': '💡 VocabHero giúp bạn học tiếng Trung qua:\n' +
                   '✅ Từ vựng theo chủ đề\n' +
                   '✅ Trò chơi tương tác\n' +
                   '✅ Flashcards thông minh\n' +
                   '✅ Chatbot AI hỗ trợ 24/7\n' +
                   '✅ Theo dõi tiến độ học tập',
            
            'pinyin': '🔤 Pinyin là hệ thống phiên âm La-tinh cho tiếng Trung.\n' +
                      'Ví dụ: 你好 đọc là "nǐ hǎo" (xin chào)\n' +
                      '4 dấu thanh: ā á ǎ à\n' +
                      'Học pinyin giúp phát âm chính xác!',
            
            'hanzi': '📝 Chữ Hán (汉字 - Hànzì) là chữ viết tiếng Trung.\n' +
                     'Mỗi chữ là một ý nghĩa riêng.\n' +
                     'Ví dụ: 人 (rén) = người, 山 (shān) = núi\n' +
                     'Cần học cấu trúc và nét viết đúng!',
            
            'hsk': '📊 HSK (汉语水平考试) là kỳ thi năng lực tiếng Trung.\n' +
                   '6 cấp độ: HSK 1 → HSK 6\n' +
                   'HSK 1: ~150 từ (sơ cấp)\n' +
                   'HSK 6: ~5000 từ (cao cấp)\n' +
                   'VocabHero hỗ trợ luyện tập cho tất cả cấp độ!'
        };
    }

    /**
     * Get fallback response based on message
     */
    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Greetings
        if (this.isGreeting(lowerMessage)) {
            return this.getRandomGreeting();
        }

        // Learning tips
        if (lowerMessage.includes('tip') || lowerMessage.includes('cach hoc') || 
            lowerMessage.includes('huong dan') || lowerMessage.includes('bi quyet')) {
            return this.learningTips;
        }

        // Vocabulary topics
        for (const [topic, content] of Object.entries(this.vocabularyTopics)) {
            if (lowerMessage.includes(topic) || lowerMessage.includes(topic.replace(/\s/g, ''))) {
                return content;
            }
        }

        // FAQ
        if (lowerMessage.includes('app') || lowerMessage.includes('vocabhero') || lowerMessage.includes('ung dung')) {
            return this.faq.app;
        }
        if (lowerMessage.includes('pinyin') || lowerMessage.includes('phien am')) {
            return this.faq.pinyin;
        }
        if (lowerMessage.includes('hanzi') || lowerMessage.includes('chu han')) {
            return this.faq.hanzi;
        }
        if (lowerMessage.includes('hsk') || lowerMessage.includes('thi')) {
            return this.faq.hsk;
        }

        // Default response
        return `🤖 Tôi có thể giúp bạn về:

📚 **Từ vựng theo chủ đề:**
- Gia đình 👨‍👩‍👧‍👦
- Đồ ăn 🍜
- Số đếm 🔢
- Giao thông 🚗
- Màu sắc 🎨

💡 **Câu hỏi phổ biến:**
- Cách học tiếng Trung hiệu quả
- Pinyin là gì?
- Chữ Hán và HSK

Hãy hỏi tôi nhé! Ví dụ: "Từ vựng gia đình" hoặc "Tips học tiếng Trung" 😊`;
    }

    /**
     * Check if message is greeting
     */
    isGreeting(message) {
        const greetings = ['xin chao', 'chao', 'hello', 'hi', 'hey'];
        return greetings.some(g => message.includes(g));
    }

    /**
     * Get random greeting
     */
    getRandomGreeting() {
        return this.greetings[Math.floor(Math.random() * this.greetings.length)];
    }

    /**
     * Get vocabulary suggestion
     */
    getVocabularySuggestion(topic, level) {
        const normalizedTopic = topic.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        for (const [key, content] of Object.entries(this.vocabularyTopics)) {
            if (normalizedTopic.includes(key) || normalizedTopic.includes(key.replace(/\s/g, ''))) {
                return content;
            }
        }

        return `📚 Tôi có từ vựng về các chủ đề sau:
- Gia đình 👨‍👩‍👧‍👦
- Đồ ăn 🍜
- Số đếm 🔢
- Giao thông 🚗
- Màu sắc 🎨

Hãy chọn một chủ đề để bắt đầu nhé! 😊`;
    }

    /**
     * Explain a Chinese word
     */
    explainWord(word) {
        // Common words explanation
        const commonWords = {
            '你好': '你好 (nǐ hǎo)\n📖 Nghĩa: Xin chào\n💡 Sử dụng: Lời chào thông dụng nhất\n✍️ Cấu tạo: 你 (bạn) + 好 (tốt)\nVí dụ: A: 你好! B: 你好!',
            '谢谢': '谢谢 (xièxie)\n📖 Nghĩa: Cảm ơn\n💡 Sử dụng: Cám ơn ai đó\n✍️ Lặp lại để nhấn mạnh\nVí dụ: 谢谢你的帮助 (Cảm ơn sự giúp đỡ của bạn)',
            '再见': '再见 (zàijiàn)\n📖 Nghĩa: Tạm biệt\n💡 Sử dụng: Lời chào tạm biệt\n✍️ Cấu tạo: 再 (lại) + 见 (gặp)\nVí dụ: 明天见! (Hẹn gặp ngày mai!)'
        };

        if (commonWords[word]) {
            return commonWords[word];
        }

        return `📖 Để giải thích từ "${word}", tôi cần kết nối với AI.\n\n` +
               `💡 Trong thời gian chờ, bạn có thể:\n` +
               `- Tra từ tại: https://dict.youdao.com/\n` +
               `- Học các từ phổ biến: 你好, 谢谢, 再见\n` +
               `- Hỏi tôi về chủ đề từ vựng khác 😊`;
    }
}

module.exports = new ChatbotFallback();
