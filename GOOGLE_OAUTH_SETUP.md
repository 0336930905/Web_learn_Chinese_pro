# 🔐 Hướng Dẫn Cấu Hình Google OAuth

## ⚠️ LỖI THƯỜNG GẶP: redirect_uri_mismatch

Nếu đăng nhập Google không hoạt động, 99% là do **Redirect URI chưa được thêm vào Google Console**.

---

## 📋 **Checklist Setup Google OAuth**

### ✅ **Bước 1: Truy cập Google Cloud Console**

1. Mở: https://console.cloud.google.com/
2. Chọn project của bạn (hoặc tạo project mới)

---

### ✅ **Bước 2: Enable Google+ API**

1. Vào **APIs & Services** → **Library**
2. Tìm "Google+ API" hoặc "People API"
3. Click **Enable**

---

### ✅ **Bước 3: Tạo OAuth 2.0 Credentials (Nếu chưa có)**

1. Vào **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Chọn **Application type**: Web application
4. Đặt tên: "Learn Taiwanese Pro"
5. Trong **Authorized JavaScript origins**, thêm:
   ```
   https://learn-taiwanese-pro.vercel.app
   ```

6. Trong **Authorized redirect URIs**, thêm:
   ```
   https://learn-taiwanese-pro.vercel.app/api/auth/google/callback
   ```

7. Click **CREATE**
8. Copy **Client ID** và **Client Secret**

---

### ✅ **Bước 4: Configure OAuth Consent Screen**

1. Vào **APIs & Services** → **OAuth consent screen**
2. Chọn **User Type**: External (cho testing)
3. Điền thông tin:
   - **App name**: Learn Taiwanese Pro
   - **User support email**: Your email
   - **Developer contact**: Your email
4. **Scopes**: Thêm:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. **Test users** (Quan trọng!): Thêm email của bạn để test
6. Click **SAVE AND CONTINUE**

---

### ✅ **Bước 5: Set Environment Variables trên Vercel**

1. Mở: https://vercel.com/dashboard
2. Chọn project **learn-taiwanese-pro**
3. Vào **Settings** → **Environment Variables**
4. Thêm 3 biến sau:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | [Paste Client ID từ Google Console] | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | [Paste Client Secret từ Google Console] | Production, Preview, Development |
| `GOOGLE_CALLBACK_URL` | `https://learn-taiwanese-pro.vercel.app/api/auth/google/callback` | Production, Preview, Development |

5. Click **Save** cho mỗi variable

---

### ✅ **Bước 6: Redeploy (Quan trọng!)**

Sau khi thêm Environment Variables, BẮT BUỘC phải redeploy:

```bash
vercel --prod --yes
```

---

## 🧪 **Test Setup**

### Test 1: Check Redirect URI
1. Vào Google Console → Credentials
2. Click vào OAuth 2.0 Client ID của bạn
3. Verify trong **Authorized redirect URIs** có:
   ```
   https://learn-taiwanese-pro.vercel.app/api/auth/google/callback
   ```

### Test 2: Check Environment Variables
1. Vào Vercel → Settings → Environment Variables
2. Verify có đủ 3 variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)
3. Check "Production" được tick

### Test 3: Check OAuth Consent
1. Vào Google Console → OAuth consent screen
2. Verify email của bạn có trong **Test users**
3. Nếu app chưa publish, chỉ test users mới đăng nhập được

---

## 🐛 **Common Errors & Solutions**

### ❌ Error: "redirect_uri_mismatch"
**Nguyên nhân**: Redirect URI không khớp
**Fix**: 
1. Check Google Console → Credentials → Authorized redirect URIs
2. Phải có CHÍNH XÁC: `https://learn-taiwanese-pro.vercel.app/api/auth/google/callback`
3. Không có trailing slash
4. Không có typo

### ❌ Error: "access_denied"
**Nguyên nhân**: Email không có trong Test users (nếu app chưa publish)
**Fix**:
1. Google Console → OAuth consent screen → Test users
2. Thêm email bạn đang test

### ❌ Error: "invalid_client"
**Nguyên nhân**: Client ID/Secret sai hoặc chưa set env
**Fix**:
1. Check Vercel env variables
2. Copy lại Client ID/Secret từ Google Console
3. Redeploy sau khi update

### ❌ Error: "This app isn't verified"
**Nguyên nhân**: App chưa được Google verify (normal cho development)
**Fix**:
- Click "Advanced" → "Go to [App Name] (unsafe)"
- Hoặc submit app cho review (nếu muốn production-ready)

---

## 📸 **Screenshots Guide**

### 1. Google Console - Credentials Page
```
APIs & Services → Credentials

[+ CREATE CREDENTIALS ▼] [+ CREATE CREDENTIALS]

OAuth 2.0 Client IDs
Name                          Type            Creation date
Learn Taiwanese Pro          Web application  Feb 15, 2026
```

### 2. Edit OAuth Client - Authorized Redirect URIs
```
Authorized redirect URIs
For use with requests from a web server

+ ADD URI

1. https://learn-taiwanese-pro.vercel.app/api/auth/google/callback [×]

URIs 1 must match an authorized redirect URI in your Google API....
```

### 3. Vercel Environment Variables
```
Environment Variables

GOOGLE_CLIENT_ID
Value: 123456789-abc...apps.googleusercontent.com
Environments: ☑ Production ☑ Preview ☑ Development

GOOGLE_CLIENT_SECRET  
Value: GOCSPX-abc...xyz (hidden)
Environments: ☑ Production ☑ Preview ☑ Development

GOOGLE_CALLBACK_URL
Value: https://learn-taiwanese-pro.vercel.app/api/auth/google/callback
Environments: ☑ Production ☑ Preview ☑ Development
```

---

## ✅ **Final Checklist**

- [ ] Google Console có OAuth 2.0 Client ID
- [ ] Authorized redirect URIs có callback URL đúng
- [ ] OAuth consent screen configured
- [ ] Email test user được thêm (nếu app chưa publish)
- [ ] Vercel có đủ 3 env variables
- [ ] Env variables có tick "Production"
- [ ] Đã redeploy sau khi thêm env
- [ ] Test đăng nhập Google
- [ ] Check logs trên Vercel Dashboard

---

## 🎯 **Quick Setup Commands**

```bash
# 1. Deploy sau khi config
vercel --prod --yes

# 2. Check logs
vercel logs https://learn-taiwanese-pro.vercel.app --follow

# 3. Test local (optional)
vercel dev
```

---

## 📞 **Nếu vẫn lỗi**

1. **Copy logs** từ Vercel Dashboard
2. **Screenshot** Google Console credentials page
3. **Verify** redirect URI chính xác
4. **Check** browser console (F12) khi click "Đăng nhập Google"

Logs sẽ cho biết chính xác lỗi gì:
- 📥 Request incoming
- ❌ Error details
- 🔄 Token exchange status
