# 🔍 Hướng Dẫn Xem Logs và Debug

## 1. **Xem Logs trên Vercel Dashboard** (Khuyến nghị)

### Cách 1: Xem Function Logs
1. Mở [Vercel Dashboard](https://vercel.com/dashboard)
2. Click vào project **learn-taiwanese-pro**
3. Vào tab **Deployments**
4. Click vào deployment mới nhất (phía trên cùng)
5. Scroll xuống phần **Function Logs**
6. Bạn sẽ thấy tất cả logs với emoji:
   - 📥 Incoming requests
   - ✅ Successful operations
   - ❌ Errors
   - 🔄 Processing steps
   - 👤 User operations
   - 🔑 Token generation
   - 🔀 Redirects
   - 📱 Mobile detection
   - 💻 Desktop flow

### Cách 2: Xem Real-time Logs
1. Vào project → **Deployments**
2. Click **View Function Logs** (nút phía trên)
3. Tự động refresh khi có request mới

---

## 2. **Xem Logs qua Vercel CLI**

### Xem logs real-time:
```bash
vercel logs https://learn-taiwanese-pro.vercel.app --follow
```

### Xem logs của deployment cụ thể:
```bash
# List deployments
vercel ls

# View logs của deployment
vercel logs [deployment-url]
```

---

## 3. **Các Log Emojis và Ý Nghĩa**

| Emoji | Ý Nghĩa | Khi Nào Xuất Hiện |
|-------|---------|-------------------|
| 📥 | Incoming request | Google callback được gọi |
| ✅ | Success | Token verified, user found/created |
| ❌ | Error | OAuth error, missing code, token fail |
| 🔄 | Processing | Exchanging authorization code |
| 👤 | User operation | Creating new user |
| 🔑 | Token generation | JWT token generated |
| 🔀 | Redirect | Preparing redirect |
| 📱 | Mobile | Mobile/Zalo redirect |
| 💻 | Desktop | Desktop localStorage flow |

---

## 4. **Luồng Google OAuth với Logs**

### Luồng Thành Công:
```
📥 Google OAuth Callback: { query: { code: "..." }, ... }
🔄 Exchanging authorization code for tokens...
✅ ID token received, verifying...
✅ Token verified, user info: { email: "user@gmail.com", ... }
✅ Existing user found: user@gmail.com
🔑 JWT token generated for user: user@gmail.com
🔀 Redirecting user: { redirectUrl: "/user/home.html", ... }
📱 Using mobile redirect with URL parameters
➡️ Mobile redirect to: /user/home.html
```

### Luồng Lỗi (User Cancel):
```
📥 Google OAuth Callback: { query: { error: "access_denied" }, ... }
❌ Google OAuth error: { error: "access_denied", error_description: "..." }
```

### Luồng Lỗi (Missing Code):
```
📥 Google OAuth Callback: { query: {}, ... }
❌ Missing authorization code from Google: { query: {}, ... }
```

### Luồng Lỗi (Token Exchange Fail):
```
📥 Google OAuth Callback: { query: { code: "..." }, ... }
🔄 Exchanging authorization code for tokens...
❌ Google callback error: { error: "invalid_grant", stack: "..." }
```

---

## 5. **Debugging Workflow**

### Bước 1: Kiểm tra request đến callback
```
Tìm log: 📥 Google OAuth Callback
Kiểm tra:
- req.query có chứa 'code' không?
- req.query có 'error' không?
- user-agent là gì? (Mobile/Desktop)
```

### Bước 2: Kiểm tra token exchange
```
Tìm log: 🔄 Exchanging authorization code
Nếu không thấy: Code bị reject trước đó
Nếu có lỗi: Check Google Console config
```

### Bước 3: Kiểm tra user creation
```
Tìm log: 👤 User not found, creating new user
Hoặc: ✅ Existing user found
```

### Bước 4: Kiểm tra redirect
```
Tìm log: 🔀 Redirecting user
Kiểm tra:
- redirectUrl đúng không?
- isMobile detect đúng không?
```

---

## 6. **Test Google OAuth**

### Test trên Desktop:
1. Mở DevTools (F12)
2. Vào tab **Console**
3. Click "Đăng nhập với Google"
4. Quan sát logs trong Console
5. Đồng thời check Vercel Dashboard logs

### Test trên Mobile:
1. Mở Safari/Chrome trên điện thoại
2. Không thể xem console, chỉ check Vercel logs
3. Quan sát behavior:
   - Có redirect về app không?
   - URL có chứa `auth=success&token=...` không?
   - Toast notification xuất hiện không?

### Test trên Zalo:
1. Share link trong Zalo chat
2. Click link từ Zalo
3. Thử đăng nhập Google
4. Check Vercel logs để xem user-agent

---

## 7. **Common Errors và Cách Fix**

### ❌ Error: "redirect_uri_mismatch"
**Nguyên nhân**: Google Console không có redirect URI
**Fix**: 
1. Vào Google Console → Credentials
2. Thêm: `https://learn-taiwanese-pro.vercel.app/api/auth/google/callback`

### ❌ Error: "invalid_grant"
**Nguyên nhân**: 
- Authorization code đã được sử dụng
- Code expired (10 phút)
**Fix**: Thử đăng nhập lại

### ❌ Error: "access_denied"
**Nguyên nhân**: User hủy/từ chối permission
**Fix**: Normal behavior, không cần fix

### ❌ Error: 404 NOT_FOUND
**Nguyên nhân**: Vercel routing chưa đúng
**Fix**: Kiểm tra vercel.json rewrites

---

## 8. **Environment Variables Check**

### Kiểm tra env vars trên Vercel:
1. Project Settings → Environment Variables
2. Verify:
   - ✅ `GOOGLE_CLIENT_ID`
   - ✅ `GOOGLE_CLIENT_SECRET`
   - ✅ `GOOGLE_CALLBACK_URL`
   - ✅ `JWT_SECRET`
   - ✅ `MONGODB_URI`

### Test env vars:
```bash
# Local
node -e "console.log(process.env.GOOGLE_CLIENT_ID)"

# Vercel (qua logs)
# Thêm vào code: console.log('Env check:', { hasClientId: !!process.env.GOOGLE_CLIENT_ID })
```

---

## 9. **Monitor Request Flow**

### Setup monitoring:
1. Mở 2 windows:
   - Window 1: Your app (test login)
   - Window 2: Vercel Dashboard (watch logs)

2. Perform action → Immediately check logs

3. Note timestamps để match request với log

---

## 10. **Export Logs (Nếu cần support)**

### Cách 1: Screenshot Vercel Dashboard
- Function Logs section → Screenshot full screen

### Cách 2: Copy text logs
- Select logs → Ctrl+C → Paste to file

### Cách 3: Use CLI
```bash
vercel logs [deployment-url] > logs.txt
```

---

## 📞 **Contact Support**

Nếu vẫn gặp vấn đề sau khi check logs:
1. Export logs như hướng dẫn trên
2. Note lại:
   - Thời gian gặp lỗi (timezone)
   - Browser/Device
   - Steps to reproduce
3. Share logs + info để được support

---

## ✅ **Quick Checklist**

- [ ] Google Console có redirect URI đúng
- [ ] Vercel có đủ env variables
- [ ] vercel.json có rewrites cho `/api/auth/google*`
- [ ] Test trên cả desktop và mobile
- [ ] Check logs trên Vercel Dashboard sau mỗi test
- [ ] Browser không block cookies/localStorage
