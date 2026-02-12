/**
 * Settings API Client
 * Client-side functions to interact with Settings API
 */

const SETTINGS_API = {
  BASE_URL: '/api/settings',

  /**
   * Get user settings
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(this.BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to get settings');
      }

      return result.data.settings;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  },

  /**
   * Update user settings
   * @param {Object} settings - Settings to update
   * @param {string} settings.theme - Theme ('light' or 'dark')
   * @param {string} settings.language - Language ('en', 'vi', or 'tw')
   * @param {string} settings.voice - Voice (e.g., 'zh-TW', 'zh-CN', 'zh-HK')
   * @param {Object} settings.sound - Sound settings
   * @param {number} settings.sound.bgMusic - Background music volume (0-100)
   * @param {number} settings.sound.gameSFX - Game sound effects volume (0-100)
   * @returns {Promise<Object>} Updated settings object
   */
  async updateSettings(settings) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(this.BASE_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update settings');
      }

      return result.data.settings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  /**
   * Update voice setting only
   * @param {string} voice - Voice code (e.g., 'zh-TW', 'zh-CN', 'zh-HK')
   * @returns {Promise<Object>} Updated settings object
   */
  async updateVoice(voice) {
    return this.updateSettings({ voice });
  },

  /**
   * Update theme setting only
   * @param {string} theme - Theme ('light' or 'dark')
   * @returns {Promise<Object>} Updated settings object
   */
  async updateTheme(theme) {
    return this.updateSettings({ theme });
  },

  /**
   * Update language setting only
   * @param {string} language - Language ('en', 'vi', or 'tw')
   * @returns {Promise<Object>} Updated settings object
   */
  async updateLanguage(language) {
    return this.updateSettings({ language });
  },

  /**
   * Update sound settings only
   * @param {Object} sound - Sound settings
   * @param {number} sound.bgMusic - Background music volume (0-100)
   * @param {number} sound.gameSFX - Game sound effects volume (0-100)
   * @returns {Promise<Object>} Updated settings object
   */
  async updateSound(sound) {
    return this.updateSettings({ sound });
  },

  /**
   * Sync localStorage voice setting with backend
   * Call this when user changes voice in games-header
   * @param {string} voice - Voice code from localStorage
   */
  async syncVoiceToBackend(voice) {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('User not logged in, voice only saved to localStorage');
        return;
      }

      // Update backend
      await this.updateVoice(voice);
      console.log('✅ Voice synced to backend:', voice);
    } catch (error) {
      console.error('Failed to sync voice to backend:', error);
      // Don't throw - localStorage is already updated
    }
  },

  /**
   * Load settings from backend and sync to localStorage
   * Call this on app initialization when user is logged in
   */
  async loadAndSyncSettings() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('User not logged in, using localStorage settings only');
        return;
      }

      // Get settings from backend
      const settings = await this.getSettings();

      // Sync to localStorage
      if (settings.voice) {
        localStorage.setItem('selectedVoice', settings.voice);
      }

      if (settings.theme) {
        localStorage.setItem('theme', settings.theme);
        // Apply theme to document
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      console.log('✅ Settings loaded and synced from backend');
      return settings;
    } catch (error) {
      console.error('Failed to load settings from backend:', error);
      // Continue with localStorage values
    }
  },
};

// Make available globally
window.SETTINGS_API = SETTINGS_API;
