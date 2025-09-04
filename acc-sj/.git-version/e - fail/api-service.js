/**
 * API Service Layer
 * Centralized API communication with proper error handling and caching
 */

class APIService {
  constructor() {
    this.baseURL = 'https://app.weva.my.id/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generic API request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request failed:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.name 
      };
    }
  }

  /**
   * GET request with caching
   */
  async get(endpoint, useCache = true) {
    const cacheKey = `GET:${endpoint}`;
    
    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const result = await this.request(endpoint, { method: 'GET' });
    
    // Cache successful responses
    if (result.success && useCache) {
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    // This would be replaced with actual API endpoint
    return this.get('/dashboard/stats');
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 10) {
    return this.get(`/activities/recent?limit=${limit}`);
  }

  /**
   * Get data summary
   */
  async getDataSummary(page = 1, limit = 10) {
    return this.get(`/data/summary?page=${page}&limit=${limit}`);
  }

  /**
   * Search data
   */
  async searchData(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    return this.get(`/data/search?${params}`);
  }
}

// Create global API service instance
window.apiService = new APIService();