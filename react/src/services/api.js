// Dynamic API configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
    this.isRefreshing = false;
    this.failedQueue = [];
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Setup default interceptors
    this.setupDefaultInterceptors();
  }

  // Cache methods
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}?${new URLSearchParams(params).toString()}`;
  }

  setCache(key, data, ttl = this.cacheTimeout) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Dynamic API methods
  async get(endpoint, params = {}, options = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    if (options.cache !== false) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const data = await this.request(url, { method: 'GET', ...options });
    
    if (options.cache !== false) {
      this.setCache(cacheKey, data, options.cacheTtl);
    }
    
    return data;
  }

  async post(endpoint, body = {}, options = {}) {
    this.clearCache(endpoint.split('/')[1]); // Clear related cache
    return this.request(endpoint, { method: 'POST', body, ...options });
  }

  async put(endpoint, body = {}, options = {}) {
    this.clearCache(endpoint.split('/')[1]); // Clear related cache
    return this.request(endpoint, { method: 'PUT', body, ...options });
  }

  async patch(endpoint, body = {}, options = {}) {
    this.clearCache(endpoint.split('/')[1]); // Clear related cache
    return this.request(endpoint, { method: 'PATCH', body, ...options });
  }

  async delete(endpoint, options = {}) {
    this.clearCache(endpoint.split('/')[1]); // Clear related cache
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // File upload with progress
  async uploadFile(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.additionalData) {
      Object.keys(options.additionalData).forEach(key => {
        formData.append(key, options.additionalData[key]);
      });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          options.onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_CONFIG.baseURL}${endpoint}`);
      
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }
      
      xhr.send(formData);
    });
  }

  // Batch requests
  async batch(requests) {
    const promises = requests.map(({ method, endpoint, body, options }) => {
      return this[method.toLowerCase()](endpoint, body, options).catch(error => ({ error }));
    });
    
    return Promise.all(promises);
  }

  // Pagination helper
  async paginate(endpoint, params = {}, options = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    
    const data = await this.get(endpoint, { ...params, page, limit }, options);
    
    return {
      ...data,
      hasNextPage: data.page < data.totalPages,
      hasPrevPage: data.page > 1,
      nextPage: data.page < data.totalPages ? data.page + 1 : null,
      prevPage: data.page > 1 ? data.page - 1 : null
    };
  }

  // Interceptor management
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
    return this.interceptors.request.length - 1;
  }

  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
    return this.interceptors.response.length - 1;
  }

  addErrorInterceptor(interceptor) {
    this.interceptors.error.push(interceptor);
    return this.interceptors.error.length - 1;
  }

  removeInterceptor(type, index) {
    if (this.interceptors[type] && this.interceptors[type][index]) {
      this.interceptors[type].splice(index, 1);
    }
  }

  setupDefaultInterceptors() {
    // Request interceptor for adding auth token
    this.addRequestInterceptor((config) => {
      if (this.token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for handling token refresh
    this.addResponseInterceptor(async (response, config) => {
      if (response.status === 401 && this.refreshToken && !config._retry) {
        return this.handleTokenRefresh(config);
      }
      return response;
    });

    // Error interceptor for global error handling
    this.addErrorInterceptor((error) => {
      if (error.name === 'NetworkError') {
        this.handleNetworkError(error);
      }
      return Promise.reject(error);
    });
  }

  async handleTokenRefresh(originalConfig) {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, config: originalConfig });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.token, data.refreshToken);
        
        // Process failed queue
        this.failedQueue.forEach(({ resolve, config }) => {
          resolve(this.request(config.endpoint, config));
        });
        this.failedQueue = [];
        
        // Retry original request
        originalConfig._retry = true;
        return this.request(originalConfig.endpoint, originalConfig);
      } else {
        this.handleAuthFailure();
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      this.handleAuthFailure();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  handleAuthFailure() {
    this.clearToken();
    this.failedQueue.forEach(({ reject }) => {
      reject(new Error('Authentication failed'));
    });
    this.failedQueue = [];
    
    // Redirect to login or emit event
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  handleNetworkError(error) {
    console.error('Network error:', error);
    window.dispatchEvent(new CustomEvent('network:error', { detail: error }));
  }

  setToken(token, refreshToken = null) {
    this.token = token;
    localStorage.setItem('token', token);
    
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearToken() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    let config = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_CONFIG.timeout,
      ...options,
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config) || config;
    }

    // Handle different body types
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    let attempt = 0;
    while (attempt < API_CONFIG.retryAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Apply response interceptors
        for (const interceptor of this.interceptors.response) {
          const result = await interceptor(response, config);
          if (result) return result;
        }

        const data = await response.json();

        if (!response.ok) {
          const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.data = data;
          throw error;
        }

        return data;
      } catch (error) {
        attempt++;
        
        // Apply error interceptors
        for (const interceptor of this.interceptors.error) {
          await interceptor(error);
        }

        if (attempt >= API_CONFIG.retryAttempts || error.status === 401 || error.status === 403) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt));
      }
    }
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setToken(data.token);
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Properties
  async getProperties(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/properties?${params}`);
  }

  async getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(propertyData).forEach(key => {
      if (key !== 'images') {
        if (Array.isArray(propertyData[key])) {
          // Send amenities as individual form fields
          if (key === 'amenities') {
            propertyData[key].forEach((amenity, index) => {
              formData.append(`amenities[${index}]`, amenity);
            });
          } else {
            formData.append(key, JSON.stringify(propertyData[key]));
          }
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });
    
    // Add image files
    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create property');
    }
    return data;
  }

  async updateProperty(id, propertyData) {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(propertyData).forEach(key => {
      if (key !== 'images') {
        if (Array.isArray(propertyData[key])) {
          // Send amenities as individual form fields
          if (key === 'amenities') {
            propertyData[key].forEach((amenity, index) => {
              formData.append(`amenities[${index}]`, amenity);
            });
          } else {
            formData.append(key, JSON.stringify(propertyData[key]));
          }
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });
    
    // Add new image files
    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images.forEach(image => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update property');
    }
    return data;
  }

  async deleteProperty(id) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings
  async getBookings() {
    return this.request('/bookings');
  }

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: bookingData,
    });
  }

  async updateBookingStatus(id, status) {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  // Housekeeping
  async getHousekeepingTasks(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/housekeeping?${params}`);
  }

  async createHousekeepingTask(taskData) {
    return this.request('/housekeeping', {
      method: 'POST',
      body: taskData,
    });
  }

  async updateHousekeepingTask(id, taskData) {
    return this.request(`/housekeeping/${id}`, {
      method: 'PUT',
      body: taskData,
    });
  }

  async deleteHousekeepingTask(id) {
    return this.request(`/housekeeping/${id}`, {
      method: 'DELETE',
    });
  }

  // Maintenance
  async getMaintenanceRequests(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/maintenance?${params}`);
  }

  async createMaintenanceRequest(requestData) {
    return this.request('/maintenance', {
      method: 'POST',
      body: requestData,
    });
  }

  async updateMaintenanceRequest(id, requestData) {
    return this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: requestData,
    });
  }

  async deleteMaintenanceRequest(id) {
    return this.request(`/maintenance/${id}`, {
      method: 'DELETE',
    });
  }

  async getMaintenanceStats() {
    return this.request('/maintenance/stats');
  }

  // Users
  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/users?${params}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
