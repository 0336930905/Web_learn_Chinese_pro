# Voice Selector Fixes - Quick Reference

## 📱 Recent Updates

### Mobile Voice Selector Fix
- ✅ Enhanced mobile browser detection (iOS, Android)
- ✅ Improved voice loading with retry mechanism
- ✅ User gesture detection for iOS voice loading
- ✅ Better fallback options
- ✅ Mobile-specific timeouts and error handling

**See**: [VOICE_SELECTOR_MOBILE_FIX.md](VOICE_SELECTOR_MOBILE_FIX.md)

### iOS Voice Library Fix
- ✅ Added support for iOS/Siri voices (Meijia, Shelley, Grandma, etc.)
- ✅ Platform-based voice grouping (iOS/Google/Microsoft)
- ✅ Better voice name matching for iOS
- ✅ Enhanced logging for debugging
- ✅ Improved voice selection logic

**See**: [IOS_VOICE_FIX.md](IOS_VOICE_FIX.md)

## 🎯 Quick Start

### For Users

1. **Desktop**: Voice selector works automatically
   - Voices load in 1-2 seconds
   - Shows Google/Microsoft voices

2. **Mobile (Android)**: 
   - Shows Google voices
   - Tap screen if voices don't load immediately

3. **Mobile (iOS/iPhone)**:
   - Shows iOS/Apple voices (Meijia, Shelley, etc.)
   - Tap screen to trigger voice loading
   - Select voice from "🍎 iOS/Apple" group

### For Testing

Open test page on your device:
```
https://your-app.vercel.app/games/voice-test.html
```

Features:
- Shows device info
- Lists all available voices
- Shows selected voice details
- Debug console

### For Developers

Key files:
- `public/games/games-header.js` - Main voice logic
- `public/games/games-header.html` - Header template
- `public/games/voice-test.html` - Test page
- `public/user/games_home.html` - Voice selector UI

## 🔍 Common Issues

### "Voices not loading"
- **Tap the screen** (iOS requires user interaction)
- Wait 1-2 seconds
- Check console for retry messages

### "Voice doesn't speak"
- Check selected voice in dropdown
- Press "Test Voice" button
- Check console logs
- Verify audio is enabled

### "Different voices on mobile"
- **Normal behavior**: Each platform has different voice library
- iOS: Siri voices (Meijia, Shelley)
- Android: Google voices
- Desktop: Google/Microsoft voices

### "Voice selection not saved"
- Check localStorage in browser
- Voice settings are device-specific
- Need to select voice on each device

## 📊 Voice Support Matrix

| Platform | Voice Provider | Examples | Count |
|----------|---------------|----------|-------|
| iOS | Apple/Siri | Meijia, Shelley, Grandma | 9+ |
| Android | Google | Google 國語（臺灣） | 3+ |
| Windows | Microsoft, Google | HanHan, Zhiwei, Google TW | 5+ |
| macOS | Apple, Google | Mixed | 10+ |

## 🧪 Testing Checklist

- [ ] Test on desktop browser (Chrome/Edge)
- [ ] Test on Android phone (Chrome)
- [ ] Test on iPhone (Safari)
- [ ] Test on iPad (Safari)
- [ ] Verify voice selection persists (localStorage)
- [ ] Test speech synthesis ("Nghe thử" button)
- [ ] Check console logs for errors
- [ ] Verify fallback options work

## 📝 Console Log Examples

### Desktop (Normal)
```
📱 Device detected: Desktop
✅ Found 12 Chinese voices
✅ Added 3 Google voices
✅ Added 5 Microsoft voices
```

### iOS (Normal)
```
📱 Device detected: Mobile (iOS)
🎤 Initializing voice selector...
✅ Dummy utterance triggered
📝 Voice details:
  1. "Meijia" [zh-TW] Local
  2. "Shelley" [zh-TW] Local
✅ Added 9 iOS voices
```

### iOS (User Gesture Needed)
```
📱 Device detected: Mobile (iOS)
⏳ Retry 50/100...
👆 User gesture detected, loading voices...
✅ Found 9 Chinese voices
```

## 🐛 Debugging

### Check Voices Available
```javascript
window.speechSynthesis.getVoices().forEach(v => {
  console.log(`${v.name} [${v.lang}]`);
});
```

### Test Voice Library
```javascript
window.logVoiceLibrary(true); // Chinese only
```

### Check Settings
```javascript
console.log('Voice:', localStorage.getItem('selectedVoiceName'));
console.log('Lang:', localStorage.getItem('selectedVoice'));
console.log('Audio:', localStorage.getItem('audioEnabled'));
```

### Force Reload
```javascript
window.populateVoiceSelector();
```

## 📞 Need Help?

1. Open `voice-test.html` in browser
2. Check device info section
3. Check voice info section
4. Copy debug console output
5. Check if voice is "Local" or "Remote"

## 🚀 Deployment

```bash
# Commit changes
git add .
git commit -m "Fix voice selector for mobile and iOS"

# Push to Vercel
git push

# Test on actual devices
# Desktop: https://your-app.vercel.app/user/games_home.html
# Mobile: Same URL on phone
```

## 📚 Documentation

- [VOICE_SELECTOR_MOBILE_FIX.md](VOICE_SELECTOR_MOBILE_FIX.md) - Mobile fixes
- [IOS_VOICE_FIX.md](IOS_VOICE_FIX.md) - iOS-specific fixes
- [voice-test.html](public/games/voice-test.html) - Test page

---

**Status**: ✅ Production Ready  
**Last Updated**: February 2026  
**Platforms**: Windows, macOS, iOS, Android
