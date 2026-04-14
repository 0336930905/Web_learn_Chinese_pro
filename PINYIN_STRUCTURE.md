# 📚 Cấu Trúc Tổng Quan - Pinyin Learning Page

## 🎯 Mục Đích
Trang web học Pinyin (phụ âm, vần âm, thanh điệu) của VocabHero với giao diện tab-based.

---

## 📐 Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (Logo + Title)                │
├─────────────────────────────────────────────────────────┤
│         STATS ROW (3 Cards: Learned/Progress/Rate)      │
├─────────────────────────────────────────────────────────┤
│  TAB NAVIGATION (4 Tabs: Initials/Finals/Tones/Quiz)    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              TAB CONTENT (Dynamic Grid)                 │
│              - Initials Tab → 7 Group Cards             │
│              - Finals Tab → 6 Group Cards               │
│              - Tones Tab → 5 Tone Cards                 │
│              - Quiz Tab → Placeholder                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc HTML

### 1. **HEAD Section**
```html
<!-- Configurations -->
- Metadata (charset, viewport, title)
- External Libraries
  * Tailwind CSS (CDN)
  * Google Fonts (Lexend, Material Symbols)
- Custom Styles
  * Tailwind config (colors, fonts)
  * CSS classes (.tab-active, .tab-inactive, .tone-1 to .tone-4, .pinyin-card)
```

### 2. **BODY Structure**
```html
<body>
  ├── Sidebar Container (id="sidebar-container")
  │   └── Injected by sidebar.js
  │
  └── Main Content Area
      ├── Page Header
      │   ├── Icon + Title + Subtitle
      │   └── Stats Row (3 metric cards)
      │
      └── Tabs Container
          ├── Tab Navigation (4 buttons)
          └── Tab Content Area
              ├── Initials Tab (Large)
              ├── Finals Tab (Large)
              ├── Tones Tab (Large)
              └── Quiz Tab (Placeholder)
```

---

## 💾 Cấu Trúc Dữ Liệu JavaScript

### **pinyinData Object**

#### 1️⃣ **initialGroups** (Array)
```javascript
structure: [
  {
    name: string,                    // "Thanh mẫu môi"
    description: string,             // "Phát âm bằng môi"
    initials: [                       // Array of initials
      {
        pinyin: string,              // 'b', 'p', 'm'
        example: string,             // '爸 bà'
        note: string                 // 'không bật hơi'
      }
    ]
  }
]
```
**Số lượng nhóm:** 7
1. Thanh mẫu môi (b, p, m, f)
2. Thanh mẫu đầu lưỡi giữa (d, t, n, l)
3. Thanh mẫu cuốn lưỡi (g, k, h)
4. Thanh mẫu đầu lưỡi sau (zh, ch, sh, r)
5. Thanh mẫu đầu lưỡi trước (z, c, s)
6. Thanh mẫu mặt lưỡi (j, q, x)
7. Thanh mẫu bán nguyên âm (y, w)

#### 2️⃣ **finalGroups** (Array)
```javascript
structure: [
  {
    name: string,                    // "Nhóm vần mẫu a"
    pronunciation: string,           // "a (a mở miệng to)"
    icon: string,                    // "📚"
    finals: [                         // Array of finals
      {
        pinyin: string,              // 'a', 'ai', 'ao'
        meaning: string              // 'a', 'ai', 'ao'
      }
    ],
    features: string                 // "Âm mở miệng lớn..."
  }
]
```
**Số lượng nhóm:** 6
1. Nhóm vần mẫu a
2. Nhóm vần mẫu o
3. Nhóm vần mẫu e
4. Nhóm vần mẫu i
5. Nhóm vần mẫu u
6. Nhóm vần mẫu ü

#### 3️⃣ **tones** (Array)
```javascript
structure: [
  {
    number: number,                  // 1-5
    name: string,                    // "Thanh 1 (ˉ) – Thanh ngang"
    symbol: string,                  // "ˉ"
    symbols: string,                 // "ā ē ī ō ū ǖ"
    pronunciation: string,           // "cao và giữ đều"
    direction: string,               // "—"
    directionName: string,           // "ngang, cao"
    examples: [
      {
        character: string,           // '妈'
        pinyin: string,              // 'mā'
        meaning: string              // 'mẹ'
      }
    ]
  }
]
```
**Số lượng thanh:** 5
1. Thanh 1 – Thanh ngang (—)
2. Thanh 2 – Thanh lên (↗)
3. Thanh 3 – Thanh xuống rồi lên (∨)
4. Thanh 4 – Thanh xuống mạnh (↘)
5. Thanh 5 – Khinh thanh (·)

---

## 🎨 Cấu Trúc UI Component

### **1. Header Section**
```
┌─────────────────────────┐
│ 🌐 | Học Pinyin         │
│    | Nắm vững cách...   │
└─────────────────────────┘
```
- Flex layout: Icon (bg-primary) + Text
- Responsive: text size mở rộng trên desktop
- Files: `public/user/pinyin_learning.html` (lines 67-80)

### **2. Stats Row**
```
┌──────────────┬──────────────┬──────────────┐
│ ✓ Learned    │ ⏳ Progress  │ ↗ Success    │
│ 24           │ 8            │ 78%          │
└──────────────┴──────────────┴──────────────┘
```
- 3 cards (grid-cols-1 sm:grid-cols-3)
- Icons: check_circle, pending, trending_up
- Values: Dynamic (updateStats() function)
- Files: `public/user/pinyin_learning.html` (lines 82-120)

### **3. Tab Navigation**
```
[Thanh mẫu] [Vần mẫu] [Thanh điệu] [Quiz]
```
- 4 buttons với data-tab attribute
- Active/inactive CSS classes
- Responsive: icon only on mobile, text on desktop
- Files: `public/user/pinyin_learning.html` (lines 123-143)

### **4. Initials Tab Content**
```
Nhóm 1: Thanh mẫu môi
[b] [p] [m] [f]

Nhóm 2: Thanh mẫu đầu lưỡi giữa
[d] [t] [n] [l]
... (7 nhóm)
```
**Layout:**
- Group header: gradient bg (primary/10 → emerald-100) + border-left-4 + title + description
- Grid cards: 2 sm:3 md:4 lg:5 col layout
- Hover effect: translate-y-2 + shadow-lg
- Files: `public/user/pinyin_learning.html` (lines 145-150)
- Rendered by: `renderInitialGroups()` function

### **5. Finals Tab Content**
```
Nhóm 1: Nhóm vần mẫu a
👉 a (a mở miệng to)
[a] [ai] [ao] [an] [ang]
💡 Đặc điểm: Âm mở miệng...

... (6 nhóm)
```
**Layout:**
- Group header: gradient amber (amber-50 → orange-100) + icon + title
- Finals grid: card with pinyin + meaning (2-5 columns responsive)
- Feature box: blue background with info icon
- Files: `public/user/pinyin_learning.html` (lines 152-157)
- Rendered by: `renderFinals()` function

### **6. Tones Tab Content**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Thanh 1 (ˉ) – Thanh ngang    ┃
┃ 👉 Ký hiệu: ā ē ī ō ū ǖ     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 👉 Cách đọc: cao và giữ...   ┃
┃ Giọng: — (ngang, cao)        ┃
┃ Ví dụ:                       ┃
┃  妈 mā → mẹ                  ┃
┃  哥 gē → anh                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```
**Layout:**
- Card container: white/dark bg + border-2 + overflow-hidden
- Header: red gradient (red-500 → red-600) + title + symbol display (text-6xl)
- Content boxes:
  - Blue box: pronunciation with 👉 icon
  - Purple box: direction/giọng with emoji symbol
  - Examples: character + pinyin + meaning
- Files: `public/user/pinyin_learning.html` (lines 159-164)
- Rendered by: `renderTones()` function

### **7. Quiz Tab Content**
```
[School Icon - text-8xl]
Kiểm tra kiến thức Pinyin của bạn
[Bắt đầu bài kiểm tra Button]
```
- Status: Placeholder (Coming Soon)
- Files: `public/user/pinyin_learning.html` (lines 166-174)

---

## 🔧 JavaScript Functions

### **Initialization**
```javascript
// Called when page loads
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  renderInitialGroups();
  renderFinals();
  renderTones();
  updateStats();
});
```

### **Core Functions**

#### 1. `setupTabs()`
**Location:** `script` section, lines ~380-400
```javascript
Mục đích: Initialize tab click handlers
Hành động:
  - Query all .tab-btn buttons
  - Add click event listeners
  - On click:
    - Get data-tab attribute value
    - Remove .tab-active from all buttons
    - Add .tab-active to clicked button
    - Hide all .tab-content
    - Show target tab content
```

#### 2. `renderInitialGroups()`
**Location:** `script` section, lines ~403-430
```javascript
Mục đích: Render 7 groups of initials
Input: pinyinData.initialGroups (Array)
Hành động:
  - Get element #initials-grid
  - Loop qua each group with index
  - Template literals tạo:
    * Group header div (gradient + border-left-4)
    * Grid container (2 sm:3 md:4 lg:5 columns)
    * Pinyin cards (text-3xl bold + example + optional note)
  - Inject vào #initials-grid with innerHTML
```

#### 3. `renderFinals()`
**Location:** `script` section, lines ~433-465
```javascript
Mục đích: Render 6 groups of finals
Input: pinyinData.finalGroups (Array)
Hành động:
  - Get element #finals-grid
  - Loop qua each group with index
  - Template literals tạo:
    * Group header (amber gradient + icon + title)
    * Amber box với "Các vần mẫu" label + finals grid
    * Blue feature box với 💡 icon + features text
  - Inject vào #finals-grid with innerHTML
```

#### 4. `renderTones()`
**Location:** `script` section, lines ~468-510
```javascript
Mục đích: Render 5 tone cards
Input: pinyinData.tones (Array)
Hành động:
  - Get element #tones-grid
  - Loop qua each tone with index
  - Template literals tạo:
    * White card container
    * Red gradient header + title + symbols + large symbol display
    * Blue pronunciation box
    * Purple direction/giọng box
    * Examples section with character cards
  - Inject vào #tones-grid with innerHTML
```

#### 5. `updateStats()`
**Location:** `script` section, lines ~520-525
```javascript
Mục đích: Generate random stats
Hành động:
  - #learned-count: Math.floor(random * 30) + 10  // 10-40
  - #progress-count: Math.floor(random * 15) + 5  // 5-20
  - #success-rate: Math.floor(random * 40) + 60 + '%'  // 60-100%
```

#### 6. `startQuiz()`
**Location:** `script` section, lines ~513-515
```javascript
Mục đích: Handle quiz button click
Hành động:
  - Call showToast('Quiz sẽ sớm được phát hành!', 'info')
  - Future: Implement actual quiz logic or modal
```

#### 7. `showToast(msg, type)`
**Location:** `script` section, lines ~528-536
```javascript
Mục đích: Display toast notifications
Input:
  - msg: string (message to display)
  - type: 'error' | 'info' (default: 'info')
Hành động:
  - Get #toastContainer
  - Create div with conditional bg-color
  - Set textContent = msg
  - Append to container
  - Auto-remove sau 3000ms (setTimeout)
```

---

## 🎨 Tailwind CSS Classes & Colors

### **Custom CSS Utilities**
```css
/* File: <style> tag in <head> */

.tab-active
  @apply text-slate-900 dark:text-white
  @apply bg-primary/20 border-b-2 border-primary

.tab-inactive
  @apply text-slate-500 dark:text-slate-400
  @apply border-b-2 border-transparent
  @apply hover:text-slate-700 dark:hover:text-slate-300

.tone-1 { @apply text-red-500; }
.tone-2 { @apply text-orange-500; }
.tone-3 { @apply text-emerald-500; }
.tone-4 { @apply text-blue-500; }

.tone-mark { @apply font-bold text-3xl; }

.pinyin-card
  @apply transition-all duration-300
  @apply hover:-translate-y-2 hover:shadow-lg
```

### **Color Scheme**
```
Primary Color: #4ce64c (emerald green)
  - Used for: buttons, highlights, borders, icons

Background Colors:
  - Light: #f6f8f6 (very light gray)
  - Dark: #112111 (very dark green)

Card Colors:
  - Light: #ffffff (white)
  - Dark: #1e2a1e (dark card)

Gradient Patterns:
  - Initials Header: from-primary/10 to-emerald-100
  - Finals Header: from-amber-50 to-orange-100
  - Tones Header: from-red-500 to-red-600
```

### **Typography**
```
Font Family: Lexend (via Google Fonts)
  - Applied to: <body> with .font-display

Heading Sizes:
  - Page title: text-3xl md:text-4xl (font-bold)
  - Section title: text-2xl (font-bold)
  - Group title: text-lg (font-bold)

Text Sizes:
  - Descriptions: text-sm
  - Card content: text-xs
  - Notes: text-xs italic

Font Weights:
  - Bold: font-bold (700)
  - Semibold: font-semibold (600)
  - Medium: font-medium (500)
```

---

## 📱 Responsive Design

### **Grid Breakpoints**
```
Mobile (<640px):
  - 2 columns for grids
  - Icon only for tab buttons
  - Single column stats

sm (640px):
  - 3 columns for grids
  - Icon + text for tab buttons

md (768px):
  - 4 columns for grids

lg (1024px):
  - 5 columns for grids

Header Scaling:
  - Mobile: text-xl / text-2xl
  - Desktop: text-3xl / text-4xl

Stats Cards:
  - Mobile: grid-cols-1 (stacked)
  - Desktop: sm:grid-cols-3 (3 columns)
```

---

## 🗂️ File Structure

```
Web_learn_Chinese_pro/
├── public/
│   ├── user/
│   │   ├── pinyin_learning.html (MAIN FILE)
│   │   ├── home.html
│   │   ├── practice_vocabulary.html
│   │   └── ... (other pages)
│   │
│   ├── css/
│   │   └── user-common.css (shared styles)
│   │
│   ├── js/
│   │   └── sidebar.js (navigation component)
│   │
│   └── i18n/
│       └── translations.js (multi-language support)
│
└── PINYIN_STRUCTURE.md (this file)
```

---

## 📦 External Dependencies

### **CDN & Imports**
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300..700&display=swap" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

<!-- Project Files -->
<link rel="stylesheet" href="../css/user-common.css" />
<script src="../i18n/translations.js"></script>
<script src="../js/sidebar.js"></script>
```

### **Tailwind Config**
```javascript
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#4ce64c",
        "background-light": "#f6f8f6",
        "background-dark": "#112111",
        "card-dark": "#1e2a1e",
        ...
      },
      fontFamily: {
        "display": ["Lexend"]
      }
    }
  }
}
```

---

## 🔗 Related Pages & Components

### **Navigation Integration**
- **File:** `public/js/sidebar.js`
- **Feature:** Injects sidebar navigation into `#sidebar-container`
- **Active Page:** data-active-page="pinyin"
- **Link:** Points to "pinyin_learning.html"

### **Styling Consistency**
- **File:** `public/css/user-common.css`
- **Provides:** Common CSS variables, base styles, dark mode support

### **Multi-language Support**
- **File:** `public/i18n/translations.js`
- **Usage:** Optional (currently page uses hardcoded Vietnamese)
- **Future:** Can replace text with i18n.t('key', 'fallback')

---

## 🚀 Đề Xuất Cải Tiến & Phát Triển

### **Phase 1: Code Organization**
- [ ] Extract pinyinData to separate `data.js` file
- [ ] Extract render functions to `render.js` module
- [ ] Create `utils.js` for helper functions (updateStats, showToast)
- [ ] Add JSDoc comments to all functions

### **Phase 2: Features**
- [ ] ✨ Add audio pronunciation button (Web Audio API or TTS)
- [ ] ✨ Implement actual quiz functionality
  - [ ] Question generation
  - [ ] Answer validation
  - [ ] Score tracking
- [ ] ✨ Save user progress to localStorage/database
- [ ] ✨ Add search/filter functionality
- [ ] ✨ Bookmarks/favorites system

### **Phase 3: UI/UX Enhancement**
- [ ] Add smooth scroll animations (AOS library)
- [ ] Add page transition animations
- [ ] Explicit dark mode toggle button
- [ ] Improve mobile keyboard support
- [ ] Add loading skeleton states
- [ ] Tooltip for additional info

### **Phase 4: Accessibility**
- [ ] Add ARIA labels all interactive elements
- [ ] Implement keyboard navigation (Tab through all buttons)
- [ ] Add focus indicators for keyboard users
- [ ] Improve color contrast ratios (WCAG AAA)
- [ ] Test with screen readers

### **Phase 5: Performance**
- [ ] Lazy load tab content on demand
- [ ] Optimize Tailwind CSS output
- [ ] Minify JavaScript/CSS
- [ ] Add service worker for offline support
- [ ] Image optimization

### **Phase 6: Data Management**
- [ ] Replace hardcoded data with API calls
- [ ] Add database schema for user progress
- [ ] Create admin panel for content management
- [ ] Add content versioning system

---

## 🧪 Testing Checklist

### **Functional Tests**
- [ ] All 4 tabs navigate correctly
- [ ] Tab content renders properly
- [ ] Stats update when page loads
- [ ] Toast notifications appear and disappear
- [ ] Sidebar integration works

### **Responsive Tests**
- [ ] Mobile (375px): 2 columns, responsive text
- [ ] Tablet (768px): 3-4 columns, proper spacing
- [ ] Desktop (1024px): 5 columns, full layout
- [ ] Landscape orientations work

### **Browser Tests**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### **Accessibility Tests**
- [ ] Can navigate with Tab key only
- [ ] All buttons/links have visible focus
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader announces content
- [ ] Form inputs properly labeled

---

## 📝 Development Tips & Best Practices

### **1. Adding New Content**
```javascript
// Add to respective array in pinyinData
initialGroups.push({
  name: "New Group",
  description: "Description",
  initials: [...]
});

// Automatically renders in renderInitialGroups()
```

### **2. Styling New Elements**
```css
/* Use existing color scheme */
bg-primary (green)
bg-red-500 (tones header)
bg-amber-500 (finals header)
bg-blue-50 (info box)
bg-purple-50 (direction box)

/* Responsive classes */
grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
text-2xl md:text-4xl
p-4 md:p-8
```

### **3. Maintaining Dark Mode**
```html
<!-- Always add dark variants -->
bg-white dark:bg-card-dark
text-slate-900 dark:text-white
border-slate-200 dark:border-slate-700
```

### **4. Performance Tips**
```javascript
// Avoid repeated DOM queries
const grid = document.getElementById('grid');
grid.innerHTML = arrays.map(...).join('');

// Use event delegation for many items
document.addEventListener('click', (e) => {
  if (e.target.matches('.tab-btn')) { ... }
});
```

### **5. Common Patterns**
```javascript
// Render pattern
function render[SectionName]() {
  const container = document.getElementById('[section]-grid');
  container.innerHTML = pinyinData.[section].map(item => `
    <div class="...">...</div>
  `).join('');
}

// Event pattern
document.querySelectorAll('.selector').forEach(el => {
  el.addEventListener('click', () => { ... });
});
```

---

## 🔐 Security & Best Practices

- ✅ **Input Validation:** No user input in current version
- ✅ **XSS Prevention:** Using template literals safely (no user data)
- ✅ **CSRF Protection:** Not required (no form submissions)
- ⚠️ **As app grows:** Consider adding input sanitization with DOMPurify
- ⚠️ **API Security:** Add HTTPS, CORS headers when connecting to backend

---

## 📞 Troubleshooting

### **Tab not switching?**
- Check `.tab-btn` buttons have `data-tab` attribute
- Verify JavaScript setupTabs() called in DOMContentLoaded
- Check console for errors

### **Content not rendering?**
- Verify `pinyinData` object structure matches template
- Check container element IDs match in HTML
- Verify render functions called in DOMContentLoaded

### **Styling issues?**
- Ensure Tailwind CSS CDN loaded
- Check dark mode is enabled in html class
- Verify color variables in tailwind.config

### **Mobile layout broken?**
- Check responsive breakpoints: sm:, md:, lg:, xl:
- Verify grid-cols responsive classes
- Test viewport meta tag is present

---

## 📚 Reference Resources

### **Tailwind CSS**
- Documentation: https://tailwindcss.com/docs
- Color palette: https://tailwindcss.com/docs/customizing-colors
- Responsive: https://tailwindcss.com/docs/responsive-design

### **Material Design Icons**
- Search icons: https://fonts.google.com/icons
- Icon reference: text_fields, tonality, music_note, quiz, school, etc.

### **JavaScript**
- Template literals: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
- DOM APIs: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model

---

**Document Version:** 1.0  
**Last Updated:** April 14, 2026  
**Maintained by:** AI Assistant  
**Status:** Active Development
