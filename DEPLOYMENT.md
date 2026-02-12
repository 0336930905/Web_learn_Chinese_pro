# 🚀 Hướng dẫn Deploy lên Vercel

## 📋 Chuẩn bị trước khi Deploy

### 1. Cài đặt Vercel CLI (nếu chưa có)
```bash
npm install -g vercel
```

### 2. Đăng nhập Vercel
```bash
vercel login
```

### 3. Setup MongoDB Atlas (Database Cloud)

#### Bước 1: Tạo tài khoản MongoDB Atlas
- Truy cập: https://www.mongodb.com/atlas
- Đăng ký miễn phí (Free Tier - 512MB)

#### Bước 2: Tạo Cluster
- Click "Build a Database" → Chọn "Free" tier
- Chọn region gần nhất (Singapore cho VN)
- Đặt tên cluster (vd: `learn-taiwanese-cluster`)

#### Bước 3: Tạo Database User
- Database Access → Add New Database User
- Username: `learn-taiwanese-admin`
- Password: Tạo mật khẩu mạnh (lưu lại!)
- Role: Atlas admin hoặc Read/Write any database

#### Bước 4: Whitelist IP
- Network Access → Add IP Address
- **Quan trọng**: Chọn "Allow Access from Anywhere" (`0.0.0.0/0`)
- Hoặc thêm Vercel IPs: https://vercel.com/docs/concepts/functions/serverless-functions/regions

#### Bước 5: Lấy Connection String
- Clusters → Connect → Drivers → Node.js
- Copy connection string, thay `<password>` bằng mật khẩu thực
- Ví dụ: `mongodb+srv://learn-taiwanese-admin:MyPassword123@cluster.mongodb.net/chinese_learning?retryWrites=true&w=majority`

### 4. Kiểm tra các file đã tạo
- ✅ `api/index.js` - Entry point cho Vercel
- ✅ `vercel.json` - Cấu hình deployment
- ✅ `.vercelignore` - Loại trừ files không cần thiết

---

## 🎯 Deploy lên Vercel

### Phương án 1: Deploy từ Terminal (Khuyến nghị)

#### Bước 1: Deploy lần đầu
```bash
vercel
```

Trả lời các câu hỏi:
- Set up and deploy: **Y**
- Which scope: Chọn account của bạn
- Link to existing project: **N**
- Project name: **learn-taiwanese-pro** (hoặc tên khác)
- Directory: **.** (thư mục hiện tại)
- Override settings: **N**

#### Bước 2: Thiết lập Environment Variables
Trên terminal sau khi deploy, hoặc trên dashboard:

```bash
# MongoDB
vercel env add MONGODB_URI
# Paste connection string MongoDB Atlas

# JWT Secret (tạo string random dài 32+ ký tự)
vercel env add JWT_SECRET
# Paste: ví dụ "MySecretKey123456789SuperSecureJWT2024XYZ"

# Google OAuth (Tùy chọn)
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# Gemini AI (Tùy chọn - cho chatbot)
vercel env add GEMINI_API_KEY
```

**Lưu ý**: Chọn "Production", "Preview", và "Development" cho mỗi biến!

#### Bước 3: Deploy Production
```bash
vercel --prod
```

### Phương án 2: Deploy từ GitHub (Tự động)

#### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### Bước 2: Import vào Vercel
- Truy cập: https://vercel.com/new
- Import Git Repository → Chọn repo của bạn
- Framework Preset: **Other**
- Root Directory: **.**
- Build Command: Để trống
- Output Directory: `public`

#### Bước 3: Thêm Environment Variables
- Project Settings → Environment Variables
- Thêm từng biến như hướng dẫn ở Phương án 1

#### Bước 4: Deploy
- Click "Deploy"
- Vercel sẽ tự động deploy mỗi khi push code!

---

## 🔧 Kiểm tra sau Deploy

### 1. Kiểm tra API
```bash
curl https://your-project.vercel.app/api
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Learn Taiwanese Pro API",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Kiểm tra Frontend
- Mở: `https://your-project.vercel.app/public/index.html`
- Hoặc: `https://your-project.vercel.app/`

### 3. Kiểm tra Authentication
```bash
# Test Login API
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to MongoDB"
**Giải pháp**:
1. Kiểm tra MONGODB_URI đúng format
2. Kiểm tra Network Access whitelist IP `0.0.0.0/0`
3. Kiểm tra username/password không có ký tự đặc biệt (hoặc encode URL)
4. Xem logs: `vercel logs`

### Lỗi: "Function exceeded maximum duration"
**Giải pháp**:
- Vercel free tier: 10 giây max
- Upgrade plan hoặc optimize code
- Tăng `maxDuration` trong `vercel.json`

### Lỗi: "Module not found"
**Giải pháp**:
```bash
# Xóa node_modules và reinstall
rm -rf node_modules
npm install
vercel --prod
```

### Lỗi 404 khi truy cập routes
**Giải pháp**:
- Kiểm tra `routes` trong `vercel.json`
- API routes phải bắt đầu `/api/`
- Static files phải trong `public/`

---

## 📊 Monitoring & Logs

### Xem logs real-time
```bash
vercel logs --follow
```

### Xem logs của deployment cụ thể
```bash
vercel logs [deployment-url]
```

### Dashboard Vercel
- Analytics: https://vercel.com/dashboard/analytics
- Logs: https://vercel.com/dashboard/logs
- Deployments: https://vercel.com/dashboard/deployments

---

## 🔄 Update & Redeploy

### Deploy version mới
```bash
# Commit changes
git add .
git commit -m "Update features"

# Deploy to production
vercel --prod
```

### Rollback to previous deployment
- Vào Vercel Dashboard → Deployments
- Chọn deployment cũ → "Promote to Production"

---

## 🎉 Hoàn tất!

Website của bạn đã live tại:
- **Production**: `https://learn-taiwanese-pro.vercel.app`
- **Custom Domain**: Có thể thêm domain riêng trong Project Settings

### Next Steps:
1. ✅ Setup custom domain (tùy chọn)
2. ✅ Enable Analytics
3. ✅ Setup monitoring alerts
4. ✅ Configure caching cho static files
5. ✅ Add SSL certificate (tự động)

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- Issues: https://github.com/your-repo/issues
