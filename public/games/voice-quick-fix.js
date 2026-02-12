// ========================================
// VOICE QUICK FIX SCRIPT
// ========================================
// Copy & paste script này vào Console (F12) để fix voice loading
// hoặc load từ file: <script src="/games/voice-quick-fix.js"></script>

(function() {
    console.log('%c🔧 VOICE QUICK FIX SCRIPT', 'background: #667eea; color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
    console.log('Đang khắc phục vấn đề load giọng...\n');
    
    let attemptCount = 0;
    const maxAttempts = 20;
    
    function forceLoadVoices() {
        attemptCount++;
        
        // Method 1: getVoices()
        const voices = window.speechSynthesis.getVoices();
        console.log(`Lần thử ${attemptCount}: Tìm thấy ${voices.length} giọng`);
        
        if (voices.length > 0) {
            const chineseVoices = voices.filter(v => v.lang.startsWith('zh'));
            
            console.log('%c✅ THÀNH CÔNG!', 'background: #4caf50; color: white; font-size: 16px; padding: 5px;');
            console.log(`\nTổng số giọng: ${voices.length}`);
            console.log(`Giọng tiếng Trung: ${chineseVoices.length}`);
            
            if (chineseVoices.length > 0) {
                console.log('\n🇹🇼🇨🇳🇭🇰 Danh sách giọng tiếng Trung:');
                chineseVoices.forEach((v, i) => {
                    console.log(`  ${i+1}. ${v.name} (${v.lang}) ${v.default ? '⭐' : ''}`);
                });
                
                // Auto-select first Taiwan voice
                const taiwanVoice = chineseVoices.find(v => v.lang.startsWith('zh-TW'));
                if (taiwanVoice) {
                    localStorage.setItem('selectedVoiceName', taiwanVoice.name);
                    localStorage.setItem('selectedVoice', taiwanVoice.lang);
                    console.log(`\n✅ Đã tự động chọn: ${taiwanVoice.name}`);
                    
                    // Test voice
                    console.log('🔊 Testing voice...');
                    const utterance = new SpeechSynthesisUtterance('你好，歡迎學習中文！');
                    utterance.voice = taiwanVoice;
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                }
                
                console.log('\n💡 Hãy refresh trang (F5) để áp dụng!');
                
            } else {
                console.log('%c⚠️ KHÔNG TÌM THẤY GIỌNG TIẾNG TRUNG', 'background: #ff9800; color: white; font-size: 14px; padding: 5px;');
                console.log('\n💡 Cách cài đặt:');
                console.log('Windows: Settings > Time & Language > Language > Add Chinese');
                console.log('macOS: System Preferences > Accessibility > Spoken Content > Manage Voices');
            }
            
            return true;
        }
        
        if (attemptCount < maxAttempts) {
            // Method 2: Trigger với dummy utterance
            if (attemptCount === 5) {
                console.log('🔄 Thử phương pháp khác...');
                try {
                    const dummy = new SpeechSynthesisUtterance('');
                    window.speechSynthesis.speak(dummy);
                    window.speechSynthesis.cancel();
                } catch (e) {
                    console.log('Dummy utterance error:', e);
                }
            }
            
            setTimeout(forceLoadVoices, 100);
            return false;
        } else {
            console.log('%c❌ THẤT BẠI!', 'background: #f44336; color: white; font-size: 16px; padding: 5px;');
            console.log(`\nĐã thử ${maxAttempts} lần nhưng không load được giọng.`);
            console.log('\n💡 Hãy thử:');
            console.log('1. Refresh trang (F5) và đợi 3-5 giây');
            console.log('2. Thử browser khác (Chrome/Edge)');
            console.log('3. Mở voice diagnostic tool: /games/voice-diagnostic.html');
            console.log('4. Check browser console có lỗi không');
            return false;
        }
    }
    
    // Kick start
    console.log('🚀 Đang kick-start voice loading...\n');
    
    // Force trigger
    window.speechSynthesis.getVoices();
    
    // Listen for event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = function() {
            console.log('🔄 voiceschanged event triggered!');
            if (attemptCount < maxAttempts) {
                forceLoadVoices();
            }
        };
    }
    
    // Start loading with retry
    setTimeout(forceLoadVoices, 100);
    
    // Expose global commands
    window.voiceQuickFix = {
        reload: forceLoadVoices,
        list: function() {
            const voices = window.speechSynthesis.getVoices();
            console.table(voices.map(v => ({
                name: v.name,
                lang: v.lang,
                default: v.default,
                local: v.localService
            })));
        },
        test: function(voiceName) {
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.name === voiceName);
            if (voice) {
                const utterance = new SpeechSynthesisUtterance('你好，歡迎學習中文！');
                utterance.voice = voice;
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
                console.log('🔊 Testing:', voice.name);
            } else {
                console.log('❌ Voice not found:', voiceName);
            }
        },
        clear: function() {
            localStorage.removeItem('selectedVoiceName');
            localStorage.removeItem('selectedVoice');
            console.log('🗑️ Cleared voice settings');
        }
    };
    
    console.log('\n📝 Available commands:');
    console.log('  voiceQuickFix.reload()  - Reload voices');
    console.log('  voiceQuickFix.list()    - List all voices');
    console.log('  voiceQuickFix.test("voice name") - Test a voice');
    console.log('  voiceQuickFix.clear()   - Clear settings');
    
})();
