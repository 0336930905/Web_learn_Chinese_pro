// games-header.js
// DÃ¹ng chung cho táº¥t cáº£ game

// ========== Initialize Styles ==========
(function initializeStyles() {
  if (!document.getElementById('game-header-animations')) {
    const style = document.createElement('style');
    style.id = 'game-header-animations';
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 1px 2px 0 rgba(13, 127, 242, 0.3);
        }
        50% {
          opacity: 0.9;
          transform: scale(1.08);
          box-shadow: 0 4px 8px 0 rgba(13, 127, 242, 0.5);
        }
      }
      
      @keyframes scoreBounceDark {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.3);
        }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
      }
      
      @media (min-width: 640px) {
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }
      }
      
      .game-header-score {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .segment-bar-transition {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
    `;
    document.head.appendChild(style);
  }
})();

/**
 * Cáº­p nháº­t progress label (vÃ­ dá»¥: Level 1, Question 3)
 */
function setGameHeaderProgressLabel(label) {
  const el = document.querySelector('.game-header-progress-label');
  if (el) el.textContent = label;
}

/**
 * Cáº­p nháº­t progress value (vÃ­ dá»¥: 3/10)
 */
function setGameHeaderProgressValue(value) {
  const el = document.querySelector('.game-header-progress-value');
  if (el) el.textContent = value;
}

/**
 * Cáº­p nháº­t Ä‘iá»ƒm sá»‘
 */
function setGameHeaderScore(score) {
  const el = document.querySelector('.game-header-score');
  if (el) el.textContent = score;
}

/**
 * Cáº­p nháº­t segmented progress bars vá»›i animation
 * @param {number} current - CÃ¢u há»i/má»¥c hiá»‡n táº¡i (1-based)
 * @param {number} total - Tá»•ng sá»‘ cÃ¢u há»i/má»¥c
 */
function updateSegmentedProgressBars(current, total) {
  const progressBarsContainer = document.querySelector('header .flex.gap-1\\.5.h-3.w-full');
  if (!progressBarsContainer) return;
  
  const segmentedBars = progressBarsContainer.querySelectorAll('div');
  if (segmentedBars.length === 0) return;
  
  const percent = Math.round((current / total) * 100);
  const totalSegments = segmentedBars.length;
  const progressPerSegment = 100 / totalSegments;
  
  segmentedBars.forEach((bar, index) => {
    const segmentStart = index * progressPerSegment;
    const segmentEnd = (index + 1) * progressPerSegment;
    
    // Remove all classes first
    bar.classList.remove('bg-primary', 'shadow-sm', 'shadow-primary/30', 'bg-slate-200', 'dark:bg-[#2a3847]');
    bar.style.width = '';
    bar.classList.add('segment-bar-transition');
    
    if (percent >= segmentEnd) {
      // Fully filled segment
      bar.classList.add('bg-primary', 'shadow-sm', 'shadow-primary/30');
      bar.style.transform = 'scale(1)';
      bar.style.animation = '';
      bar.style.opacity = '1';
    } else if (percent > segmentStart && percent < segmentEnd) {
      // Current segment (partially filled) - add pulsing animation
      bar.classList.add('bg-primary', 'shadow-sm', 'shadow-primary/30');
      bar.style.transform = 'scale(1)';
      bar.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
      bar.style.opacity = '1';
    } else {
      // Empty segment
      bar.classList.add('bg-slate-200', 'dark:bg-[#2a3847]');
      bar.style.transition = 'all 0.3s ease';
      bar.style.animation = '';
      bar.style.opacity = '0.6';
    }
  });
}

/**
 * Animate score update with bounce effect
 * @param {number} newScore - Äiá»ƒm sá»‘ má»›i
 */
function animateScoreUpdate(newScore) {
  const scoreEl = document.querySelector('.game-header-score');
  if (!scoreEl) return;
  
  // Update score
  scoreEl.textContent = newScore;
  
  // Add bounce animation
  scoreEl.style.transform = 'scale(1.3)';
  setTimeout(() => {
    scoreEl.style.transform = 'scale(1)';
  }, 300);
}

/**
 * HÃ€M Tá»”NG Há»¢P: Cáº­p nháº­t toÃ n bá»™ progress header
 * @param {Object} options - Cáº¥u hÃ¬nh
 * @param {number} options.current - Vá»‹ trÃ­ hiá»‡n táº¡i (1-based)
 * @param {number} options.total - Tá»•ng sá»‘ items
 * @param {number} options.score - Äiá»ƒm sá»‘ hiá»‡n táº¡i (optional)
 * @param {string} options.label - Label tÃ¹y chá»‰nh (optional, máº·c Ä‘á»‹nh "Question")
 * @param {boolean} options.animateScore - CÃ³ animate score khÃ´ng (optional, máº·c Ä‘á»‹nh true)
 */
function updateGameHeaderProgress(options) {
  const {
    current,
    total,
    score,
    label = 'Question',
    animateScore = true
  } = options;
  
  // Validate inputs
  if (!current || !total) {
    console.warn('updateGameHeaderProgress: current vÃ  total lÃ  báº¯t buá»™c');
    return;
  }
  
  // Update progress label
  setGameHeaderProgressLabel(`${label} ${current}`);
  
  // Update progress value
  setGameHeaderProgressValue(`${current}/${total}`);
  
  // Update segmented progress bars
  updateSegmentedProgressBars(current, total);
  
  // Update score if provided
  if (typeof score === 'number') {
    if (animateScore) {
      animateScoreUpdate(score);
    } else {
      setGameHeaderScore(score);
    }
  }
}

/**
 * Text-to-Speech: Äá»c vÄƒn báº£n vá»›i giá»ng Ä‘Ã£ chá»n (GLOBAL audio setting)
 * @param {string} text - VÄƒn báº£n cáº§n Ä‘á»c (traditional Chinese)
 * @param {number} rate - Tá»‘c Ä‘á»™ Ä‘á»c (0.1-10, máº·c Ä‘á»‹nh 0.9)
 * @param {function} onEndCallback - Callback khi káº¿t thÃºc Ä‘á»c
 */
function speakText(text, rate = 0.9, onEndCallback = null) {
  if (!text) {
    if (onEndCallback) onEndCallback();
    return;
  }
  
  // Check if audio is enabled
  const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
  if (!audioEnabled) {
    console.log('ðŸ”‡ Audio is disabled');
    if (onEndCallback) onEndCallback();
    return;
  }
  
  // Cancel any ongoing speech
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.warn('âš ï¸ Error canceling speech:', e.message);
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get saved voice preference (GLOBAL setting)
  const savedVoiceName = localStorage.getItem('selectedVoiceName');
  const savedLang = localStorage.getItem('selectedVoice') || 'zh-TW';
  
  // Set voice properties
  utterance.lang = savedLang;
  utterance.rate = rate; // Speed (0.1 to 10)
  utterance.pitch = 1.0; // Pitch (0 to 2)
  utterance.volume = 1.0; // Volume (0 to 1)
  
  // Try to find and use the specific saved voice
  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = null;
  
  // Ensure voices are loaded (force reload if empty)
  if (voices.length === 0) {
    console.warn('âš ï¸ Voices not loaded yet, using default voice for lang:', savedLang);
    utterance.lang = savedLang;
  } else {
    console.log(`ðŸ” Looking for voice: "${savedVoiceName}" in ${voices.length} available voices`);
    
    // First try: Match by exact voice name (most accurate)
    if (savedVoiceName && savedVoiceName !== 'zh-TW' && savedVoiceName !== 'zh-CN' && savedVoiceName !== 'zh-HK' && savedVoiceName !== 'default') {
      selectedVoice = voices.find(voice => voice.name === savedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang; // Use voice's language
        console.log(`âœ… Using saved voice: "${selectedVoice.name}" [${selectedVoice.lang}] ${selectedVoice.localService ? '(Local)' : '(Remote)'}`);
      } else {
        console.warn(`âš ï¸ Saved voice "${savedVoiceName}" not found`);
      }
    }
    
    // Second try: Match by language code (fallback)
    if (!selectedVoice) {
      console.log(`ðŸ” Searching for voice with language: ${savedLang}`);
      
      // Try exact language match first
      selectedVoice = voices.find(voice => voice.lang === savedLang);
      
      // Then try prefix match (e.g., zh-TW matches zh-TW-x-something)
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang && voice.lang.startsWith(savedLang.substring(0, 5))
        );
      }
      
      // Finally, try any Chinese voice (prefer local/iOS voices)
      if (!selectedVoice) {
        // Prefer local voices on mobile
        if (voiceSelectorState.isMobile) {
          selectedVoice = voices.find(voice => 
            voice.lang && voice.lang.startsWith('zh') && voice.localService
          );
        }
        // Any Chinese voice as last resort
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang && voice.lang.startsWith('zh')
          );
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        console.log(`âœ… Using fallback voice: "${selectedVoice.name}" [${selectedVoice.lang}] ${selectedVoice.localService ? '(Local)' : '(Remote)'}`);
      } else {
        console.warn(`âš ï¸ No Chinese voice found, using browser default for: ${savedLang}`);
      }
    }
  }
  
  // Error handling
  utterance.onerror = (event) => {
    // Only log non-trivial errors
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      console.warn('âŒ Speech synthesis error:', event.error);
    }
    if (onEndCallback) onEndCallback();
  };

  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  
  // Mobile-specific: Add safety timeout (some mobile browsers don't fire onend)
  let timeoutId = null;
  if (voiceSelectorState.isMobile) {
    // Estimate speech duration (rough calculation: ~150ms per character for Chinese)
    const estimatedDuration = Math.max(text.length * 150 / rate, 1000);
    timeoutId = setTimeout(() => {
      console.log('â° Speech timeout triggered (safety for mobile)');
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      if (onEndCallback) onEndCallback();
    }, estimatedDuration + 2000); // Add 2s buffer
    
    utterance.onend = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (onEndCallback) onEndCallback();
    };
  }
  
  // Ensure text is not empty before speaking
  if (text && text.trim().length > 0) {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('âŒ Error speaking text:', e.message);
      if (timeoutId) clearTimeout(timeoutId);
      if (onEndCallback) onEndCallback();
    }
  } else {
    if (timeoutId) clearTimeout(timeoutId);
    if (onEndCallback) onEndCallback();
  }
}

/**
 * Dá»«ng phÃ¡t Ã¢m
 */
function stopSpeaking() {
  window.speechSynthesis.cancel();
}

/**
 * Láº¥y giá»ng Ä‘á»c hiá»‡n táº¡i (voice name vÃ  language)
 */
function getCurrentVoice() {
  return {
    name: localStorage.getItem('selectedVoiceName') || null,
    lang: localStorage.getItem('selectedVoice') || 'zh-TW'
  };
}

/**
 * Get all available Chinese voices for external use
 */
function getAvailableChineseVoices() {
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith('zh'));
}

/**
 * Check if audio is enabled (GLOBAL setting)
 */
function isAudioEnabled() {
  return localStorage.getItem('audioEnabled') !== 'false';
}

/**
 * Toggle audio on/off (GLOBAL setting)
 */
function toggleAudio(enable) {
  const newState = enable !== undefined ? enable : !isAudioEnabled();
  localStorage.setItem('audioEnabled', newState ? 'true' : 'false');
  
  // Stop any playing audio if disabled
  if (!newState) {
    window.speechSynthesis.cancel();
  }
  
  // Broadcast change event
  window.dispatchEvent(new CustomEvent('audioEnabledChanged', {
    detail: { enabled: newState }
  }));
  
  console.log('ðŸ”Š [GLOBAL AUDIO SETTING] Audio', newState ? 'ENABLED' : 'DISABLED');
  return newState;
}

/**
 * Get full audio settings (GLOBAL)
 */
function getAudioSettings() {
  return {
    enabled: isAudioEnabled(),
    voice: getCurrentVoice(),
    availableVoices: getAvailableChineseVoices().length
  };
}

/**
 * ========== VOICE LIBRARY UTILITIES ==========
 * Utility functions Ä‘á»ƒ láº¥y vÃ  quáº£n lÃ½ thÆ° viá»‡n giá»ng nÃ³i
 */

/**
 * Láº¥y táº¥t cáº£ voices cÃ³ sáºµn vá»›i retry mechanism
 * @param {number} maxRetries - Sá»‘ láº§n retry tá»‘i Ä‘a (máº·c Ä‘á»‹nh 20)
 * @param {number} retryDelay - Thá»i gian chá» giá»¯a cÃ¡c retry (ms, máº·c Ä‘á»‹nh 100)
 * @returns {Promise<SpeechSynthesisVoice[]>} - Promise chá»©a danh sÃ¡ch voices
 */
function getVoicesWithRetry(maxRetries = 20, retryDelay = 100) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    function attemptGetVoices() {
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        console.log(`âœ… Loaded ${voices.length} voices after ${attempts + 1} attempt(s)`);
        resolve(voices);
      } else if (attempts < maxRetries) {
        attempts++;
        console.log(`â³ Retry ${attempts}/${maxRetries}...`);
        setTimeout(attemptGetVoices, retryDelay);
      } else {
        console.warn('âš ï¸ No voices found after max retries');
        resolve([]);
      }
    }
    
    // Kick-start voice loading
    for (let i = 0; i < 5; i++) {
      window.speechSynthesis.getVoices();
    }
    
    attemptGetVoices();
  });
}

/**
 * Láº¥y Chinese voices vá»›i filtering vÃ  grouping
 * @param {Object} options - Cáº¥u hÃ¬nh filter
 * @param {string[]} options.languages - Danh sÃ¡ch language codes cáº§n filter ['zh-TW', 'zh-CN', 'zh-HK']
 * @param {boolean} options.groupByLanguage - Group theo language (máº·c Ä‘á»‹nh false)
 * @param {number} options.limit - Giá»›i háº¡n sá»‘ voices tráº£ vá» (máº·c Ä‘á»‹nh khÃ´ng giá»›i háº¡n)
 * @returns {Promise<Object>} - Promise chá»©a thÃ´ng tin voices
 */
async function getChineseVoices(options = {}) {
  const {
    languages = ['zh-TW', 'zh-CN', 'zh-HK'],
    groupByLanguage = false,
    limit = null
  } = options;
  
  const allVoices = await getVoicesWithRetry();
  
  // Filter Chinese voices
  const chineseVoices = allVoices.filter(voice => {
    return languages.some(lang => voice.lang.startsWith(lang));
  });
  
  console.log(`ðŸ” Found ${chineseVoices.length} Chinese voices from ${allVoices.length} total voices`);
  
  if (groupByLanguage) {
    // Group voices by language code
    const grouped = {};
    chineseVoices.forEach(voice => {
      const langCode = voice.lang.substring(0, 5); // 'zh-TW', 'zh-CN', etc.
      if (!grouped[langCode]) {
        grouped[langCode] = [];
      }
      grouped[langCode].push({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default,
        voiceURI: voice.voiceURI
      });
    });
    
    return {
      total: chineseVoices.length,
      grouped: grouped,
      raw: chineseVoices
    };
  } else {
    // Return flat list
    const voicesList = chineseVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
      voiceURI: voice.voiceURI
    }));
    
    // Apply limit if specified
    const finalList = limit ? voicesList.slice(0, limit) : voicesList;
    
    return {
      total: chineseVoices.length,
      voices: finalList,
      raw: chineseVoices
    };
  }
}

/**
 * Log thÃ´ng tin chi tiáº¿t vá» táº¥t cáº£ voices trong console
 * @param {boolean} chineseOnly - Chá»‰ hiá»ƒn thá»‹ Chinese voices (máº·c Ä‘á»‹nh false)
 */
async function logVoiceLibrary(chineseOnly = false) {
  const allVoices = await getVoicesWithRetry();
  
  console.log('========================================');
  console.log('ðŸ“š VOICE LIBRARY INFORMATION');
  console.log('========================================');
  console.log(`Total voices available: ${allVoices.length}`);
  console.log('----------------------------------------');
  
  const voicesToShow = chineseOnly 
    ? allVoices.filter(v => v.lang.startsWith('zh'))
    : allVoices;
  
  voicesToShow.forEach((voice, index) => {
    console.log(`${index + 1}. ${voice.name}`);
    console.log(`   Language: ${voice.lang}`);
    console.log(`   Local: ${voice.localService}, Default: ${voice.default}`);
    console.log(`   URI: ${voice.voiceURI}`);
    console.log('   ---');
  });
  
  console.log('========================================');
  
  return voicesToShow;
}

/**
 * TÃ¬m voice tá»‘t nháº¥t dá»±a trÃªn keywords
 * @param {string[]} keywords - Danh sÃ¡ch keywords Ä‘á»ƒ tÃ¬m kiáº¿m
 * @param {string} preferredLang - Language code Æ°u tiÃªn (máº·c Ä‘á»‹nh 'zh-TW')
 * @returns {Promise<Object|null>} - Voice object hoáº·c null
 */
async function findBestVoice(keywords = ['hanhan', 'yating', 'zhiwei'], preferredLang = 'zh-TW') {
  const allVoices = await getVoicesWithRetry();
  
  // First: Try to find by keywords
  for (const keyword of keywords) {
    const found = allVoices.find(voice => 
      voice.name.toLowerCase().includes(keyword.toLowerCase()) &&
      voice.lang.startsWith(preferredLang)
    );
    if (found) {
      console.log(`âœ… Found best voice by keyword "${keyword}":`, found.name);
      return {
        name: found.name,
        lang: found.lang,
        localService: found.localService,
        voiceURI: found.voiceURI
      };
    }
  }
  
  // Second: Find any voice with preferred language
  const langMatch = allVoices.find(voice => voice.lang.startsWith(preferredLang));
  if (langMatch) {
    console.log(`âœ… Found voice by language "${preferredLang}":`, langMatch.name);
    return {
      name: langMatch.name,
      lang: langMatch.lang,
      localService: langMatch.localService,
      voiceURI: langMatch.voiceURI
    };
  }
  
  console.warn('âš ï¸ No matching voice found');
  return null;
}

/**
 * Test giá»ng nÃ³i báº±ng cÃ¡ch Ä‘á»c má»™t Ä‘oáº¡n vÄƒn máº«u
 * @param {string} voiceName - TÃªn voice cáº§n test
 * @param {string} testText - VÄƒn báº£n test (máº·c Ä‘á»‹nh 'ä½ å¥½ï¼Œæ­¡è¿Žå­¸ç¿’ä¸­æ–‡ï¼')
 * @returns {Promise<boolean>} - Promise tráº£ vá» true náº¿u test thÃ nh cÃ´ng
 */
function testVoice(voiceName, testText = 'ä½ å¥½ï¼Œæ­¡è¿Žå­¸ç¿’ä¸­æ–‡ï¼') {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    
    getVoicesWithRetry().then(voices => {
      const voice = voices.find(v => v.name === voiceName);
      
      if (!voice) {
        console.error(`âŒ Voice "${voiceName}" not found`);
        resolve(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        console.log(`âœ… Voice test successful: ${voiceName}`);
        resolve(true);
      };
      
      utterance.onerror = (event) => {
        console.error(`âŒ Voice test failed: ${voiceName}`, event.error);
        resolve(false);
      };
      
      console.log(`ðŸ”Š Testing voice: ${voiceName}`);
      window.speechSynthesis.speak(utterance);
    });
  });
}

/**
 * ========== VOICE SELECTOR UI (GLOBAL) ==========
 * Initialize and manage voice selector dropdown in header
 */

// Detect mobile browser
function isMobileBrowser() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

// Detect iOS specifically
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Voice selector state
let voiceSelectorState = {
  voicesLoaded: false,
  retryCount: 0,
  maxRetries: isMobileBrowser() ? 100 : 60, // More retries for mobile
  pollTimer: null,
  isMobile: isMobileBrowser(),
  isIOS: isIOS()
};

// Voice matching patterns (priority order)
const VOICE_PATTERNS = [
  // iOS voices (Siri voices)
  { keywords: ['meijia'], label: 'Meijia ðŸ‡¹ðŸ‡¼ (F)', priority: 1, isIOS: true },
  { keywords: ['tingting'], label: 'Tingting ðŸ‡¨ðŸ‡³ (F)', priority: 2, isIOS: true },
  { keywords: ['shelley'], label: 'Shelley ðŸ‡¹ðŸ‡¼ (F)', priority: 3, isIOS: true },
  { keywords: ['sinji'], label: 'Sinji ðŸ‡­ðŸ‡° (F)', priority: 4, isIOS: true },
  { keywords: ['grandma'], label: 'Grandma ðŸ‡¹ðŸ‡¼ (F)', priority: 5, isIOS: true },
  { keywords: ['sandy'], label: 'Sandy ðŸ‡¨ðŸ‡³ (F)', priority: 6, isIOS: true },
  { keywords: ['flo'], label: 'Flo ðŸ‡­ðŸ‡° (F)', priority: 7, isIOS: true },
  { keywords: ['eddy'], label: 'Eddy ðŸ‡¨ðŸ‡³ (M)', priority: 8, isIOS: true },
  { keywords: ['grandpa'], label: 'Grandpa ðŸ‡¹ðŸ‡¼ (M)', priority: 9, isIOS: true },
  { keywords: ['reed'], label: 'Reed ðŸ‡­ðŸ‡° (M)', priority: 10, isIOS: true },
  { keywords: ['rocko'], label: 'Rocko ðŸ‡¨ðŸ‡³ (M)', priority: 11, isIOS: true },
  
  // Windows/Desktop voices
  { keywords: ['hanhan'], label: 'HanHan (F)', priority: 12 },
  { keywords: ['yating'], label: 'Yating (F)', priority: 13 },
  { keywords: ['zhiwei', 'online', 'natural'], label: 'Zhiwei (M)', priority: 14 },
  { keywords: ['huihui'], label: 'Huihui (F)', priority: 15 },
  
  // Google voices
  { keywords: ['google', 'åœ‹èªž', 'è‡ºç£', 'taiwan'], label: 'Google TW', priority: 16 },
  { keywords: ['æ™®é€šè¯', 'ä¸­å›½å¤§é™†', 'china'], label: 'Google CN', priority: 17 },
  { keywords: ['ç²¤èªž', 'é¦™æ¸¯', 'hong kong', 'cantonese'], label: 'Google HK', priority: 18 }
];

console.log(`ðŸ“± Device detected: ${voiceSelectorState.isMobile ? 'Mobile' : 'Desktop'} ${voiceSelectorState.isIOS ? '(iOS)' : ''}`);

/**
 * Initialize voice selector when DOM is ready
 */
function initializeVoiceSelector() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) {
    console.warn('âš ï¸ Voice selector not found in DOM');
    return;
  }
  
  console.log('ðŸŽ¤ Initializing voice selector...');
  console.log(`ðŸ“± Mobile: ${voiceSelectorState.isMobile}, iOS: ${voiceSelectorState.isIOS}`);
  
  // Setup change listener first
  voiceSelect.addEventListener('change', onVoiceSelectionChanged);
  
  // Create initial fallback options immediately (they will be replaced if voices load)
  createVoiceSelectorFallback();
  
  // Kick-start voice loading (more aggressive for mobile)
  const kickstartAttempts = voiceSelectorState.isMobile ? 10 : 5;
  for (let i = 0; i < kickstartAttempts; i++) {
    window.speechSynthesis.getVoices();
  }
  
  // Dummy utterance to trigger voice loading (critical for iOS)
  try {
    const utterance = new SpeechSynthesisUtterance(' ');
    utterance.volume = 0;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'zh-TW';
    window.speechSynthesis.speak(utterance);
    setTimeout(() => window.speechSynthesis.cancel(), 50);
    console.log('âœ… Dummy utterance triggered');
  } catch (e) {
    console.warn('âš ï¸ Dummy utterance failed:', e.message);
  }
  
  // Listen for voiceschanged event
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function() {
      console.log('ðŸ”” voiceschanged event fired');
      if (!voiceSelectorState.voicesLoaded) {
        // Reset retry count and try to populate
        voiceSelectorState.retryCount = 0;
        populateVoiceSelector();
      }
    };
  }
  
  // Start populating voices with different timing for mobile
  if (voiceSelectorState.isMobile) {
    // Mobile: more frequent checks, longer timeout
    setTimeout(populateVoiceSelector, 200);
    setTimeout(() => { if (!voiceSelectorState.voicesLoaded) populateVoiceSelector(); }, 500);
    setTimeout(() => { if (!voiceSelectorState.voicesLoaded) populateVoiceSelector(); }, 1000);
    setTimeout(() => { if (!voiceSelectorState.voicesLoaded) populateVoiceSelector(); }, 2000);
  } else {
    // Desktop: normal timing
    setTimeout(populateVoiceSelector, 100);
    setTimeout(() => { if (!voiceSelectorState.voicesLoaded) populateVoiceSelector(); }, 500);
    setTimeout(() => { if (!voiceSelectorState.voicesLoaded) populateVoiceSelector(); }, 1000);
  }
  
  // User gesture triggers (critical for iOS and many mobile browsers)
  const gestureEvents = ['touchstart', 'pointerdown', 'click'];
  const handleFirstGesture = function() {
    if (!voiceSelectorState.voicesLoaded) {
      console.log('ðŸ‘† User gesture detected, loading voices...');
      voiceSelectorState.retryCount = 0;
      populateVoiceSelector();
    }
    gestureEvents.forEach(evt => {
      window.removeEventListener(evt, handleFirstGesture);
    });
  };
  
  gestureEvents.forEach(evt => {
    window.addEventListener(evt, handleFirstGesture, { passive: true, once: true });
  });
  
  // Page visibility change (helps with iOS backgrounding)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && !voiceSelectorState.voicesLoaded) {
      console.log('ðŸ‘ï¸ Page visible, retrying voice load...');
      voiceSelectorState.retryCount = 0;
      setTimeout(populateVoiceSelector, 100);
    }
  });
}

/**
 * Populate voice selector dropdown
 */
function populateVoiceSelector() {
  if (voiceSelectorState.voicesLoaded) {
    console.log('âœ… Voices already loaded, skipping...');
    return;
  }
  
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;
  
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    voiceSelectorState.retryCount++;
    if (voiceSelectorState.retryCount < voiceSelectorState.maxRetries) {
      console.log(`â³ Retry ${voiceSelectorState.retryCount}/${voiceSelectorState.maxRetries}...`);
      const retryDelay = voiceSelectorState.isMobile ? 150 : 100;
      setTimeout(populateVoiceSelector, retryDelay);
      return;
    } else {
      console.warn('âš ï¸ No voices after max retries, keeping fallback');
      // Keep fallback options, don't reset
      return;
    }
  }
  
  console.log(`ðŸ” Found ${voices.length} total voices`);
  
  // Filter Chinese voices (any Chinese dialect)
  let chineseVoices = voices.filter(v => v.lang && v.lang.startsWith('zh'));
  
  if (chineseVoices.length === 0) {
    console.warn('âš ï¸ No Chinese voices found, keeping fallback');
    // Keep fallback options if no Chinese voices
    return;
  }
  
  voiceSelectorState.voicesLoaded = true;
  voiceSelectorState.retryCount = 0;
  console.log(`âœ… Found ${chineseVoices.length} Chinese voices`);
  
  // Log all voices for debugging (especially useful for mobile)
  if (voiceSelectorState.isMobile) {
    console.log('ðŸ“ Voice details:');
    chineseVoices.forEach((v, i) => {
      console.log(`  ${i + 1}. "${v.name}" [${v.lang}] ${v.localService ? 'Local' : 'Remote'}`);
    });
  }
  
  // Clear and rebuild dropdown
  voiceSelect.innerHTML = '';
  
  // Match and organize voices
  const matchedVoices = [];
  const addedNames = new Set();
  
  chineseVoices.forEach(voice => {
    if (addedNames.has(voice.name)) return;
    
    const nameLower = voice.name.toLowerCase();
    let matched = null;
    
    // Try to match with patterns
    for (const pattern of VOICE_PATTERNS) {
      const matchCount = pattern.keywords.filter(keyword => 
        nameLower.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        matched = pattern;
        console.log(`âœ“ Matched voice "${voice.name}" with pattern "${pattern.label}"`);
        break;
      }
    }
    
    if (matched) {
      matchedVoices.push({ voice, config: matched });
    } else {
      // Add unmatched voices with cleaned-up label
      let displayLabel = voice.name
        .replace(/^Microsoft\s*/i, '')
        .replace(/^Google\s*/i, '')
        .replace(/^Apple\s*/i, '')
        .replace(/\s*Online$/i, '')
        .replace(/\s*Desktop$/i, '')
        .replace(/\s*Natural$/i, '')
        .replace(/\s*\(Enhanced\)$/i, '')
        .trim();
      
      // Don't truncate iOS/Apple voices (they have short names)
      const isAppleVoice = voice.name.includes('(Siri)') || voice.localService;
      if (!isAppleVoice && displayLabel.length > 25) {
        displayLabel = displayLabel.substring(0, 22) + '...';
      }
      
      // Add region indicator
      let regionLabel = '';
      if (voice.lang.startsWith('zh-CN')) regionLabel = ' ðŸ‡¨ðŸ‡³';
      else if (voice.lang.startsWith('zh-HK')) regionLabel = ' ðŸ‡­ðŸ‡°';
      else if (voice.lang.startsWith('zh-TW')) regionLabel = ' ðŸ‡¹ðŸ‡¼';
      
      matchedVoices.push({ 
        voice, 
        config: { label: displayLabel + regionLabel, priority: 99 } 
      });
      
      console.log(`â„¹ï¸ Unmatched voice "${voice.name}" â†’ "${displayLabel}${regionLabel}"`);
    }
    
    addedNames.add(voice.name);
  });
  
  // Sort by priority
  matchedVoices.sort((a, b) => (a.config.priority || 99) - (b.config.priority || 99));
  
  // Limit voices (fewer on mobile to reduce clutter)
  const maxVoices = voiceSelectorState.isMobile ? 12 : 15;
  const limitedVoices = matchedVoices.slice(0, maxVoices);
  
  // Group voices by platform and region
  const iosVoices = limitedVoices.filter(v => v.voice.localService || v.config.isIOS);
  const googleVoices = limitedVoices.filter(v => !v.voice.localService && !v.config.isIOS && v.voice.name.includes('Google'));
  const microsoftVoices = limitedVoices.filter(v => !v.voice.localService && !v.config.isIOS && v.voice.name.includes('Microsoft'));
  const otherVoices = limitedVoices.filter(v => 
    !iosVoices.includes(v) && !googleVoices.includes(v) && !microsoftVoices.includes(v)
  );
  
  // Add iOS/Apple voices group (priority for mobile)
  if (iosVoices.length > 0) {
    const iosGroup = document.createElement('optgroup');
    iosGroup.label = `ðŸŽ iOS/Apple (${iosVoices.length})`;
    iosVoices.forEach(item => {
      const option = document.createElement('option');
      option.value = item.voice.name;
      option.textContent = item.config.label;
      option.setAttribute('data-lang', item.voice.lang);
      option.setAttribute('data-platform', 'ios');
      iosGroup.appendChild(option);
    });
    voiceSelect.appendChild(iosGroup);
    console.log(`âœ… Added ${iosVoices.length} iOS voices`);
  }
  
  // Add Google voices group
  if (googleVoices.length > 0) {
    const googleGroup = document.createElement('optgroup');
    googleGroup.label = `ðŸŒ Google (${googleVoices.length})`;
    googleVoices.forEach(item => {
      const option = document.createElement('option');
      option.value = item.voice.name;
      option.textContent = item.config.label;
      option.setAttribute('data-lang', item.voice.lang);
      option.setAttribute('data-platform', 'google');
      googleGroup.appendChild(option);
    });
    voiceSelect.appendChild(googleGroup);
    console.log(`âœ… Added ${googleVoices.length} Google voices`);
  }
  
  // Add Microsoft voices group
  if (microsoftVoices.length > 0) {
    const msGroup = document.createElement('optgroup');
    msGroup.label = `ðŸªŸ Microsoft (${microsoftVoices.length})`;
    microsoftVoices.forEach(item => {
      const option = document.createElement('option');
      option.value = item.voice.name;
      option.textContent = item.config.label;
      option.setAttribute('data-lang', item.voice.lang);
      option.setAttribute('data-platform', 'microsoft');
      msGroup.appendChild(option);
    });
    voiceSelect.appendChild(msGroup);
    console.log(`âœ… Added ${microsoftVoices.length} Microsoft voices`);
  }
  
  // Add other voices if any
  if (otherVoices.length > 0) {
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = `ðŸ”§ Other (${otherVoices.length})`;
    otherVoices.forEach(item => {
      const option = document.createElement('option');
      option.value = item.voice.name;
      option.textContent = item.config.label;
      option.setAttribute('data-lang', item.voice.lang);
      option.setAttribute('data-platform', 'other');
      otherGroup.appendChild(option);
    });
    voiceSelect.appendChild(otherGroup);
    console.log(`âœ… Added ${otherVoices.length} other voices`);
  }
  
  // Add default fallback
  const fallbackOpt = document.createElement('option');
  fallbackOpt.value = 'zh-TW';
  fallbackOpt.textContent = 'ðŸŒ Default (zh-TW)';
  fallbackOpt.setAttribute('data-lang', 'zh-TW');
  voiceSelect.appendChild(fallbackOpt);
  
  console.log(`âœ… Voice selector populated with ${voiceSelect.options.length} options`);
  
  // Load saved selection
  loadSavedVoiceSelection();
  
  // Dispatch ready event
  window.dispatchEvent(new CustomEvent('voicesReady', {
    detail: { count: chineseVoices.length, mobile: voiceSelectorState.isMobile }
  }));
}

/**
 * Create fallback options when no voices available
 */
function createVoiceSelectorFallback() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;
  
  // Check if already has valid options (don't overwrite if voices were loaded)
  if (voiceSelect.options.length > 1 && 
      voiceSelect.options[0].value !== '' && 
      !voiceSelect.options[0].disabled) {
    console.log('âœ… Dropdown already has valid options, skipping fallback');
    return;
  }
  
  console.warn('âš ï¸ Creating fallback options (voices not available)');
  voiceSelect.innerHTML = '';
  
  // Create comprehensive fallback options
  const fallbacks = [
    { value: 'zh-TW', label: 'ðŸ‡¹ðŸ‡¼ ç¹é«”ä¸­æ–‡ (Taiwan)', lang: 'zh-TW' },
    { value: 'zh-CN', label: 'ðŸ‡¨ðŸ‡³ ç®€ä½“ä¸­æ–‡ (China)', lang: 'zh-CN' },
    { value: 'zh-HK', label: 'ðŸ‡­ðŸ‡° å»£æ±è©± (Hong Kong)', lang: 'zh-HK' },
    { value: 'default', label: 'ðŸŒ System Default', lang: 'zh-TW' }
  ];
  
  fallbacks.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    option.setAttribute('data-lang', opt.lang);
    voiceSelect.appendChild(option);
  });
  
  voiceSelect.selectedIndex = 0;
  console.log(`âœ… Created ${fallbacks.length} fallback options`);
  
  // Try to load saved selection
  loadSavedVoiceSelection();
  
  // Mark as partially loaded (so we don't keep creating fallback)
  // but keep trying to load real voices in background
  if (!voiceSelectorState.voicesLoaded) {
    console.log('ðŸ”„ Fallback created, but will keep trying to load real voices...');
    
    // Continue trying to load voices at longer intervals
    setTimeout(() => {
      if (!voiceSelectorState.voicesLoaded) {
        voiceSelectorState.retryCount = 0;
        populateVoiceSelector();
      }
    }, 3000);
    
    setTimeout(() => {
      if (!voiceSelectorState.voicesLoaded) {
        voiceSelectorState.retryCount = 0;
        populateVoiceSelector();
      }
    }, 6000);
  }
}

/**
 * Load saved voice selection from localStorage
 */
function loadSavedVoiceSelection() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;
  
  const savedName = localStorage.getItem('selectedVoiceName');
  if (!savedName) {
    console.log('â„¹ï¸ No saved voice preference');
    return;
  }
  
  // Try to find and select saved voice
  const options = voiceSelect.options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === savedName) {
      voiceSelect.selectedIndex = i;
      console.log(`âœ… Restored saved voice: ${savedName}`);
      return;
    }
  }
  
  console.warn(`âš ï¸ Saved voice "${savedName}" not found in current options`);
}

/**
 * Handle voice selection change
 */
function onVoiceSelectionChanged() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;
  
  const selectedValue = voiceSelect.value;
  const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
  const selectedLang = selectedOption.getAttribute('data-lang') || 'zh-TW';
  
  // Save to localStorage (GLOBAL setting)
  localStorage.setItem('selectedVoiceName', selectedValue);
  localStorage.setItem('selectedVoice', selectedLang);
  
  console.log(`ðŸ”Š Voice changed: ${selectedValue} (${selectedLang})`);
  
  // Broadcast voice change event
  window.dispatchEvent(new CustomEvent('voiceChanged', {
    detail: { name: selectedValue, lang: selectedLang }
  }));
  
  // Sync to backend if API available
  if (window.SETTINGS_API && localStorage.getItem('token')) {
    window.SETTINGS_API.syncVoiceToBackend(selectedValue).catch(err => {
      console.warn('âš ï¸ Failed to sync voice to backend:', err);
    });
  }
}

/**
 * Test current selected voice
 */
function testCurrentVoice() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) {
    console.error('âŒ Voice selector not found');
    return;
  }
  
  const selectedValue = voiceSelect.value;
  if (!selectedValue) {
    if (typeof showError === 'function') {
        showError('Vui lÃ²ng chá»n giá»ng Ä‘á»c trÆ°á»›c!');
    } else {
        alert('Vui lÃ²ng chá»n giá»ng Ä‘á»c trÆ°á»›c!');
    }
    
    // Highlight select
    voiceSelect.classList.add('ring-2', 'ring-red-500', 'border-red-500');
    setTimeout(() => voiceSelect.classList.remove('ring-2', 'ring-red-500', 'border-red-500'), 2000);
    return;
  }
  
  console.log(`ðŸ”Š Testing voice: ${selectedValue}`);

  // Show playing toast (mobile-friendly)
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 bg-primary text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl z-50 animate-slide-in flex items-center gap-2 font-bold text-sm sm:text-base max-w-[90vw] sm:max-w-none';
  toast.innerHTML = '<span class="material-symbols-outlined text-lg sm:text-xl">volume_up</span> <span>Äang Ä‘á»c máº«u...</span>';
  toast.style.animation = 'slideIn 0.3s ease-out forwards';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
  
  // Use the global speakText function (respects audio enabled setting)
  speakText('ä½ å¥½ï¼Œæ­¡è¿Žå­¸ç¿’ä¸­æ–‡ï¼', 0.9, () => {
    console.log('âœ… Voice test complete');
  });
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('ðŸ“„ DOM ready, initializing header...');
  
  // Initialize back button
  const backBtn = document.querySelector('a[href*="games_home.html"]');
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '../user/games_home.html';
    });
    console.log('âœ… Back button initialized');
  }
  
  // Initialize voice selector
  initializeVoiceSelector();
});

// Äáº£m báº£o cÃ¡c hÃ m nÃ y global
window.setGameHeaderProgressLabel = setGameHeaderProgressLabel;
window.setGameHeaderProgressValue = setGameHeaderProgressValue;
window.setGameHeaderScore = setGameHeaderScore;
window.updateSegmentedProgressBars = updateSegmentedProgressBars;
window.animateScoreUpdate = animateScoreUpdate;
window.updateGameHeaderProgress = updateGameHeaderProgress;
window.speakText = speakText;
window.stopSpeaking = stopSpeaking;
window.getCurrentVoice = getCurrentVoice;
window.getAvailableChineseVoices = getAvailableChineseVoices;
window.isAudioEnabled = isAudioEnabled;
window.toggleAudio = toggleAudio;
window.getAudioSettings = getAudioSettings;

// Voice Library Utilities
window.getVoicesWithRetry = getVoicesWithRetry;
window.getChineseVoices = getChineseVoices;
window.logVoiceLibrary = logVoiceLibrary;
window.findBestVoice = findBestVoice;
window.testVoice = testVoice;

// Voice Selector Functions
window.testCurrentVoice = testCurrentVoice;
window.initializeVoiceSelector = initializeVoiceSelector;
window.populateVoiceSelector = populateVoiceSelector;
