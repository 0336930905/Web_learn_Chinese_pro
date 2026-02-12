// games-header.js
// Dùng chung cho tất cả game

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
 * Cập nhật progress label (ví dụ: Level 1, Question 3)
 */
function setGameHeaderProgressLabel(label) {
  const el = document.querySelector('.game-header-progress-label');
  if (el) el.textContent = label;
}

/**
 * Cập nhật progress value (ví dụ: 3/10)
 */
function setGameHeaderProgressValue(value) {
  const el = document.querySelector('.game-header-progress-value');
  if (el) el.textContent = value;
}

/**
 * Cập nhật điểm số
 */
function setGameHeaderScore(score) {
  const el = document.querySelector('.game-header-score');
  if (el) el.textContent = score;
}

/**
 * Cập nhật segmented progress bars với animation
 * @param {number} current - Câu hỏi/mục hiện tại (1-based)
 * @param {number} total - Tổng số câu hỏi/mục
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
 * @param {number} newScore - Điểm số mới
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
 * HÀM TỔNG HỢP: Cập nhật toàn bộ progress header
 * @param {Object} options - Cấu hình
 * @param {number} options.current - Vị trí hiện tại (1-based)
 * @param {number} options.total - Tổng số items
 * @param {number} options.score - Điểm số hiện tại (optional)
 * @param {string} options.label - Label tùy chỉnh (optional, mặc định "Question")
 * @param {boolean} options.animateScore - Có animate score không (optional, mặc định true)
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
    console.warn('updateGameHeaderProgress: current và total là bắt buộc');
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
 * Text-to-Speech: Đọc văn bản với giọng đã chọn (GLOBAL audio setting)
 * @param {string} text - Văn bản cần đọc (traditional Chinese)
 * @param {number} rate - Tốc độ đọc (0.1-10, mặc định 0.9)
 * @param {function} onEndCallback - Callback khi kết thúc đọc
 */
function speakText(text, rate = 0.9, onEndCallback = null) {
  if (!text) {
    if (onEndCallback) onEndCallback();
    return;
  }
  
  // Check if audio is enabled
  const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
  if (!audioEnabled) {
    console.log('🔇 Audio is disabled');
    if (onEndCallback) onEndCallback();
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
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
    console.log('⚠️ Voices not loaded yet, using default voice');
    utterance.lang = savedLang;
  } else {
    // First try: Match by exact voice name (most accurate)
    if (savedVoiceName) {
      selectedVoice = voices.find(voice => voice.name === savedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🔊 Using saved voice:', selectedVoice.name, '(' + selectedVoice.lang + ')');
      }
    }
    
    // Second try: Match by language code (fallback)
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith(savedLang.substring(0, 5))
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🔊 Using fallback voice:', selectedVoice.name, '(' + selectedVoice.lang + ')');
      } else {
        console.log('🔊 Using browser default voice for:', savedLang);
      }
    }
  }
  
  // Error handling
  utterance.onerror = (event) => {
    // Only log non-trivial errors
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      console.warn('Speech synthesis error:', event.error);
    }
    if (onEndCallback) onEndCallback();
  };

  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  
  // Ensure text is not empty before speaking
  if (text && text.trim().length > 0) {
    window.speechSynthesis.speak(utterance);
  } else {
    if (onEndCallback) onEndCallback();
  }
}

/**
 * Dừng phát âm
 */
function stopSpeaking() {
  window.speechSynthesis.cancel();
}

/**
 * Lấy giọng đọc hiện tại (voice name và language)
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
  
  console.log('🔊 [GLOBAL AUDIO SETTING] Audio', newState ? 'ENABLED' : 'DISABLED');
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
 * Utility functions để lấy và quản lý thư viện giọng nói
 */

/**
 * Lấy tất cả voices có sẵn với retry mechanism
 * @param {number} maxRetries - Số lần retry tối đa (mặc định 20)
 * @param {number} retryDelay - Thời gian chờ giữa các retry (ms, mặc định 100)
 * @returns {Promise<SpeechSynthesisVoice[]>} - Promise chứa danh sách voices
 */
function getVoicesWithRetry(maxRetries = 20, retryDelay = 100) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    function attemptGetVoices() {
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        console.log(`✅ Loaded ${voices.length} voices after ${attempts + 1} attempt(s)`);
        resolve(voices);
      } else if (attempts < maxRetries) {
        attempts++;
        console.log(`⏳ Retry ${attempts}/${maxRetries}...`);
        setTimeout(attemptGetVoices, retryDelay);
      } else {
        console.warn('⚠️ No voices found after max retries');
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
 * Lấy Chinese voices với filtering và grouping
 * @param {Object} options - Cấu hình filter
 * @param {string[]} options.languages - Danh sách language codes cần filter ['zh-TW', 'zh-CN', 'zh-HK']
 * @param {boolean} options.groupByLanguage - Group theo language (mặc định false)
 * @param {number} options.limit - Giới hạn số voices trả về (mặc định không giới hạn)
 * @returns {Promise<Object>} - Promise chứa thông tin voices
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
  
  console.log(`🔍 Found ${chineseVoices.length} Chinese voices from ${allVoices.length} total voices`);
  
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
 * Log thông tin chi tiết về tất cả voices trong console
 * @param {boolean} chineseOnly - Chỉ hiển thị Chinese voices (mặc định false)
 */
async function logVoiceLibrary(chineseOnly = false) {
  const allVoices = await getVoicesWithRetry();
  
  console.log('========================================');
  console.log('📚 VOICE LIBRARY INFORMATION');
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
 * Tìm voice tốt nhất dựa trên keywords
 * @param {string[]} keywords - Danh sách keywords để tìm kiếm
 * @param {string} preferredLang - Language code ưu tiên (mặc định 'zh-TW')
 * @returns {Promise<Object|null>} - Voice object hoặc null
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
      console.log(`✅ Found best voice by keyword "${keyword}":`, found.name);
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
    console.log(`✅ Found voice by language "${preferredLang}":`, langMatch.name);
    return {
      name: langMatch.name,
      lang: langMatch.lang,
      localService: langMatch.localService,
      voiceURI: langMatch.voiceURI
    };
  }
  
  console.warn('⚠️ No matching voice found');
  return null;
}

/**
 * Test giọng nói bằng cách đọc một đoạn văn mẫu
 * @param {string} voiceName - Tên voice cần test
 * @param {string} testText - Văn bản test (mặc định '你好，歡迎學習中文！')
 * @returns {Promise<boolean>} - Promise trả về true nếu test thành công
 */
function testVoice(voiceName, testText = '你好，歡迎學習中文！') {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    
    getVoicesWithRetry().then(voices => {
      const voice = voices.find(v => v.name === voiceName);
      
      if (!voice) {
        console.error(`❌ Voice "${voiceName}" not found`);
        resolve(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        console.log(`✅ Voice test successful: ${voiceName}`);
        resolve(true);
      };
      
      utterance.onerror = (event) => {
        console.error(`❌ Voice test failed: ${voiceName}`, event.error);
        resolve(false);
      };
      
      console.log(`🔊 Testing voice: ${voiceName}`);
      window.speechSynthesis.speak(utterance);
    });
  });
}

/**
 * ========== VOICE SELECTOR UI (GLOBAL) ==========
 * Initialize and manage voice selector dropdown in header
 */

// Voice selector state
let voiceSelectorState = {
  voicesLoaded: false,
  retryCount: 0,
  maxRetries: 60,
  pollTimer: null
};

// Voice matching patterns (priority order)
const VOICE_PATTERNS = [
  { keywords: ['hanhan'], label: 'HanHan (F)', priority: 1 },
  { keywords: ['yating'], label: 'Yating (F)', priority: 2 },
  { keywords: ['zhiwei', 'online', 'natural'], label: 'Zhiwei (M)', priority: 3 },
  { keywords: ['google', '國語', '臺灣', 'taiwan'], label: 'Google TW', priority: 4 },
  { keywords: ['huihui'], label: 'Huihui (F)', priority: 5 }
];

/**
 * Initialize voice selector when DOM is ready
 */
function initializeVoiceSelector() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) {
    console.warn('⚠️ Voice selector not found in DOM');
    return;
  }
  
  console.log('🎤 Initializing voice selector...');
  
  // Kick-start voice loading
  for (let i = 0; i < 5; i++) {
    window.speechSynthesis.getVoices();
  }
  
  // Dummy utterance to trigger voice loading
  try {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.cancel();
    console.log('✅ Dummy utterance triggered');
  } catch (e) {
    console.warn('⚠️ Dummy utterance failed:', e.message);
  }
  
  // Start populating voices
  setTimeout(populateVoiceSelector, 100);
  
  // Listen for voiceschanged event
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function() {
      console.log('🔔 voiceschanged event fired');
      if (!voiceSelectorState.voicesLoaded) {
        populateVoiceSelector();
      }
    };
  }
  
  // Backup retries
  setTimeout(() => { if (!voiceSelectorState.voicesLoaded) populateVoiceSelector(); }, 500);
  setTimeout(() => { if (!voiceSelectorState.voicesLoaded) populateVoiceSelector(); }, 1000);
  setTimeout(() => { if (!voiceSelectorState.voicesLoaded) createVoiceSelectorFallback(); }, 3000);
  
  // User gesture trigger (many browsers need user interaction)
  window.addEventListener('pointerdown', function handleFirstGesture() {
    if (!voiceSelectorState.voicesLoaded) {
      console.log('👆 User gesture detected, loading voices...');
      populateVoiceSelector();
    }
    window.removeEventListener('pointerdown', handleFirstGesture);
  }, { passive: true, once: true });
  
  // Setup change listener
  voiceSelect.addEventListener('change', onVoiceSelectionChanged);
}

/**
 * Populate voice selector dropdown
 */
function populateVoiceSelector() {
  if (voiceSelectorState.voicesLoaded) {
    console.log('✅ Voices already loaded');
    return;
  }
  
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;
  
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    voiceSelectorState.retryCount++;
    if (voiceSelectorState.retryCount < voiceSelectorState.maxRetries) {
      console.log(`⏳ Retry ${voiceSelectorState.retryCount}/${voiceSelectorState.maxRetries}...`);
      setTimeout(populateVoiceSelector, 100);
      return;
    } else {
      console.warn('⚠️ No voices after max retries');
      createVoiceSelectorFallback();
      return;
    }
  }
  
  voiceSelectorState.voicesLoaded = true;
  voiceSelectorState.retryCount = 0;
  console.log(`✅ Loaded ${voices.length} voices`);
  
  // Filter Taiwan voices
  let taiwanVoices = voices.filter(v => v.lang === 'zh-TW' || v.lang.startsWith('zh-TW-'));
  
  // Fallback to other Chinese if Taiwan voices are scarce
  if (taiwanVoices.length < 3) {
    const otherChinese = voices.filter(v => v.lang.startsWith('zh') && !v.lang.startsWith('zh-TW'));
    if (otherChinese.length > 0) {
      taiwanVoices = taiwanVoices.concat(otherChinese);
    }
  }
  
  if (taiwanVoices.length === 0) {
    console.warn('⚠️ No Chinese voices found');
    createVoiceSelectorFallback();
    return;
  }
  
  // Match and organize voices
  voiceSelect.innerHTML = '';
  const matchedVoices = [];
  const addedNames = {};
  
  taiwanVoices.forEach(voice => {
    if (addedNames[voice.name]) return;
    
    const nameLower = voice.name.toLowerCase();
    let matched = null;
    
    // Try to match with patterns
    for (const pattern of VOICE_PATTERNS) {
      const matchCount = pattern.keywords.filter(keyword => 
        nameLower.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        matched = pattern;
        break;
      }
    }
    
    if (matched) {
      matchedVoices.push({ voice, config: matched });
    } else {
      // Add unmatched voices with generic label
      const displayLabel = voice.name
        .replace('Microsoft ', '')
        .replace('Google ', '')
        .replace(' Online', '')
        .replace(' Desktop', '');
      
      let regionLabel = '';
      if (voice.lang.startsWith('zh-CN')) regionLabel = ' [CN]';
      else if (voice.lang.startsWith('zh-HK')) regionLabel = ' [HK]';
      
      matchedVoices.push({ 
        voice, 
        config: { label: displayLabel + regionLabel, priority: 99 } 
      });
    }
    
    addedNames[voice.name] = true;
  });
  
  // Sort by priority and limit
  matchedVoices.sort((a, b) => (a.config.priority || 99) - (b.config.priority || 99));
  const limitedVoices = matchedVoices.slice(0, 15);
  
  // Group by Taiwan and Others
  const twVoices = limitedVoices.filter(v => v.voice.lang.startsWith('zh-TW'));
  const otherVoices = limitedVoices.filter(v => !v.voice.lang.startsWith('zh-TW'));
  
  // Add Taiwan voices group
  if (twVoices.length > 0) {
    const twGroup = document.createElement('optgroup');
    twGroup.label = `🇹🇼 Taiwan (${twVoices.length})`;
    twVoices.forEach(item => {
      const option = document.createElement('option');
      option.value = item.voice.name;
      option.textContent = item.config.label;
      option.setAttribute('data-lang', item.voice.lang);
      twGroup.appendChild(option);
    });
    voiceSelect.appendChild(twGroup);
    console.log(`✅ Added ${twVoices.length} Taiwan voices`);
  }
  
  // Add Other voices group
  if (otherVoices.length > 0) {
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = `Other (${otherVoices.length})`;
    otherVoices.forEach(item => {
      const option = document.createElement('option');
      option.value = item.voice.name;
      option.textContent = item.config.label;
      option.setAttribute('data-lang', item.voice.lang);
      otherGroup.appendChild(option);
    });
    voiceSelect.appendChild(otherGroup);
    console.log(`✅ Added ${otherVoices.length} other voices`);
  }
  
  // Add default fallback
  const fallbackOpt = document.createElement('option');
  fallbackOpt.value = 'zh-TW';
  fallbackOpt.textContent = '🌐 Default (zh-TW)';
  fallbackOpt.setAttribute('data-lang', 'zh-TW');
  voiceSelect.appendChild(fallbackOpt);
  
  voiceSelect.selectedIndex = 0;
  console.log(`✅ Voice selector populated with ${voiceSelect.options.length} options`);
  
  // Load saved selection
  loadSavedVoiceSelection();
}

/**
 * Create fallback options when no voices available
 */
function createVoiceSelectorFallback() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;
  
  // Check if already has valid options
  if (voiceSelect.options.length > 1 && 
      voiceSelect.options[0].value !== '' && 
      !voiceSelect.options[0].disabled) {
    console.log('✅ Dropdown already has valid options');
    return;
  }
  
  console.warn('⚠️ Creating fallback options');
  voiceSelect.innerHTML = '';
  
  const fallbacks = [
    { value: 'zh-TW', label: '🇹🇼 Taiwan (System)' },
    { value: 'zh-CN', label: '🇨🇳 China (System)' },
    { value: 'zh-HK', label: '🇭🇰 Hong Kong (System)' }
  ];
  
  fallbacks.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    option.setAttribute('data-lang', opt.value);
    voiceSelect.appendChild(option);
  });
  
  voiceSelectorState.voicesLoaded = true;
  voiceSelect.selectedIndex = 0;
  loadSavedVoiceSelection();
}

/**
 * Load saved voice selection from localStorage
 */
function loadSavedVoiceSelection() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;
  
  const savedName = localStorage.getItem('selectedVoiceName');
  if (!savedName) {
    console.log('ℹ️ No saved voice preference');
    return;
  }
  
  // Try to find and select saved voice
  const options = voiceSelect.options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === savedName) {
      voiceSelect.selectedIndex = i;
      console.log(`✅ Restored saved voice: ${savedName}`);
      return;
    }
  }
  
  console.warn(`⚠️ Saved voice "${savedName}" not found in current options`);
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
  
  console.log(`🔊 Voice changed: ${selectedValue} (${selectedLang})`);
  
  // Broadcast voice change event
  window.dispatchEvent(new CustomEvent('voiceChanged', {
    detail: { name: selectedValue, lang: selectedLang }
  }));
  
  // Sync to backend if API available
  if (window.SETTINGS_API && localStorage.getItem('token')) {
    window.SETTINGS_API.syncVoiceToBackend(selectedValue).catch(err => {
      console.warn('⚠️ Failed to sync voice to backend:', err);
    });
  }
}

/**
 * Test current selected voice
 */
function testCurrentVoice() {
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) {
    console.error('❌ Voice selector not found');
    return;
  }
  
  const selectedValue = voiceSelect.value;
  if (!selectedValue) {
    if (typeof showError === 'function') {
        showError('Vui lòng chọn giọng đọc trước!');
    } else {
        alert('Vui lòng chọn giọng đọc trước!');
    }
    
    // Highlight select
    voiceSelect.classList.add('ring-2', 'ring-red-500', 'border-red-500');
    setTimeout(() => voiceSelect.classList.remove('ring-2', 'ring-red-500', 'border-red-500'), 2000);
    return;
  }
  
  console.log(`🔊 Testing voice: ${selectedValue}`);

  // Show playing toast
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-primary text-[#0e1b0e] px-6 py-4 rounded-2xl shadow-xl z-50 animate-slide-in flex items-center gap-2 font-bold';
  toast.innerHTML = '<span class="material-symbols-outlined">volume_up</span> <span>Đang đọc mẫu...</span>';
  toast.style.animation = 'slideIn 0.3s ease-out forwards'; // Ensure animation works if class not present
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
  
  // Use the global speakText function (respects audio enabled setting)
  speakText('你好，歡迎學習中文！', 0.9, () => {
    console.log('✅ Voice test complete');
  });
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM ready, initializing header...');
  
  // Initialize back button
  const backBtn = document.querySelector('a[href*="games_home.html"]');
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = '../user/games_home.html';
    });
    console.log('✅ Back button initialized');
  }
  
  // Initialize voice selector
  initializeVoiceSelector();
});

// Đảm bảo các hàm này global
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
