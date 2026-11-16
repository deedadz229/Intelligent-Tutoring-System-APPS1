import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useGamification } from '../context/GamificationContext';
import { quizService } from '../services/quizService';

export const AcademicQuizPage = () => {
  const { profile, refreshGamification } = useGamification();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: 'A' | 'B' | ... }
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Fetch quiz questions from backend
  const fetchQuestions = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);

    try {
      const data = await quizService.getQuizQuestions(5);
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
      } else {
        setErrorMessage('Gagal memuat soal kuis dari server. Silakan coba kembali.');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setErrorMessage(err.message || 'Gagal terhubung ke backend server kuis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    // Pastikan semua soal telah terjawab
    if (answeredCount < totalQuestions) {
      alert(`Mohon jawab seluruh ${totalQuestions} soal sebelum mengirimkan kuis.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: profile?.user_id || 1,
        answers: Object.entries(selectedAnswers).map(([qId, optId]) => ({
          question_id: qId,
          selected_option_id: optId,
        })),
      };

      const result = await quizService.submitQuiz(payload);
      setQuizResult(result);

      // Sinkronisasi data XP dan level secara real-time
      refreshGamification();
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Gagal mengirim jawaban kuis: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Kuis Pemahaman Regulasi Akademik"
          subtitle="Memuat materi uji dari buku pedoman akademik resmi..."
          badge="Aktivitas Interaktif"
        />
        <LoadingState message="Menyiapkan bank soal akademik..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Kuis Pemahaman Regulasi Akademik"
          subtitle="Uji wawasan Anda seputar regulasi dan ketentuan kampus ITS"
          badge="Aktivitas Interaktif"
        />
        <ErrorState
          title="Gagal Memuat Kuis"
          message={errorMessage}
          onRetry={fetchQuestions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <PageHeader
        title="Kuis Regulasi Akademik ITS"
        subtitle="Uji pemahaman Anda seputar pedoman akademik, peroleh reward hingga +75 XP, dan raih badge prestasi!"
        badge="Aktivitas Interaktif"
      />

      {/* QUIZ RESULT VIEW */}
      {quizResult ? (
        <div className="space-y-6 animate-fade-in">
          {/* Result Score Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 mb-4 border border-amber-100 shadow-xs">
              <Award className="w-8 h-8" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              Kuis Selesai!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Anda telah menyelesaikan tantangan pemahaman regulasi akademik. Berikut adalah hasil evaluasi Anda:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-0.5">Skor Akhir</p>
                <p className="text-xl font-bold text-[#245CF5]">
                  {quizResult.score_percentage}%
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-0.5">Jawaban Benar</p>
                <p className="text-xl font-bold text-emerald-600">
                  {quizResult.correct_count} / {quizResult.total_questions}
                </p>
              </div>
              <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
                <p className="text-xs text-amber-700 mb-0.5 font-medium">XP Diperoleh</p>
                <p className="text-xl font-bold text-amber-700 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                  +{quizResult.xp_earned} XP
                </p>
              </div>
              <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100">
                <p className="text-xs text-purple-700 mb-0.5 font-medium">Level Terkini</p>
                <p className="text-xl font-bold text-purple-700">
                  Level {quizResult.current_level}
                </p>
              </div>
            </div>

            {/* Achievement Toast */}
            {quizResult.score_percentage === 100 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold mb-6 animate-pulse">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Luar Biasa! Anda membuka Badge Khusus: Juara Kuis Akademik</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={fetchQuestions}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#245CF5] hover:bg-blue-600 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Kuis</span>
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
              >
                <span>Kembali ke Dashboard</span>
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 text-[#245CF5] hover:bg-blue-50 font-semibold text-sm transition-colors"
              >
                <span>Tanya Asisten di Chat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#245CF5]" />
                <span>Pembahasan & Penjelasan Resmi Regulasi Kampus</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {quizResult.review?.length} Soal Dianalisis
              </span>
            </div>

            <div className="space-y-4">
              {quizResult.review?.map((item, idx) => (
                <div
                  key={item.question_id || idx}
                  className={`p-4 md:p-5 rounded-xl border transition-all ${
                    item.is_correct
                      ? 'bg-emerald-50/20 border-emerald-200/80'
                      : 'bg-red-50/20 border-red-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Soal {idx + 1}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    {item.is_correct ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100/60 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Kurang Tepat
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mb-3">
                    {item.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    <div className={`p-2.5 rounded-lg border ${
                      item.is_correct ? 'bg-emerald-100/40 border-emerald-300 text-emerald-900 font-medium' : 'bg-red-100/40 border-red-300 text-red-900'
                    }`}>
                      <span className="font-semibold block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Pilihan Anda:</span>
                      Opsi {item.user_selected_option_id}
                    </div>

                    {!item.is_correct && (
                      <div className="p-2.5 rounded-lg border bg-emerald-100/40 border-emerald-300 text-emerald-900 font-medium">
                        <span className="font-semibold block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Kunci Jawaban:</span>
                        Opsi {item.correct_option_id}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/80 rounded-lg p-3 text-xs text-slate-700 border border-slate-200/60 leading-relaxed">
                    <span className="font-bold text-slate-900">Dasar Regulasi: </span>
                    {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE QUESTION VIEW */
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          {/* Progress Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-bold">
                  Pertanyaan {currentIndex + 1} dari {totalQuestions}
                </span>
                {currentQuestion?.category && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-[#245CF5] font-semibold border border-blue-100/50">
                    {currentQuestion.category}
                  </span>
                )}
              </div>
              <span className="text-[#245CF5]">
                {answeredCount} / {totalQuestions} Terjawab ({Math.round((answeredCount / totalQuestions) * 100)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#245CF5] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Quick Selector Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {questions.map((q, idx) => {
                const isSelected = selectedAnswers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-[#245CF5] ring-2 ring-blue-200'
                        : isSelected
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                    title={`Lompat ke Soal ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Current Question Text */}
          <div className="py-2">
            <h3 className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQuestion?.question}
            </h3>
          </div>

          {/* Option Cards */}
          <div className="space-y-3">
            {currentQuestion?.options?.map((option) => {
              const isChosen = selectedAnswers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isChosen
                      ? 'bg-blue-50/60 border-[#245CF5] ring-1 ring-[#245CF5] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                      isChosen
                        ? 'bg-[#245CF5] text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {option.id}
                  </div>
                  <p className={`text-sm leading-relaxed ${isChosen ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                    {option.text}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                currentIndex === 0
                  ? 'border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || answeredCount < totalQuestions}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-sm ${
                  answeredCount === totalQuestions && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kirim & Periksa Jawaban</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-[#245CF5] hover:bg-blue-600 text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
