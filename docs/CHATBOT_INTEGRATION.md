# Chatbot Integration Guide

## ✅ Đã hoàn thành

Chatbot đã được tích hợp hoàn toàn vào **sidebar.js** và sẵn sàng sử dụng trên mọi trang có sidebar!

## 🎯 Tính năng

### **1. AI Conversation**
- 🤖 Chat với **Gemini 2.5 Flash** (model mới nhất)
- 💬 Lưu lịch sử 10 tin nhắn gần nhất
- 🧠 Context-aware: AI nhớ cuộc hội thoại trước đó

### **2. Quick Actions**
4 nút quick action được tối ưu cho học tiếng Trung:
- 👨‍👩‍👧‍👦 **Từ vựng gia đình** - Học 10 từ về gia đình
- 🍜 **Từ vựng đồ ăn** - Học 10 từ về đồ ăn
- 💡 **Tips học tập** - 5 tips học tiếng Trung hiệu quả
- 🔤 **Giải thích từ** - Giải thích chi tiết từ 你好

### **3. Smart Formatting**
- **Bold text**: `**text**` → **text**
- *Italic text*: `*text*` → *text*
- `Inline code`: \`code\` → `code`
- Line breaks: `\n` → automatic line breaks
- Emoji: `:)` → 😊

### **4. Error Handling**
- 🌐 Network error detection
- ⏱️ Timeout handling
- 🔄 Auto-retry với fallback
- 📊 Detailed console logging

### **5. User Experience**
- ⚡ Typing indicator khi AI đang suy nghĩ
- 🎨 Smooth animations (fadeIn)
- 📱 Responsive mobile-friendly
- 🌙 Dark mode support
- 🔒 XSS protection (HTML escaping)

## 🚀 Cách sử dụng

### **Bước 1: Truy cập trang có sidebar**

Chatbot hoạt động trên các trang:
- `/user/home.html`
- `/user/games_home.html`
- `/user/personal_vocabulary_categories_screen.html`
- `/user/achievements.html`
- Bất kỳ trang nào có `<div id="sidebar-container">`

### **Bước 2: Mở chatbot**

1. Tìm nút chat ở góc dưới bên phải màn hình (icon 💬)
2. Click vào nút để mở cửa sổ chatbot
3. Chatbot sẽ chào mừng bạn!

### **Bước 3: Chat với AI**

**Cách 1: Gõ trực tiếp**
```
1. Nhập tin nhắn vào ô input
2. Nhấn Enter hoặc click nút Send
3. Đợi 2-5 giây để AI trả lời
```

**Cách 2: Dùng Quick Actions**
```
1. Click vào một trong 4 nút quick action
2. Tin nhắn tự động gửi đi
3. AI trả lời ngay lập tức
```

## 💡 Ví dụ câu hỏi

### **Học từ vựng**
```
- "Từ vựng gia đình"
- "Từ vựng đồ ăn"
- "Số đếm tiếng Trung"
- "Màu sắc tiếng Trung"
- "Giao thông tiếng Trung"
```

### **Giải thích từ**
```
- "Giải thích từ 你好"
- "Từ 谢谢 nghĩa là gì?"
- "你好 đọc như thế nào?"
- "Phân tích chữ Hán 爱"
```

### **Tips học tập**
```
- "Tips học tiếng Trung"
- "Cách học tiếng Trung hiệu quả"
- "Làm sao để nhớ từ vựng?"
- "Hướng dẫn học chữ Hán"
```

### **Câu hỏi tự do**
```
- "Dạy tôi câu 'Xin chào' bằng tiếng Trung"
- "Cách đọc pinyin"
- "Gợi ý 5 từ vựng cơ bản"
- "Giải thích dấu thanh trong tiếng Trung"
```

## 🔧 Technical Details

### **API Endpoint**
```javascript
POST /api/chatbot/message
Content-Type: application/json

{
  "message": "Từ vựng gia đình",
  "conversationHistory": [
    { "content": "previous message", "isUser": true },
    { "content": "bot response", "isUser": false }
  ]
}
```

### **Response Format**
```javascript
{
  "success": true,
  "data": {
    "response": "AI response with markdown formatting",
    "timestamp": "2026-02-13T10:30:00.000Z"
  }
}
```

### **Gemini Config**
```javascript
Model: gemini-2.5-flash
Max Tokens: 2048
Temperature: 0.7
Free Tier: 15 RPM, 1M TPM, 1500 RPD
```

## 📁 Files Modified

### **1. public/js/sidebar.js**
```javascript
// Updated functions:
- getBotResponse()         // Call /api/chatbot/message
- formatChatbotResponse()  // Format markdown
- addMessage()             // Add XSS protection
- escapeHtml()             // NEW: Prevent XSS

// Updated Quick Actions:
- Từ vựng gia đình
- Từ vựng đồ ăn
- Tips học tiếng Trung
- Giải thích từ 你好
```

### **2. src/routes/chatbot.routes.js**
```javascript
// No authentication required for testing
router.post('/message', chatbotController.sendMessage);
```

### **3. src/config/gemini.js**
```javascript
model: 'gemini-2.5-flash'  // Latest model (June 2025)
apiUrl: '...gemini-2.5-flash:generateContent'
```

## 🧪 Testing

### **Test Page 1: Chatbot Integration**
```
http://localhost:3000/test-chatbot-integration.html
```
- ✅ Quick test buttons
- ✅ Real-time test results
- ✅ API call examples
- ✅ Feature checklist

### **Test Page 2: Chatbot UI**
```
http://localhost:3000/test-chatbot.html
```
- ✅ Full chatbot interface
- ✅ Health check
- ✅ Vocabulary suggestions
- ✅ Word explanation
- ✅ Learning tips

### **Test in Real Pages**
```bash
# Test trên trang thật
http://localhost:3000/user/home.html
http://localhost:3000/user/games_home.html
```

1. Login với tài khoản test
2. Click nút chatbot ở góc dưới phải
3. Thử các quick actions
4. Gõ tin nhắn tự do

## 📊 Console Logging

Khi mở DevTools Console, bạn sẽ thấy:

```javascript
🤖 Chatbot: Sending message... từ vựng gia đình
📝 Conversation history: 2 messages
ℹ️ No token - using public API
📞 Calling API: /api/chatbot/message
📥 Response status: 200
✅ API Response: {success: true, data: {...}}
✅ AI response length: 523 chars
```

## ⚠️ Known Limitations

### **1. Authentication Optional**
- Token không bắt buộc (public API)
- Có thể thêm auth sau nếu cần

### **2. Rate Limits**
- Free tier: 15 requests/minute
- 1,500 requests/day
- Nếu vượt quota → fallback mode

### **3. Response Time**
- Typical: 2-5 giây
- Có thể lâu hơn với câu phức tạp

### **4. Context Window**
- Chỉ lưu 10 tin nhắn gần nhất
- Context reset khi refresh trang

## 🔄 Fallback Mode

Khi API gặp lỗi, chatbot tự động chuyển sang fallback:

```javascript
// Fallback responses
- Từ vựng gia đình → 10 từ pre-generated
- Từ vựng đồ ăn → 10 từ pre-generated
- Tips học tập → 5 tips pre-generated
- FAQ → Pinyin, Chữ Hán, HSK...
```

## 🎨 Customization

### **Thay đổi Quick Actions**
```javascript
// In sidebar.js, line ~160
<button class="chatbot-quick-btn" 
    data-message="Tin nhắn mới của bạn">
    <span class="material-symbols-outlined">icon</span>
    Tên nút
</button>
```

### **Thay đổi màu sắc**
```javascript
// Primary color: .bg-primary
// Default: green (#4ce64c)
// Change in Tailwind config
```

### **Thay đổi welcome message**
```javascript
// In sidebar.js, line ~150
<p class="text-sm text-slate-700 dark:text-slate-300">
    ${t('chatbot.welcome', 'Tin nhắn chào mừng của bạn!')}
</p>
```

## 📝 Next Steps

### **Enhancements (Optional)**

1. **Add Authentication**
```javascript
// In chatbot.routes.js
router.post('/message', verifyToken, chatbotController.sendMessage);
```

2. **Add Voice Input**
```javascript
// Web Speech API
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => { ... };
```

3. **Add Message History Persistence**
```javascript
// Save to localStorage
localStorage.setItem('chatHistory', JSON.stringify(messages));
```

4. **Add Typing Sound Effects**
```javascript
const typingSound = new Audio('/sounds/typing.mp3');
typingSound.play();
```

5. **Add Message Reactions**
```javascript
// Like/Dislike buttons
<button onclick="reactToMessage('like')">👍</button>
```

## 🐛 Troubleshooting

### **Chatbot button không hiện**
```javascript
// Check console for errors
// Verify sidebar.js loaded
// Check initializeChatbot() called
```

### **API return 404**
```javascript
// Check server running on port 3000
// Verify /api/chatbot/message route exists
// Check chatbot.routes.js registered
```

### **AI không trả lời**
```javascript
// Check Gemini API key in .env
// Verify gemini-2.5-flash model exists
// Check quota not exceeded
// Try fallback mode
```

### **Response bị lỗi format**
```javascript
// Check formatChatbotResponse() function
// Verify HTML escaping working
// Check markdown syntax
```

## 📞 Support

- **API Docs**: [docs/API.md](./API.md)
- **Gemini Docs**: https://ai.google.dev/gemini-api/docs
- **Test Pages**: /test-chatbot.html, /test-chatbot-integration.html

---

**🎉 Chatbot đã sẵn sàng! Truy cập http://localhost:3000/user/home.html để trải nghiệm!**
