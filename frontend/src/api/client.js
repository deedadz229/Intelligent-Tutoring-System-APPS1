/**
 * Centralized HTTP API Client for Academic Assistant ITS Backend
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async request(endpoint, options = {}) {
    const url = new URL(`${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    // Attach Bearer token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('academic_token') : null;
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url.toString(), config);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        if (data && typeof data === 'object') {
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.join('; ');
          } else if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
          } else if (data.message) {
            errorMessage = data.message;
          }
        }
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Network failure or CORS block
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        const networkError = new Error('Gagal terhubung ke server backend FastAPI. Pastikan backend aktif di ' + this.baseUrl);
        networkError.isNetworkError = true;
        networkError.status = 0;
        throw networkError;
      }
      throw err;
    }
  }

  get(endpoint, params = {}) {
    return this.request(endpoint, { method: 'GET', params });
  }

  post(endpoint, body = {}, params = {}) {
    return this.request(endpoint, { method: 'POST', body, params });
  }
}

export const apiClient = new ApiClient(BASE_URL);
