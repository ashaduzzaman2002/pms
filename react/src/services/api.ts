// Types and interfaces
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

interface RequestOptions extends RequestInit {
  useCache?: boolean;
  cacheTtl?: number;
  _retry?: boolean;
  endpoint?: string;
}

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

interface Interceptor<T = any> {
  (config: T): T | Promise<T>;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

interface PaginatedResponse<T = any> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// API configuration
const API_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private interceptors = {
    request: [] as Interceptor<RequestOptions>[],
    response: [] as Interceptor<Response>[],
    error: [] as Interceptor<Error>[]
  };
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    config: RequestOptions;
  }> = [];
  private cache = new Map<string, CacheItem>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private ws: WebSocket | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.setupDefaultInterceptors();
  }

  // Interceptor management
  addRequestInterceptor(interceptor: Interceptor<RequestOptions>): number {
    this.interceptors.request.push(interceptor);
    return this.interceptors.request.length - 1;
  }

  addResponseInterceptor(interceptor: Interceptor<Response>): number {
    this.interceptors.response.push(interceptor);
    return this.interceptors.response.length - 1;
  }

  addErrorInterceptor(interceptor: Interceptor<Error>): number {
    this.interceptors.error.push(interceptor);
    return this.interceptors.error.length - 1;
  }

  private setupDefaultInterceptors(): void {
    this.addRequestInterceptor((config) => {
      if (this.token && !config.headers?.['Authorization']) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${this.token}`
        } as Record<string, string>;
      }
      return config;
    });
  }

  setToken(token: string, refreshToken?: string): void {
    this.token = token;
    localStorage.setItem('token', token);
    
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearToken(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  // Cache methods
  private getCacheKey(endpoint: string, params: Record<string, any> = {}): string {
    return `${endpoint}?${new URLSearchParams(params).toString()}`;
  }

  private setCache(key: string, data: any, ttl = this.cacheTimeout): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clearCache(pattern?: string): void {
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

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    let config: RequestOptions = {
      headers: {
        'Content-Type': 'application/json',
      } as Record<string, string>,
      ...options,
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config) || config;
    }

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    let attempt = 0;
    while (attempt < API_CONFIG.retryAttempts) {
      try {
        const response = await fetch(url, config);

        if (response.status === 401 && this.refreshToken && !config._retry) {
          return this.handleTokenRefresh(endpoint, config);
        }

        const data = await response.json();

        if (!response.ok) {
          const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`) as any;
          error.status = response.status;
          error.data = data;
          throw error;
        }

        return data;
      } catch (error: any) {
        attempt++;
        
        if (attempt >= API_CONFIG.retryAttempts || error.status === 401 || error.status === 403) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt));
      }
    }

    throw new Error('Max retry attempts reached');
  }

  private async handleTokenRefresh<T>(endpoint: string, originalConfig: RequestOptions): Promise<T> {
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
        
        this.failedQueue.forEach(({ resolve, config }) => {
          resolve(this.request(config.endpoint!, config));
        });
        this.failedQueue = [];
        
        originalConfig._retry = true;
        return this.request(endpoint, originalConfig);
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

  private handleAuthFailure(): void {
    this.clearToken();
    this.failedQueue.forEach(({ reject }) => {
      reject(new Error('Authentication failed'));
    });
    this.failedQueue = [];
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // HTTP methods
  async get<T = any>(endpoint: string, params: Record<string, any> = {}, options: RequestOptions = {}): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    if (options.useCache !== false) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const data = await this.request<T>(url, { method: 'GET', ...options, endpoint: url });
    
    if (options.useCache !== false) {
      this.setCache(cacheKey, data, options.cacheTtl);
    }
    
    return data;
  }

  async post<T = any>(endpoint: string, body: any = {}, options: RequestOptions = {}): Promise<T> {
    this.clearCache(endpoint.split('/')[1]);
    return this.request<T>(endpoint, { method: 'POST', body, ...options, endpoint });
  }

  async put<T = any>(endpoint: string, body: any = {}, options: RequestOptions = {}): Promise<T> {
    this.clearCache(endpoint.split('/')[1]);
    return this.request<T>(endpoint, { method: 'PUT', body, ...options, endpoint });
  }

  async patch<T = any>(endpoint: string, body: any = {}, options: RequestOptions = {}): Promise<T> {
    this.clearCache(endpoint.split('/')[1]);
    return this.request<T>(endpoint, { method: 'PATCH', body, ...options, endpoint });
  }

  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    this.clearCache(endpoint.split('/')[1]);
    return this.request<T>(endpoint, { method: 'DELETE', ...options, endpoint });
  }

  // Auth API
  async login(email: string, password: string) {
    const data = await this.post('/auth/login', { email, password });
    this.setToken(data.token, data.refreshToken);
    return data;
  }

  async register(userData: any) {
    const data = await this.post('/auth/register', userData);
    this.setToken(data.token, data.refreshToken);
    return data;
  }

  async getCurrentUser() {
    return this.get('/auth/me', {}, { useCache: false });
  }

  async logout() {
    try {
      await this.post('/auth/logout', { refreshToken: this.refreshToken });
    } finally {
      this.clearToken();
      this.clearCache();
    }
  }

  // Properties API
  async getProperties(filters: Record<string, any> = {}) {
    return this.get('/properties', filters);
  }

  async getProperty(id: string) {
    return this.get(`/properties/${id}`);
  }

  async createProperty(propertyData: any) {
    const formData = new FormData();
    
    Object.keys(propertyData).forEach(key => {
      if (key !== 'images') {
        if (Array.isArray(propertyData[key])) {
          if (key === 'amenities') {
            propertyData[key].forEach((amenity: string, index: number) => {
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
    
    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images.forEach((image: File) => {
        formData.append('images', image);
      });
    }

    return this.request('/properties', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      } as Record<string, string>,
    });
  }

  async updateProperty(id: string, propertyData: any) {
    const formData = new FormData();
    
    Object.keys(propertyData).forEach(key => {
      if (key !== 'images') {
        if (Array.isArray(propertyData[key])) {
          if (key === 'amenities') {
            propertyData[key].forEach((amenity: string, index: number) => {
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
    
    if (propertyData.images && propertyData.images.length > 0) {
      propertyData.images.forEach((image: File) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
    }

    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      } as Record<string, string>,
    });
  }

  async deleteProperty(id: string) {
    return this.delete(`/properties/${id}`);
  }

  // Bookings API
  async getBookings(filters: Record<string, any> = {}) {
    return this.get('/bookings', filters);
  }

  async createBooking(bookingData: any) {
    return this.post('/bookings', bookingData);
  }

  async updateBookingStatus(id: string, status: string) {
    return this.patch(`/bookings/${id}/status`, { status });
  }

  // WebSocket setup
  setupWebSocket(userId: string): WebSocket {
    if (this.ws) {
      this.ws.close();
    }

    const wsUrl = `${API_CONFIG.baseURL.replace('http', 'ws')}/ws?token=${this.token}&userId=${userId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      window.dispatchEvent(new CustomEvent('ws:message', { detail: data }));
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => this.setupWebSocket(userId), 5000);
    };

    return this.ws;
  }

  closeWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new ApiService();
