import { apiClient } from '../api/client';

export const quizService = {
  /**
   * Mengambil daftar soal kuis akademik dari backend
   * @param {number} count - Jumlah soal yang diminta (default 5)
   */
  async getQuizQuestions(count = 5) {
    return apiClient.get(`/api/quiz/questions?count=${count}`);
  },

  /**
   * Mengirim jawaban kuis untuk diverifikasi dan mendapatkan reward XP
   * @param {Object} payload - { user_id, answers: [{ question_id, selected_option_id }] }
   */
  async submitQuiz(payload) {
    return apiClient.post('/api/quiz/submit', payload);
  }
};
