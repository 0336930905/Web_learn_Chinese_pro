# Learn Taiwanese Pro 🇹🇼

## 📖 Giới thiệu

**Learn Taiwanese Pro** là nền tảng học tiếng Đài Loan (Taiwanese/Chinese) hiện đại, kết hợp công nghệ giáo dục với trải nghiệm game hóa (gamification) để tạo động lực học tập bền vững.

### 🎯 Mục tiêu

Giúp người học tiếng Đài Loan/Trung Quốc:
- **Ghi nhớ từ vựng hiệu quả** với thuật toán Spaced Repetition (lặp lại ngắt quãng)
- **Học một cách thú vị** qua 5+ mini-games tương tác
- **Theo dõi tiến độ rõ ràng** với hệ thống streak và achievements
- **Tự chủ học tập** với danh mục cá nhân và lịch trình ôn tập thông minh

### 🏗️ Kiến trúc

- **Backend**: Node.js + Express với Clean Architecture pattern
- **Database**: MongoDB Atlas (NoSQL) với 7 collections được tối ưu
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (Progressive Enhancement)
- **Authentication**: JWT tokens + Google OAuth
- **API Design**: RESTful API với error handling và validation middleware

## ✨ Tính năng chính

### 👥 Người dùng

- **Học viên (Student)**
  - Quản lý danh mục cá nhân và từ vựng
  - Học từ vựng với nhiều game khác nhau
  - Theo dõi tiến độ học tập
  - Hệ thống chuỗi học (streak)
  - Ôn tập thông minh với Spaced Repetition
  - Nhận thông báo và thành tích

- **Quản trị viên (Admin)**
  - Quản lý tài khoản người dùng
  - Tạo danh mục và từ vựng công khai
  - Xem hoạt động của người dùng
  - Thống kê hệ thống

### 🎮 Games học từ vựng

1. **Nghe - Chọn đúng (Listening Quiz)**
   - Nghe audio và chọn đáp án đúng
   - Luyện kỹ năng nghe

2. **Ghép chữ - Ghép nghĩa (Matching Game)**
   - Ghép chữ Hán với nghĩa tiếng Việt
   - Có tính thời gian và combo

3. **Điền từ còn thiếu (Fill in the blank)**
   - Điền từ vào câu ví dụ
   - Học từ trong ngữ cảnh

4. **Trắc nghiệm ngược (VN → Trung)**
   - Từ tiếng Việt chọn chữ Hán đúng
   - Luyện chuyển đổi tư duy

5. **Ôn tập thông minh (Spaced Repetition)**
   - Thuật toán Anki style
   - Từ nào quên sẽ xuất hiện nhiều hơn

## 🗄️ Database

Database được thiết kế với MongoDB, gồm 7 collections:

- `users` - Người dùng
- `categories` - Danh mục
- `vocabulary` - Từ vựng
- `user_progress` - Tiến độ học tập
- `notifications` - Thông báo
- `activities` - Hoạt động
- `achievements` - Thành tích

Chi tiết xem trong [database/schema.md](./database/schema.md)

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd Web_learn_Chinese_pro
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment

Copy file `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

### 4. Setup database

```bash
npm run db:setup
```

Script này sẽ:
- Kết nối MongoDB
- Tạo collections và indexes
- Insert sample data

### 5. Chạy ứng dụng

```bash
npm start
```

hoặc development mode:

```bash
npm run dev
```

## 📝 Scripts

```bash
npm run db:setup    # Setup database với sample data
npm run db:reset    # Reset database (xóa tất cả)
npm run db:test     # Test kết nối database
npm start           # Chạy ứng dụng
npm run dev         # Chạy ứng dụng (development mode)
npm run deploy      # Deploy lên Vercel production
```

## 🚀 Deployment lên Vercel

### Bước 1: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

### Bước 2: Login vào Vercel

```bash
vercel login
```

Chọn phương thức đăng nhập (GitHub, GitLab, Email, etc.)

### Bước 3: Deploy lần đầu

```bash
vercel
```

Trả lời các câu hỏi:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Chọn account/team của bạn
- **Link to existing project?** → `N` (No - tạo project mới)
- **Project name?** → `web-learn-chinese-pro` (hoặc tên khác)
- **In which directory?** → `./` (Enter)
- **Override settings?** → `N` (No)

### Bước 4: Cấu hình Environment Variables

Vào Vercel Dashboard → Project Settings → Environment Variables, thêm:

**Required Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
NODE_ENV=production
```

**Optional Variables (nếu dùng Google OAuth):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.vercel.app/api/auth/google/callback
```

**Optional Variables (nếu dùng AI Chatbot):**
```
GEMINI_API_KEY=your-gemini-api-key
```

### Bước 5: Deploy Production

```bash
vercel --prod
```

hoặc sử dụng script:

```bash
npm run deploy
```

### Bước 6: Setup Database trên Production

Sau khi deploy xong, chạy setup database:

1. Vào MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
2. Tạo database user với quyền readWrite
3. Chạy script setup qua Vercel CLI:

```bash
vercel env pull .env.production.local
node src/database/setup.js
```

### 🔄 Deploy Updates

Mỗi khi có code mới:

```bash
git add .
git commit -m "Your commit message"
git push origin master
vercel --prod
```

### 🌐 Custom Domain (Optional)

1. Vào Vercel Dashboard → Project → Settings → Domains
2. Add domain của bạn (ví dụ: `learntaiwanese.com`)
3. Cấu hình DNS theo hướng dẫn của Vercel
4. Đợi SSL certificate được cấp tự động

### ⚙️ File cấu hình Vercel (vercel.json)

File `vercel.json` đã được cấu hình sẵn:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/app.js"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["sin1"]
}
```

**Giải thích:**
- `builds`: Build backend từ `src/app.js` với Node.js runtime
- `routes`: 
  - API requests → `src/app.js`
  - Static files → `public/` directory
- `regions`: Deploy ở Singapore (sin1) - gần Việt Nam nhất

### 🐛 Troubleshooting

**Lỗi: "Module not found"**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
vercel --prod
```

**Lỗi: "Database connection failed"**
- Kiểm tra `MONGODB_URI` trong Environment Variables
- Đảm bảo MongoDB Atlas cho phép kết nối từ 0.0.0.0/0
- Kiểm tra database user có quyền readWrite

**Lỗi: "Function execution timed out"**
- Vercel Serverless Functions có timeout 10s (Hobby plan) / 60s (Pro plan)
- Tối ưu database queries với indexes
- Cache kết quả nếu có thể

**Xem logs:**
```bash
vercel logs [deployment-url]
```

### 📊 Monitoring

- **Logs**: `vercel logs` hoặc xem trên Dashboard
- **Analytics**: Vercel Dashboard → Analytics
- **Performance**: Vercel Dashboard → Speed Insights

## 🔑 Sample Accounts

Sau khi setup database, có thể đăng nhập với:

**Admin:**
- Email: `admin@learntaiwanese.com`
- Password: `admin123`

**Student:**
- Email: `student1@example.com`
- Password: `student123`

## 📁 Cấu trúc Project

```
Web_learn_Chinese_pro/
├── database/
│   ├── connection.js      # Kết nối MongoDB
│   ├── models.js          # Models và indexes
│   ├── seed.js            # Sample data
│   ├── setup.js           # Setup script
│   ├── schema.md          # Database design
│   └── README.md          # Database docs
├── examples.js            # Ví dụ sử dụng
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .gitignore            # Git ignore
└── README.md             # File này
```

## 💡 Examples

Xem file [examples.js](./examples.js) để tham khảo các thao tác cơ bản:

```bash
node examples.js
```

## 🧪 Testing

Test kết nối database:

```bash
npm run db:test
```

## 📚 Công nghệ sử dụng

- **Database**: MongoDB Atlas
- **ODM**: MongoDB Node.js Driver
- **Authentication**: bcryptjs
- **Language**: JavaScript (Node.js)

## 🔐 Bảo mật

- Passwords được hash với bcrypt
- MongoDB connection string được lưu trong .env
- Validation ở cả client và server
- Rate limiting cho APIs (nên implement)

## 📈 Roadmap

- [ ] Implement REST API
- [ ] Frontend với React/Vue
- [ ] Authentication với JWT
- [ ] Upload audio/image files
- [ ] Real-time notifications với WebSocket
- [ ] Mobile app với React Native
- [ ] AI pronunciation checking
- [ ] Social features (friends, leaderboard)

## 🤝 Contributing

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

ISC License

## 📧 Contact

- Email: support@learntaiwanese.com
- Website: https://learntaiwanese.com

---

Made with ❤️ by Learn Taiwanese Pro Team
