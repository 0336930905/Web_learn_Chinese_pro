2 người dùng chính 
chức năng chung :
đăng nhập + đăng ký
học viên 
- mỗi học viên sẽ có 1 danh mục cá nhân dùng để tự học 
mỗi danh mục sẽ có các từ vựng phù hợp với danh mục đó (từ vựng là con của danh mục)
- kiểm tra từ vựng (mỗi admin sẽ có các danh mục và từ vựng dùng cho cho tất cả các user) dùng để kiểm tra và đánh giá thành tích + chuỗi học + kinh nghiêm và cấp độ các từ đã học của học viên 
- thông báo 
- quản lý danh mục cá nhân của mỗi tài khoản user gồm thêm sửa xóa danh mục 
-  quản lý từ vựng cá nhân thêm sửa xóa từ vựng 
các game cho học viên (gam)
Nghe – Chọn đúng (Listening Quiz)
Mục tiêu: Luyện nghe tiếng Đài / Trung
Cách chơi
Phát audioUrl
Hiển thị 4 đáp án:
traditional
pinyin
vietnamese
(1 đúng + 3 nhiễu)
Dùng field nào?
audioUrl
traditional
pinyin
Vietnamese
Ghép chữ – Ghép nghĩa (Matching Game)
Mục tiêu: Nhớ nhanh mặt chữ & nghĩa
Cách chơi
Cột trái: traditional
Cột phải: vietnamese
Kéo thả để ghép đúng
Dùng field
traditional
vietnamese
imageUrl (nếu có thì rất mạnh)
✨ Nâng cấp
Thêm thời gian ⏱
Combo đúng liên tiếp
Điền từ còn thiếu (Fill in the blank)
Mục tiêu: Học qua ví dụ thực tế
Cách chơi
Ví dụ:
我想喝 ___
(Tôi muốn uống ___)
Người học nhập:
traditional
hoặc
pinyin
Dùng field
examples[]
traditional
pinyin
Chấm điểm
Đúng tuyệt đối
Gợi ý từng chữ (hint)
rắc nghiệm ngược (VN → Trung)
Mục tiêu: Chuyển từ tư duy tiếng Việt sang tiếng Đài
Cách chơi
Hiển thị:
vietnamese: “ăn sáng”
Chọn:
早餐 ✅
晚餐
吃飯
飲料
Dùng field
vietnamese
traditional
difficulty
✨ Nâng cấp
Lọc theo difficulty
Chế độ “hardcore”: không có pinyin
Ôn tập thông minh (Spaced Repetition – Anki style)
Mục tiêu: Nhớ lâu – không học lại từ đã quá quen
Ý tưởng
Mỗi từ có:
level nhớ (1–5)
sai → quay lại level 1
đúng nhiều → ít xuất hiện
quản trị viên 
- quản lý tài khoản 
- quản lý danh mục cá nhân của admin 
- quản lý từ vựng  cá nhân của admin
- xem hoạt động 




dựa vào tất cả các game trong thư mục games tạo 1 game_test.html tổng hợp lại tất cả các game nghe chọn đúng ghép chữ thành nghĩa điền từ còn thiếu trắc nghiêm việt - đài loan nghe 

tôi sẽ mô tả chi tiết logic của game đầu tiên sẽ mở b1 game_test b2 hiển thị modal lựa chọn độ khó 
 theo users.stats.level nếu level thấp hơn 3 thì chỉ được chọn các bộ từ cơ bản lớn hơn hoặc bằng 3 thì trung bình level lớn hơn 5 thì được chọn cả 3 là cơ bản - trung bình - khó và các categories này chỉ lấy ra với các tài khoản thuộc role là admin 
b3 