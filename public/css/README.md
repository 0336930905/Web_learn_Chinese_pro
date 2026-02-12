# Games Common Styles

## Overview
File `games-common.css` chứa **Design System thống nhất** cho tất cả các game trong ứng dụng học tiếng Trung.

## Design Tokens

### Colors
- **Primary**: `#0d7ff2` (Blue) - Màu chủ đạo cho tất cả games
- **Secondary**: `#f472b6` (Pink)
- **Accent Colors**:
  - Purple: `#a78bfa`
  - Yellow: `#fbbf24`
  - Green: `#34d399`
  - Orange: `#f59e0b`

### Typography
- **Font Family**: Lexend (sans-serif)
- **Font Weights**: 300, 400, 500, 600, 700, 800, 900

### Spacing & Border Radius
- Border radius: `1rem`, `1.5rem`, `2rem`, `3rem`, `full`
- Consistent spacing scale

## CSS Variables
File sử dụng CSS Variables để dễ dàng chuyển đổi giữa light/dark mode:

```css
var(--color-primary)
var(--bg-primary)
var(--text-primary)
var(--shadow-primary)
```

## Usage

### 1. Import trong HTML
```html
<link rel="stylesheet" href="../css/games-common.css" />
```

### 2. Sử dụng CSS Classes
```html
<!-- Buttons -->
<button class="btn-primary">Click me</button>

<!-- Cards with hover effect -->
<div class="card-hover">...</div>

<!-- Tiles for game options -->
<div class="tile-hover">...</div>

<!-- Progress segments -->
<div class="progress-segment active"></div>

<!-- Score counter -->
<div class="score-counter">
  <div class="score-icon">⭐</div>
  <span>120</span>
</div>
```

### 3. Sử dụng CSS Variables
```css
.custom-element {
  background-color: var(--color-primary);
  color: var(--text-primary);
  border-radius: var(--radius-lg);
}
```

## Files Using This Stylesheet
1. `game_fill_in_the_blanks.html`
2. `game_listen.html`
3. `game_match_word.html`
4. `game_reverse_quiz.html`
5. `game_skids_vocabulary.html`
6. `game_vocabulary_content.html`

## Dark Mode Support
Tất cả colors và styles đều hỗ trợ dark mode thông qua class `.dark` trên `<html>` element.

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

## Maintenance
Khi cần thay đổi màu sắc hoặc font chữ cho toàn bộ games:
1. Chỉnh sửa CSS variables trong `:root` selector
2. Không cần update từng file HTML riêng lẻ
3. Tất cả games sẽ tự động cập nhật

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- CSS Variables và CSS Grid đều được hỗ trợ
