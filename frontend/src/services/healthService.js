import { apiClient } from '../api/client';

export const healthService = {
  /**
   * Mengambil status kesehatan sistem (aplikasi, model TF-IDF, dataset FAQ, dan database).
   */
  async getHealth() {
    return apiClient.get('/health');
  },
};
