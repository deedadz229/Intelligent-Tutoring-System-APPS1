import { apiClient } from '../api/client';

export const chatbotService = {
  /**
   * Mengirim pertanyaan akademik ke backend FastAPI.
   * Menerapkan validasi TF-IDF Cosine Similarity & Fuzzy Matching.
   */
  async processQuestion(question, userId = 1) {
    return apiClient.post('/api/process', {
      question: question.trim(),
      user_id: userId,
    });
  },

  /**
   * Mengirim feedback rating & komentar atas jawaban chatbot.
   */
  async submitFeedback({ chatId, rating, comment, userId = 1 }) {
    return apiClient.post('/api/feedback', {
      chat_id: chatId,
      rating,
      comment,
      user_id: userId,
    });
  },

  /**
   * Mengambil daftar kategori FAQ yang tersedia dalam dataset.
   */
  async getCategories() {
    return apiClient.get('/api/faq/categories');
  },

  /**
   * Mengambil contoh pertanyaan acak dari dataset untuk rekomendasi.
   */
  async getSamples(limit = 5) {
    return apiClient.get('/api/faq/samples', { limit });
  },

  /**
   * Mengambil data verifikasi (qa_perlu_verifikasi).
   */
  async getVerificationData(limit = 10) {
    return apiClient.get('/api/faq/verification', { limit });
  },
};
