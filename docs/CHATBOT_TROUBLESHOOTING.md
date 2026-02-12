# 🤖 Hướng dẫn khắc phục Chatbot AI - Gemini API

## ⚠️ Vấn đề: API Key hết quota miễn phí

Gemini API miễn phí có giới hạn:
- **60 requests/phút**
- **1,500 requests/ngày**

Khi vượt quota, API sẽ trả về lỗi **429 (Too Many Requests)**.

---

## ✅ Giải pháp ngay lập tức (3 cách)

### **Cách 1: Sử dụng Fallback Mode (Đã tích hợp sẵn) ✨**

**Chatbot giờ sẽ tự động chuyển sang chế độ Fallback** khi gặp lỗi API:

**Tính năng có sẵn khi Fallback:**
- ✅ Trả lời câu hỏi thường gặp
- ✅ Cung cấp từ vựng theo chủ đề (Gia đình, Đồ ăn, Số đếm, Giao thông, Màu sắc)
- ✅ Tips học tiếng Trung
- ✅ Hướng dẫn sử dụng app
- ❌ Không thể chat tự do hoặc tạo nội dung tùy chỉnh

**Người dùng vẫn có thể:**
```
- Hỏi: "Từ vựng về gia đình"
- Hỏi: "Cách học tiếng Trung nhanh?"
- Hỏi: "Tips học tập"
- Hỏi: "Số đếm bằng tiếng Trung"
```

---

### **Cách 2: Tạo API Key mới (Miễn phí) 🆓**

#### Bước 1: Tạo API Key mới
1. Truy cập: **https://aistudio.google.com/apikey**
2. Đăng nhập tài khoản Google
3. Click **"Create API Key"**
4. Chọn project hoặc tạo project mới
5. Copy API Key (bắt đầu bằng `AIza...`)

#### Bước 2: Cập nhật API Key

**A. Development (Local):**
```bash
# Mở file .env
# Thay đổi dòng:
GEMINI_API_KEY=your-old-api-key

# Thành:
GEMINI_API_KEY=AIzaSy...your-new-key...xyz

# Khởi động lại server
npm start
# hoặc
node server.js
```

**B. Production (Vercel):**
```bash
# Cách 1: Qua terminal
vercel env rm GEMINI_API_KEY production
vercel env add GEMINI_API_KEY production
# Paste API key mới
vercel --prod

# Cách 2: Qua Dashboard
# 1. Vào https://vercel.com/dashboard
# 2. Chọn project → Settings → Environment Variables
# 3. Tìm GEMINI_API_KEY → Edit
# 4. Paste API key mới → Save
# 5. Redeploy: Deployments → Latest → Redeploy
```

#### Bước 3: Kiểm tra
```bash
# Test API endpoint
curl https://your-app.vercel.app/api/chatbot/health

# Kết quả mong đợi:
{
  "success": true,
  "data": {
    "status": "ready",
    "message": "Chatbot is ready to use"
  }
}
```

---

### **Cách 3: Sử dụng nhiều API Keys (Rotation) 🔄**

Nếu bạn có traffic cao, tạo **3-5 API keys** và rotate:

#### Setup Multiple Keys:

**File: `.env`**
```env
GEMINI_API_KEY=AIzaSy...key1...
GEMINI_API_KEY_2=AIzaSy...key2...
GEMINI_API_KEY_3=AIzaSy...key3...
```

**File: `src/config/gemini.js`** (Cập nhật)
```javascript
module.exports = {
    apiKeys: [
        process.env.GEMINI_API_KEY || '',
        process.env.GEMINI_API_KEY_2 || '',
        process.env.GEMINI_API_KEY_3 || ''
    ].filter(key => key), // Lọc keys trống
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
    model: 'gemini-2.0-flash-lite',
    maxTokens: 1000,
    temperature: 0.7,
    topP: 0.9,
    topK: 40
};
```

**File: `src/services/geminiService.js`** (Thêm rotation logic)
```javascript
constructor() {
    this.apiKeys = geminiConfig.apiKeys || [];
    this.currentKeyIndex = 0;
    this.apiUrl = geminiConfig.apiUrl;
    // ...
}

getNextApiKey() {
    if (this.apiKeys.length === 0) return null;
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
}

async generateResponse(userMessage, conversationHistory = []) {
    const apiKey = this.getNextApiKey();
    if (!apiKey) {
        return chatbotFallback.getFallbackResponse(userMessage);
    }
    // Use apiKey instead of this.apiKey
    // ...
}
```

---

## 📊 Monitoring & Quota Management

### Kiểm tra usage hiện tại:
```bash
# Xem logs để track số lượng requests
vercel logs --follow

# Hoặc local:
# Check terminal logs khi chatbot được sử dụng
```

### Quota Limits theo tier:

| Tier | Requests/min | Requests/day | Cost |
|------|--------------|--------------|------|
| Free | 60 | 1,500 | $0 |
| Pay-as-you-go | 1,000+ | Unlimited | ~$0.001/request |

### Tips giảm API calls:
1. ✅ **Cache responses** cho câu hỏi phổ biến
2. ✅ **Rate limiting** trên frontend (1 request/3s)
3. ✅ **Debounce** user input
4. ✅ **Fallback mode** cho non-critical features

---

## 🔧 Troubleshooting

### Lỗi: "API key not valid"
```bash
✅ Kiểm tra API key không có khoảng trắng
✅ API key bắt đầu bằng "AIza"
✅ Đã enable Gemini API tại Google Cloud Console
```

### Lỗi: "429 Too Many Requests"
```bash
✅ Đợi 1 phút để quota reset
✅ Hoặc tạo API key mới
✅ Hoặc dùng fallback mode (tự động)
```

### Lỗi: "Model not found"
```bash
✅ Kiểm tra model name: "gemini-2.0-flash-lite"
✅ Thử model khác: "gemini-1.5-flash"
```

### Chatbot không phản hồi
```bash
# Check API health
curl https://your-app/api/chatbot/health

# Check logs
vercel logs

# Test local
node -e "require('./src/services/geminiService').getLearningTips().then(console.log)"
```

---

## 💡 Best Practices

### 1. **Environment Variables**
```bash
# .env (NEVER commit to Git!)
GEMINI_API_KEY=your-secret-key

# .env.example (Safe to commit)
GEMINI_API_KEY=your-api-key-here
```

### 2. **Error Handling**
```javascript
try {
    const response = await geminiService.generateResponse(message);
} catch (error) {
    // Fallback automatically triggered
    console.log('Using fallback mode');
}
```

### 3. **User Experience**
- ✅ Show loading indicator
- ✅ Graceful error messages
- ✅ Offer alternative features when AI unavailable
- ✅ Auto-retry after delay

---

## 🎯 Quick Reference

| Tình huống | Giải pháp | Thời gian |
|------------|-----------|-----------|
| API quota exceeded | Đợi 1 phút | 1 min ⏱️ |
| API key invalid | Tạo key mới | 2 min 🔑 |
| Muốn chat ngay | Dùng fallback | 0 min ✅ |
| Production down | Rotate key trên Vercel | 5 min 🚀 |

---

## 📞 Support

- **Gemini API Docs**: https://ai.google.dev/docs
- **Create API Key**: https://aistudio.google.com/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Status**: https://status.cloud.google.com

---

## ✨ Tóm tắt

**Chatbot giờ đã có 3 chế độ hoạt động:**

1. **🟢 Normal Mode** - API hoạt động bình thường
2. **🟡 Degraded Mode** - API bị rate limit (fallback responses)
3. **🔴 Offline Mode** - API key không hợp lệ (fallback only)

**Người dùng luôn có trải nghiệm tốt** bất kể API có vấn đề hay không! 🎉
