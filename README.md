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
```

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
