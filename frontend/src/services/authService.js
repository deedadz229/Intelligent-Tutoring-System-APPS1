import { apiClient } from '../api/client';

export const authService = {
  /**
   * Registrasi akun mahasiswa baru
   * @param {Object} data - { full_name, nim, email, username, password }
   */
  async register(data) {
    const res = await apiClient.post('/api/auth/register', data);
    if (res.access_token) {
      this.setAuth(res.access_token, res.user);
    }
    return res;
  },

  /**
   * Login mahasiswa dengan Username/Email/NIM dan password
   * @param {Object} credentials - { username_or_email, password }
   */
  async login(credentials) {
    const res = await apiClient.post('/api/auth/login', credentials);
    if (res.access_token) {
      this.setAuth(res.access_token, res.user);
    }
    return res;
  },

  /**
   * Ambil profil mahasiswa saat ini menggunakan JWT token
   */
  async getMe() {
    return apiClient.get('/api/auth/me');
  },

  /**
   * Logout dari sistem dan bersihkan sesi lokal
   */
  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      // Abaikan error jaringan saat logout
    } finally {
      this.clearAuth();
    }
  },

  setAuth(token, user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('academic_token', token);
      localStorage.setItem('academic_user', JSON.stringify(user));
    }
  },

  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('academic_token');
      localStorage.removeItem('academic_user');
    }
  },

  getStoredToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('academic_token');
    }
    return null;
  },

  getStoredUser() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('academic_user');
      try {
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
