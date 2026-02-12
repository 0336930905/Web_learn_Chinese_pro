# 🚀 Quick Start: Gemini API Setup

## ⚡ 3 bước setup chatbot AI (2 phút)

### Bước 1: Lấy API Key miễn phí 🔑
```
1. Vào: https://aistudio.google.com/apikey
2. Đăng nhập Google
3. Click "Create API Key"
4. Copy key (dạng: AIzaSy...)
```

### Bước 2: Thêm vào project 📝

**Development (Local):**
```bash
# Tạo/mở file .env
echo "GEMINI_API_KEY=paste-your-key-here" >> .env

# Khởi động lại
npm start
```

**Production (Vercel):**
```bash
# Thêm env variable
vercel env add GEMINI_API_KEY production
# Paste key khi được hỏi

# Redeploy
vercel --prod
```

### Bước 3: Test 🧪
```bash
# Kiểm tra API
curl https://your-app.vercel.app/api/chatbot/health

# Kết quả OK:
{
  "status": "ready",
  "mode": "normal",
  "apiConfigured": true
}
```

---

## ⚠️ Gặp lỗi Quota Exceeded?

**Chatbot TỰ ĐỘNG chuyển sang Fallback Mode!**

✅ Vẫn trả lời được:
- Từ vựng cơ bản (gia đình, đồ ăn, số...)
- Tips học tập
- FAQ về app

❌ Không chat tự do

**Khắc phục:**
1. Đợi 1 phút (quota reset)
2. Tạo API key mới (miễn phí)
3. Hoặc dùng fallback mode

📖 Hướng dẫn chi tiết: [CHATBOT_TROUBLESHOOTING.md](./CHATBOT_TROUBLESHOOTING.md)

---

## 💰 Quota miễn phí

- 60 requests/phút
- 1,500 requests/ngày
- $0 - Hoàn toàn miễn phí!

**Mẹo tiết kiệm quota:**
- Giới hạn chat 1 tin/3 giây
- Dùng fallback cho từ vựng phổ biến
- Tạo nhiều API keys để rotate

---

## 🎯 Features

| Mode | AI Chat | Từ vựng | Tips | FAQ |
|------|---------|---------|------|-----|
| Normal | ✅ | ✅ | ✅ | ✅ |
| Fallback | ❌ | ✅ | ✅ | ✅ |

**Người dùng luôn có trải nghiệm tốt!** 🎉

---

## 📚 Resources

- [API Docs](https://ai.google.dev/docs)
- [Create Key](https://aistudio.google.com/apikey)
- [Troubleshooting](./CHATBOT_TROUBLESHOOTING.md)
- [Deployment](../DEPLOYMENT.md)
