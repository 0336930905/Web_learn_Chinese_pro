/**
 * API Client
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available (support multiple key names for backward compatibility)
    const token = localStorage.getItem('authToken') 
                  || localStorage.getItem('token') 
                  || localStorage.getItem('jwtToken')
                  || sessionStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Using token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in storage');
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - clear invalid tokens
        if (response.status === 401) {
          console.error('❌ 401 Unauthorized - Token invalid or expired');
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('authToken');
        }
        
        throw new ApiError(
          data.error?.message || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error. Please check your connection.', 0, null);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

/**
 * Custom API Error
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Auth API
 */
class AuthAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Register new user
   */
  async register(data) {
    const response = await this.client.post('/auth/register', {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: data.role || 'student',
    });
    
    // Store auth token (use consistent key and clean up old keys)
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Clean up old keys
      localStorage.removeItem('token');
      localStorage.removeItem('jwtToken');
    }
    
    return response;
  }

  /**
   * Login user
   */
  async login(email, password) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    
    // Store auth token and user data (use consistent key and clean up old keys)
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Clean up old keys
      localStorage.removeItem('token');
      localStorage.removeItem('jwtToken');
    }
    
    return response;
  }

  /**
   * Logout user
   */
  logout() {
    // Remove all possible token keys
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    window.location.href = '/login_screen.html';
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(localStorage.getItem('authToken') 
              || localStorage.getItem('token') 
              || localStorage.getItem('jwtToken'));
  }
  
  /**
   * Validate token and redirect to login if invalid
   * @returns {boolean} true if token exists and appears valid
   */
  validateToken() {
    const token = localStorage.getItem('authToken') 
                  || localStorage.getItem('token') 
                  || localStorage.getItem('jwtToken');
    
    if (!token) {
      console.warn('⚠️ No authentication token found');
      return false;
    }
    
    // Basic JWT structure validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid token format');
      this.clearInvalidToken();
      return false;
    }
    
    try {
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('⚠️ Token has expired');
        this.clearInvalidToken();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validating token:', error);
      this.clearInvalidToken();
      return false;
    }
  }
  
  /**
   * Clear invalid tokens and redirect to login
   */
  clearInvalidToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this.client.get('/auth/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(data) {
    return this.client.put('/auth/profile', data);
  }

  /**
   * Generic GET request (for convenience)
   */
  async get(endpoint, params) {
    return this.client.get(endpoint, params);
  }

  /**
   * Generic POST request (for convenience)
   */
  async post(endpoint, data) {
    return this.client.post(endpoint, data);
  }

  /**
   * Generic PUT request (for convenience)
   */
  async put(endpoint, data) {
    return this.client.put(endpoint, data);
  }

  /**
   * Generic DELETE request (for convenience)
   */
  async delete(endpoint) {
    return this.client.delete(endpoint);
  }
}

/**
 * Category API
 */
class CategoryAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get all categories
   */
  async getAll(params = {}) {
    return this.client.get('/categories', params);
  }

  /**
   * Get category by ID
   */
  async getById(id) {
    return this.client.get(`/categories/${id}`);
  }

  /**
   * Create new category (admin only)
   */
  async create(data) {
    return this.client.post('/categories', data);
  }

  /**
   * Update category (admin only)
   */
  async update(id, data) {
    return this.client.put(`/categories/${id}`, data);
  }

  /**
   * Delete category (admin only)
   */
  async delete(id) {
    return this.client.delete(`/categories/${id}`);
  }
}

/**
 * Vocabulary API
 */
class VocabularyAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get all vocabulary
   */
  async getAll(params = {}) {
    return this.client.get('/vocabulary', params);
  }

  /**
   * Get vocabulary by ID
   */
  async getById(id) {
    return this.client.get(`/vocabulary/${id}`);
  }

  /**
   * Get vocabulary by category
   */
  async getByCategory(categoryId, params = {}) {
    return this.client.get('/vocabulary', { ...params, categoryId });
  }

  /**
   * Create new vocabulary (admin only)
   */
  async create(data) {
    return this.client.post('/vocabulary', data);
  }

  /**
   * Update vocabulary (admin only)
   */
  async update(id, data) {
    return this.client.put(`/vocabulary/${id}`, data);
  }

  /**
   * Delete vocabulary (admin only)
   */
  async delete(id) {
    return this.client.delete(`/vocabulary/${id}`);
  }
}

/**
 * Game API
 */
class GameAPI {
  constructor(client) {
    this.client = client;
  }

  async getTestQuestions(level) {
    return this.client.get('/games/test/questions', { level });
  }

  async submitTestResult(data) {
    return this.client.post('/games/test/submit', data);
  }
}

// Create singleton instances
const apiClient = new ApiClient();
const authAPI = new AuthAPI(apiClient);
const categoryAPI = new CategoryAPI(apiClient);
const vocabularyAPI = new VocabularyAPI(apiClient);
const gameAPI = new GameAPI(apiClient);

// Export for use in HTML pages
if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
  window.authAPI = authAPI;
  window.categoryAPI = categoryAPI;
  window.vocabularyAPI = vocabularyAPI;
  window.gameAPI = gameAPI;
  window.ApiError = ApiError;
}
