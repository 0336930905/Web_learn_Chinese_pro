// ========================================
// VOICE QUICK FIX SCRIPT
// ========================================
// Copy & paste script nÃ y vÃ o Console (F12) Ä‘á»ƒ fix voice loading
// hoáº·c load tá»« file: <script src="/games/voice-quick-fix.js"></script>

(function() {
    console.log('%cðŸ”§ VOICE QUICK FIX SCRIPT', 'background: #667eea; color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
    console.log('Äang kháº¯c phá»¥c váº¥n Ä‘á» load giá»ng...\n');
    
    let attemptCount = 0;
    const maxAttempts = 20;
    
    function forceLoadVoices() {
        attemptCount++;
        
        // Method 1: getVoices()
        const voices = window.speechSynthesis.getVoices();
        console.log(`Láº§n thá»­ ${attemptCount}: TÃ¬m tháº¥y ${voices.length} giá»ng`);
        
        if (voices.length > 0) {
            const chineseVoices = voices.filter(v => v.lang.startsWith('zh'));
            
            console.log('%câœ… THÃ€NH CÃ”NG!', 'background: #4caf50; color: white; font-size: 16px; padding: 5px;');
            console.log(`\nTá»•ng sá»‘ giá»ng: ${voices.length}`);
            console.log(`Giá»ng tiáº¿ng Trung: ${chineseVoices.length}`);
            
            if (chineseVoices.length > 0) {
                console.log('\nðŸ‡¹ðŸ‡¼ðŸ‡¨ðŸ‡³ðŸ‡­ðŸ‡° Danh sÃ¡ch giá»ng tiáº¿ng Trung:');
                chineseVoices.forEach((v, i) => {
                    console.log(`  ${i+1}. ${v.name} (${v.lang}) ${v.default ? 'â­' : ''}`);
                });
                
                // Auto-select first Taiwan voice
                const taiwanVoice = chineseVoices.find(v => v.lang.startsWith('zh-TW'));
                if (taiwanVoice) {
                    localStorage.setItem('selectedVoiceName', taiwanVoice.name);
                    localStorage.setItem('selectedVoice', taiwanVoice.lang);
                    console.log(`\nâœ… ÄÃ£ tá»± Ä‘á»™ng chá»n: ${taiwanVoice.name}`);
                    
                    // Test voice
                    console.log('ðŸ”Š Testing voice...');
                    const utterance = new SpeechSynthesisUtterance('ä½ å¥½ï¼Œæ­¡è¿Žå­¸ç¿’ä¸­æ–‡ï¼');
                    utterance.voice = taiwanVoice;
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                }
                
                console.log('\nðŸ’¡ HÃ£y refresh trang (F5) Ä‘á»ƒ Ã¡p dá»¥ng!');
                
            } else {
                console.log('%câš ï¸ KHÃ”NG TÃŒM THáº¤Y GIá»ŒNG TIáº¾NG TRUNG', 'background: #ff9800; color: white; font-size: 14px; padding: 5px;');
                console.log('\nðŸ’¡ CÃ¡ch cÃ i Ä‘áº·t:');
                console.log('Windows: Settings > Time & Language > Language > Add Chinese');
                console.log('macOS: System Preferences > Accessibility > Spoken Content > Manage Voices');
            }
            
            return true;
        }
        
        if (attemptCount < maxAttempts) {
            // Method 2: Trigger vá»›i dummy utterance
            if (attemptCount === 5) {
                console.log('ðŸ”„ Thá»­ phÆ°Æ¡ng phÃ¡p khÃ¡c...');
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
            console.log('%câŒ THáº¤T Báº I!', 'background: #f44336; color: white; font-size: 16px; padding: 5px;');
            console.log(`\nÄÃ£ thá»­ ${maxAttempts} láº§n nhÆ°ng khÃ´ng load Ä‘Æ°á»£c giá»ng.`);
            console.log('\nðŸ’¡ HÃ£y thá»­:');
            console.log('1. Refresh trang (F5) vÃ  Ä‘á»£i 3-5 giÃ¢y');
            console.log('2. Thá»­ browser khÃ¡c (Chrome/Edge)');
            console.log('3. Má»Ÿ voice diagnostic tool: /games/voice-diagnostic.html');
            console.log('4. Check browser console cÃ³ lá»—i khÃ´ng');
            return false;
        }
    }
    
    // Kick start
    console.log('ðŸš€ Äang kick-start voice loading...\n');
    
    // Force trigger
    window.speechSynthesis.getVoices();
    
    // Listen for event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = function() {
            console.log('ðŸ”„ voiceschanged event triggered!');
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
                const utterance = new SpeechSynthesisUtterance('ä½ å¥½ï¼Œæ­¡è¿Žå­¸ç¿’ä¸­æ–‡ï¼');
                utterance.voice = voice;
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
                console.log('ðŸ”Š Testing:', voice.name);
            } else {
                console.log('âŒ Voice not found:', voiceName);
            }
        },
        clear: function() {
            localStorage.removeItem('selectedVoiceName');
            localStorage.removeItem('selectedVoice');
            console.log('ðŸ—‘ï¸ Cleared voice settings');
        }
    };
    
    console.log('\nðŸ“ Available commands:');
    console.log('  voiceQuickFix.reload()  - Reload voices');
    console.log('  voiceQuickFix.list()    - List all voices');
    console.log('  voiceQuickFix.test("voice name") - Test a voice');
    console.log('  voiceQuickFix.clear()   - Clear settings');
    
})();
