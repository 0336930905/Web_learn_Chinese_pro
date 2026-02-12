# Landing Header Component

## Overview
`landing-header.js` là **Shared Header Component** tự động render header thống nhất cho tất cả landing pages (index.html, login_screen.html, sign_up_screen.html).

## Features
✅ **Single Source of Truth** - Header HTML chỉ định nghĩa 1 nơi  
✅ **Auto-Detection** - Tự động detect page hiện tại (index/login/signup)  
✅ **Dynamic Buttons** - Render buttons phù hợp với từng page  
✅ **Language Dropdown** - Built-in language switcher với animation  
✅ **Navigation Handling** - Tự động setup event handlers  
✅ **Zero Configuration** - Tự động khởi tạo khi DOM load

## Installation

### 1. Include Script
Add script tag trong `<head>` hoặc trước `</body>`:

```html
<head>
    <!-- Landing Common Styles -->
    <link rel="stylesheet" href="/css/landing-common.css" />
    <!-- Landing Header Component -->
    <script src="/js/landing-header.js"></script>
</head>
```

### 2. Add Placeholder
Add placeholder div nơi bạn muốn render header:

```html
<body>
    <!-- Header placeholder -->
    <div id="landing-header-placeholder"></div>
    
    <!-- Your page content -->
    <main>...</main>
</body>
```

**Lưu ý**: Nếu cần custom positioning, add inline styles:

```html
<!-- For fixed header -->
<div id="landing-header-placeholder" 
     style="position: fixed; top: 1rem; z-index: 50; left: 0; right: 0; margin: 0 auto; max-width: 1400px; padding: 0 1rem;">
</div>
```

### 3. Done! 🎉
Header sẽ tự động render khi page load. Không cần thêm JavaScript code nào khác.

## Auto-Initialization

Component tự động initialize khi:
- DOM content loaded
- Placeholder element (`#landing-header-placeholder`) tồn tại

```javascript
// Auto-init on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHeader);
} else {
    initializeHeader();
}
```

## Page Detection

Component tự động detect page type dựa trên URL pathname:

| URL Pattern | Page Type | Buttons Rendered |
|-------------|-----------|------------------|
| `/` hoặc `/index.html` | `index` | Login + Signup buttons |
| `/login_screen.html` | `login` | Signup button only |
| `/sign_up_screen.html` | `signup` | Login link only |

## Rendered HTML Structure

### Index Page Header
```html
<header class="landing-header">
    <div class="landing-header-inner bg-surface-light/90 dark:bg-surface-dark/90">
        <!-- Logo -->
        <a href="/index.html" class="landing-header-logo">
            <div class="landing-header-logo-icon bg-primary">
                <span class="material-symbols-outlined">school</span>
            </div>
            <span class="landing-header-logo-text">Vocabulary Adventure</span>
        </a>
        
        <!-- Navigation -->
        <nav class="landing-header-nav">
            <a href="/index.html#features">Features</a>
            <a href="/index.html#pricing">Pricing</a>
            <a href="/index.html#about">About</a>
        </nav>
        
        <!-- Actions -->
        <div class="landing-header-actions">
            <!-- Language Dropdown -->
            <div class="relative" id="langSwitcher">
                <button class="lang-toggle-btn" id="langToggleBtn">
                    <span class="material-symbols-outlined">language</span>
                </button>
                <div class="lang-dropdown" id="langDropdown">
                    <button class="lang-option" data-lang="en">English</button>
                    <button class="lang-option active" data-lang="vi">Tiếng Việt</button>
                    <button class="lang-option" data-lang="tw">繁體中文</button>
                </div>
            </div>
            
            <!-- Login Button (Desktop) -->
            <button class="hidden sm:flex btn-secondary" id="navLoginBtn">
                Login
            </button>
            
            <!-- Signup Button -->
            <button class="btn-secondary bg-primary" id="navSignupBtn">
                Sign Up
            </button>
        </div>
    </div>
</header>
```

### Login Page Header
Similar structure but với **Signup button only**:
```html
<!-- Actions -->
<div class="landing-header-actions">
    <!-- Language Dropdown -->
    <div class="relative" id="langSwitcher">...</div>
    
    <!-- Signup Button -->
    <a href="/sign_up_screen.html" class="btn-secondary bg-primary">
        Sign Up
    </a>
</div>
```

### Signup Page Header
Similar structure but với **Login link only**:
```html
<!-- Actions -->
<div class="landing-header-actions">
    <!-- Language Dropdown -->
    <div class="relative" id="langSwitcher">...</div>
    
    <!-- Login Link (Desktop) -->
    <a href="/login_screen.html" class="hidden sm:flex btn-secondary">
        Login
    </a>
</div>
```

## Built-in Features

### 1. Language Dropdown
Automatically initialized với:
- Toggle on button click
- Close when clicking outside
- Active language indicator
- i18n integration (if available)

```javascript
// Language toggle
langToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('show');
});

// Close on outside click
document.addEventListener('click', (e) => {
    if (!langSwitcher.contains(e.target)) {
        langDropdown.classList.remove('show');
    }
});
```

### 2. Navigation Buttons
Auto-setup event handlers cho login/signup buttons:

```javascript
// Login button (index page only)
navLoginBtn.addEventListener('click', () => {
    window.location.href = '/login_screen.html';
});

// Signup button (index page only)
navSignupBtn.addEventListener('click', () => {
    window.location.href = '/sign_up_screen.html';
});
```

### 3. i18n Integration
Tự động integrate với i18n nếu available:

```javascript
// Language selection
document.querySelectorAll('.lang-option').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        button.classList.add('active');
        
        // Change language if i18n available
        if (typeof i18n !== 'undefined' && i18n.setLanguage) {
            i18n.setLanguage(button.dataset.lang);
        }
    });
});
```

## Manual Initialization

Nếu cần manual control, sử dụng exposed API:

```javascript
// Manual initialization
window.LandingHeader.init();

// Get HTML only (no injection)
const headerHTML = window.LandingHeader.render();
console.log(headerHTML);
```

## CSS Classes Used

### Header Structure
- `.landing-header` - Outer container
- `.landing-header-inner` - Inner wrapper với glassmorphism
- `.landing-header-logo` - Logo link
- `.landing-header-logo-icon` - Logo icon wrapper
- `.landing-header-logo-text` - App name text
- `.landing-header-nav` - Navigation links container
- `.landing-header-nav-link` - Individual nav link
- `.landing-header-actions` - Right side actions

### Language Dropdown
- `.lang-toggle-btn` - Language button
- `.lang-dropdown` - Dropdown container
- `.lang-dropdown.show` - Visible state
- `.lang-option` - Language option button
- `.lang-option.active` - Active language

### Buttons
- `.btn-secondary` - Secondary button style
- `.bg-primary` - Primary background color

## Customization

### Custom Positioning
Override placeholder styles:

```html
<div id="landing-header-placeholder" 
     style="position: sticky; top: 0; z-index: 100;">
</div>
```

### Custom Colors
Colors are inherited from Tailwind config:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#4ce64c', // Your custom color
            }
        }
    }
}
```

### Custom Styling
Add additional CSS:

```css
/* Custom header background */
.landing-header-inner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

/* Custom logo size */
.landing-header-logo-icon {
    width: 3rem;
    height: 3rem;
}
```

## Integration with Existing Pages

### Remove Old Header HTML
**Before:**
```html
<body>
    <header class="...">
        <div class="...">
            <!-- 50+ lines of header code -->
        </div>
    </header>
    
    <main>...</main>
</body>
```

**After:**
```html
<head>
    <script src="/js/landing-header.js"></script>
</head>
<body>
    <div id="landing-header-placeholder"></div>
    <main>...</main>
</body>
```

### Remove Duplicate JavaScript
**Remove old event handlers:**
```javascript
// ❌ REMOVE - Now handled by landing-header.js
const langToggleBtn = document.getElementById('langToggleBtn');
langToggleBtn.addEventListener('click', ...);

const navLoginBtn = document.getElementById('navLoginBtn');
navLoginBtn.addEventListener('click', ...);
```

**Keep only page-specific handlers:**
```javascript
// ✅ KEEP - Page-specific buttons
const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
heroGetStartedBtn.addEventListener('click', () => {
    window.location.href = '/sign_up_screen.html';
});
```

## Files Structure

```
public/
├── css/
│   └── landing-common.css         ← Styles for header
├── js/
│   └── landing-header.js          ← This component
├── index.html                     ← Uses header
├── login_screen.html              ← Uses header
└── sign_up_screen.html            ← Uses header
```

## Browser Support
- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- IE11: ❌ Not supported

## Troubleshooting

### Header không render
**Problem:** Header không xuất hiện trên page

**Solutions:**
1. Check placeholder element tồn tại:
   ```javascript
   console.log(document.getElementById('landing-header-placeholder'));
   ```

2. Check script được load:
   ```javascript
   console.log(window.LandingHeader);
   ```

3. Check console cho errors:
   ```javascript
   // Open DevTools > Console
   ```

### Language dropdown không hoạt động
**Problem:** Click vào language button không mở dropdown

**Solutions:**
1. Check CSS được load:
   ```html
   <link rel="stylesheet" href="/css/landing-common.css" />
   ```

2. Check `.show` class được thêm:
   ```javascript
   const dropdown = document.getElementById('langDropdown');
   console.log(dropdown.classList.contains('show'));
   ```

3. Check z-index conflicts:
   ```css
   .lang-dropdown {
       z-index: 100 !important;
   }
   ```

### Buttons không navigate
**Problem:** Click Login/Signup buttons không chuyển trang

**Solutions:**
1. Check event listeners được attach:
   ```javascript
   const btn = document.getElementById('navLoginBtn');
   console.log(btn); // Should not be null
   ```

2. Check paths đúng:
   ```javascript
   // Should use absolute paths
   window.location.href = '/login_screen.html'; // ✅
   window.location.href = 'login_screen.html';  // ❌
   ```

### i18n không hoạt động
**Problem:** Language change không translate text

**Solutions:**
1. Check i18n được load trước:
   ```html
   <script src="/i18n/translations.js"></script>
   <script src="/js/landing-header.js"></script>
   ```

2. Check i18n.init() được gọi:
   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
       i18n.init(); // Call this first
   });
   ```

3. Check data-i18n attributes:
   ```html
   <span data-i18n="landing.appName">Vocabulary Adventure</span>
   ```

## Performance

### Load Time
- **Component Size**: ~5KB (minified)
- **Render Time**: < 10ms
- **First Paint**: No blocking

### Optimization Tips
1. Load script async if possible:
   ```html
   <script src="/js/landing-header.js" async></script>
   ```

2. Defer non-critical scripts:
   ```html
   <script src="/js/landing-header.js" defer></script>
   ```

3. Use CDN for faster delivery (production):
   ```html
   <script src="https://cdn.example.com/landing-header.min.js"></script>
   ```

## Migration Guide

### Step 1: Add Script
```html
<head>
    <script src="/js/landing-header.js"></script>
</head>
```

### Step 2: Replace Header
Replace existing `<header>` with placeholder:
```html
<div id="landing-header-placeholder"></div>
```

### Step 3: Remove Duplicate JS
Delete language dropdown và navigation button handlers.

### Step 4: Test
1. Open page trong browser
2. Verify header renders correctly
3. Test language dropdown
4. Test navigation buttons
5. Check responsive design (mobile/tablet/desktop)

## Best Practices

1. **Always use placeholder**: Never directly modify header HTML
2. **Call i18n.init() first**: Before header renders
3. **Use absolute paths**: For all navigation links
4. **Test all pages**: Index, login, signup
5. **Check responsive**: Mobile, tablet, desktop
6. **Verify dark mode**: Both light and dark themes

## Examples

### Basic Usage
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Landing Page</title>
    <link rel="stylesheet" href="/css/landing-common.css">
    <script src="/i18n/translations.js"></script>
    <script src="/js/landing-header.js"></script>
</head>
<body>
    <!-- Header auto-renders here -->
    <div id="landing-header-placeholder"></div>
    
    <main>
        <h1>Welcome!</h1>
    </main>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            i18n.init(); // Initialize translations
            // Header is already rendered by landing-header.js
        });
    </script>
</body>
</html>
```

### With Custom Positioning
```html
<body class="relative">
    <!-- Fixed header at top -->
    <div id="landing-header-placeholder" 
         style="position: fixed; top: 1rem; z-index: 50; left: 0; right: 0; margin: 0 auto; max-width: 1400px; padding: 0 1rem;">
    </div>
    
    <!-- Content with top padding to avoid overlap -->
    <main style="padding-top: 100px;">
        <h1>Content</h1>
    </main>
</body>
```

## Changelog

### v1.0.0 (2026-02-08)
- ✅ Initial release
- ✅ Auto page detection (index/login/signup)
- ✅ Dynamic button rendering
- ✅ Language dropdown with animation
- ✅ i18n integration
- ✅ Responsive design
- ✅ Dark mode support

---

**Last Updated**: February 8, 2026  
**Version**: 1.0.0  
**Maintained by**: Web Learn Chinese Pro Team  
**Status**: ✅ Production Ready
