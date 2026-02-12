# Gemini Free Tier Issue - "limit: 0"

## 🚨 Vấn đề

Khi sử dụng Gemini API, bạn gặp lỗi:

```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, 
limit: 0, model: gemini-2.0-flash-lite
```

**"limit: 0"** có nghĩa là model này **KHÔNG CÒN miễn phí** hoặc free tier đã bị vô hiệu hóa.

## 🔍 Nguyên nhân

### 1. **gemini-2.0-flash-lite** không còn free tier (Feb 2026)

Google đã thay đổi chính sách:
- ❌ `gemini-2.0-flash-lite`: **limit: 0** (không còn free)
- ❌ `gemini-2.0-flash`: **limit: 0** (không còn free)
- ✅ `gemini-1.5-flash`: **15 RPM, 1M TPM, 1500 RPD** (vẫn free)
- ✅ `gemini-1.5-pro`: **2 RPM** (free nhưng giới hạn thấp)

### 2. Cần kích hoạt Billing

Một số model yêu cầu **Google Cloud Billing** được enable, ngay cả khi dùng free quota:
- Phải link credit card (không bị charge nếu dưới limit)
- Enable tại: https://console.cloud.google.com/billing

### 3. Region Restriction

Một số regions không support free tier:
- Check tại: https://ai.google.dev/gemini-api/docs/available-regions

## ✅ Giải pháp

### **Solution 1: Chuyển sang gemini-1.5-flash** (Khuyến nghị)

App đã tự động cập nhật config! Chỉ cần restart server:

```bash
# Dừng server hiện tại (Ctrl+C)
node server.js
```

**File đã cập nhật**: `src/config/gemini.js`

```javascript
module.exports = {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash', // Changed from gemini-2.0-flash-lite
    maxTokens: 2048,
    // ...
}
```

### **Solution 2: Enable Google Cloud Billing**

1. Truy cập: https://console.cloud.google.com/
2. Chọn project: `gen-lang-client-0455059158`
3. Billing → Link Billing Account
4. Thêm credit card (sẽ KHÔNG bị charge nếu dùng free quota)
5. Enable "Generative Language API"

### **Solution 3: Dùng API Key từ project khác**

Create new project với billing enabled:

```bash
# 1. Tạo project mới tại: https://console.cloud.google.com/
# 2. Enable "Generative Language API"
# 3. Enable Billing (link credit card)
# 4. Tạo API Key tại: https://aistudio.google.com/apikey
# 5. Update .env file:

GEMINI_API_KEY=your-new-api-key-here
```

### **Solution 4: Sử dụng Fallback Mode**

App đã có sẵn fallback system, hoạt động KHÔNG CẦN API:

```javascript
// Chatbot vẫn trả lời các câu hỏi:
- "Từ vựng gia đình" → 10 từ về gia đình
- "Từ vựng đồ ăn" → 10 từ về đồ ăn
- "Tips học tiếng Trung" → 5 tips học tập
- FAQ về pinyin, chữ Hán, HSK...
```

## 📊 So sánh Models

| Model | Free Tier | RPM | TPM | RPD | Chất lượng |
|-------|-----------|-----|-----|-----|------------|
| **gemini-1.5-flash** | ✅ YES | 15 | 1M | 1500 | ⭐⭐⭐⭐ |
| gemini-1.5-pro | ✅ YES | 2 | 32K | 50 | ⭐⭐⭐⭐⭐ |
| gemini-2.0-flash-lite | ❌ NO | 0 | 0 | 0 | ⭐⭐⭐ |
| gemini-2.0-flash-exp | 🟡 Limited | 10 | 4M | - | ⭐⭐⭐⭐⭐ |

**RPM**: Requests Per Minute  
**TPM**: Tokens Per Minute  
**RPD**: Requests Per Day

## 🔧 Kiểm tra Quota hiện tại

### Google AI Studio
https://aistudio.google.com/app/apikey

- Chọn API key
- Click "View in Google Cloud Console"
- Xem "Quotas & System Limits"

### Google Cloud Console
https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

## 🎯 Best Practices

### 1. Implement Request Throttling

```javascript
// Limit requests to 10/minute (well below 15 limit)
const rateLimiter = {
    requests: [],
    maxPerMinute: 10,
    
    canMakeRequest() {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < 60000);
        return this.requests.length < this.maxPerMinute;
    },
    
    addRequest() {
        this.requests.push(Date.now());
    }
};
```

### 2. Cache Common Responses

```javascript
// Cache frequently asked questions
const responseCache = new Map();

async function getCachedResponse(message) {
    const cacheKey = message.toLowerCase().trim();
    if (responseCache.has(cacheKey)) {
        return responseCache.get(cacheKey);
    }
    
    const response = await geminiService.generateResponse(message);
    responseCache.set(cacheKey, response);
    return response;
}
```

### 3. Use Fallback for Simple Queries

```javascript
// Detect simple vocabulary queries and use fallback
if (message.includes('từ vựng') || message.includes('vocabulary')) {
    return chatbotFallback.getFallbackResponse(message);
}
```

## 📞 Liên hệ hỗ trợ

- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **Rate Limits**: https://ai.google.dev/gemini-api/docs/rate-limits
- **Google Cloud Support**: https://cloud.google.com/support
- **GitHub Issues**: https://github.com/google-gemini/generative-ai-js/issues

## 🆕 Updates

**Feb 13, 2026**:
- ✅ Phát hiện gemini-2.0-flash-lite có limit: 0
- ✅ Chuyển sang gemini-1.5-flash (free tier: 15 RPM)
- ✅ Tăng maxTokens từ 1000 → 2048
- ✅ Giảm retry interval từ 5 phút → 2 phút
- ✅ Thêm fallback message cho "limit: 0" error

---

**💡 TL;DR**: Gemini 2.0 models không còn free tier. Dùng **gemini-1.5-flash** hoặc enable Google Cloud Billing.
