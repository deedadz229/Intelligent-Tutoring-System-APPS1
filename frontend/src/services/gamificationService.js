import { apiClient } from '../api/client';

export const gamificationService = {
  /**
   * Mengambil data profil gamifikasi pengguna (level dinamis, total XP, status level).
   */
  async getProfile(userId = 1) {
    return apiClient.get('/api/gamification/profile', { user_id: userId });
  },

  /**
   * Mengambil rincian progress bar level dan ringkasan daily quest.
   */
  async getProgress(userId = 1) {
    return apiClient.get('/api/gamification/progress', { user_id: userId });
  },

  /**
   * Mengambil daftar seluruh achievements dan status unlock pengguna.
   */
  async getAchievements(userId = 1) {
    return apiClient.get('/api/gamification/achievements', { user_id: userId });
  },

  /**
   * Mengambil daftar daily quests hari ini beserta progress pencapaiannya.
   */
  async getQuests(userId = 1) {
    return apiClient.get('/api/gamification/quests', { user_id: userId });
  },

  /**
   * Menyelesaikan dan mengklaim reward XP suatu quest harian (divalidasi server).
   */
  async completeQuest(questId, userId = 1) {
    return apiClient.post(`/api/gamification/quests/${questId}/complete`, {}, { user_id: userId });
  },

  /**
   * Mengambil peringkat leaderboard mahasiswa berdasarkan total akumulasi XP.
   */
  async getLeaderboard(limit = 10) {
    return apiClient.get('/api/gamification/leaderboard', { limit });
  },
};
