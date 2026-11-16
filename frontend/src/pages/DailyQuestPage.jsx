import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Target,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { QuestCard } from '../components/quest/QuestCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useGamification } from '../context/GamificationContext';

export const DailyQuestPage = () => {
  const navigate = useNavigate();
  const { questsData, loading, error, refreshGamification, completeQuestAction } = useGamification();

  const [completingId, setCompletingId] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Knowledge check state
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (loading && !questsData) {
    return <LoadingState message="Memuat Daily Quests..." className="py-20" />;
  }

  if (error && !questsData) {
    return (
      <ErrorState
        title="Gagal Memuat Daily Quests"
        message={error}
        onRetry={refreshGamification}
        className="py-16"
      />
    );
  }

  const quests = questsData?.quests || [];
  const completedCount = quests.filter((q) => q.is_completed).length;
  const totalCount = quests.length || 4;
  const earnedXp = quests
    .filter((q) => q.is_completed)
    .reduce((sum, q) => sum + (q.xp_reward || 0), 0);
  const totalPossibleXp = quests.reduce((sum, q) => sum + (q.xp_reward || 0), 0);
  const completionPercentage = Math.round((completedCount / Math.max(1, totalCount)) * 100);

  const handleClaimQuest = async (questId) => {
    try {
      setCompletingId(questId);
      const res = await completeQuestAction(questId);
      setSuccessBanner({
        message: res.message || 'Selamat! Quest berhasil diselesaikan.',
        xp: res.xp_awarded,
        levelUp: res.level_up,
      });

      setTimeout(() => {
        setSuccessBanner(null);
      }, 5000);
    } catch (err) {
      alert(err.message || 'Gagal mengklaim quest');
    } finally {
      setCompletingId(null);
    }
  };

  const handleQuestAction = (quest) => {
    if (quest.id === 'quest_first_faq' || quest.id === 'quest_curriculum') {
      navigate('/chat');
    } else if (quest.id === 'quest_feedback') {
      navigate('/chat');
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Small steps. Smarter every day."
        subtitle="Bangun pemahaman akademik langkah demi langkah dan kumpulkan reward XP harian."
      />

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">{successBanner.message}</p>
              <p className="text-[11px] text-emerald-700 font-medium">
                +{successBanner.xp} XP telah ditambahkan secara persisten ke profil Anda.
                {successBanner.levelUp && ' — Selamat! Anda telah naik level!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Banner Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              Daily Challenge
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
              A stronger start to your semester
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500 font-medium">
              {completedCount} dari {totalCount} selesai · {earnedXp} dari {totalPossibleXp} XP
            </p>
            <p className="text-lg font-extrabold text-[#245CF5]">
              {completionPercentage}% Selesai
            </p>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#245CF5] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Grid of Daily Quests */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Daftar Misi Harian ({quests.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={handleClaimQuest}
              isCompleting={completingId === quest.id}
              onActionClick={handleQuestAction}
            />
          ))}
        </div>
      </div>

      {/* Bottom Knowledge Check Section (Matching Reference Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left: Quick Knowledge Check (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#245CF5] mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Quick Knowledge Check</span>
          </div>

          <h4 className="text-base font-bold text-slate-900 mb-2">
            Kapan permohonan cuti akademik harus diajukan oleh mahasiswa?
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Berdasarkan Buku Pedoman Akademik FAQ resmi. Pilih jawaban yang benar:
          </p>

          <div className="space-y-2.5 mb-4">
            {[
              { id: 'opt1', text: 'Pada awal semester (sebelum perkuliahan dimulai) kepada Dekan/Direktur', correct: true },
              { id: 'opt2', text: 'Setelah ujian akhir semester selesai dilaksanakan', correct: false },
              { id: 'opt3', text: 'Kapan saja secara lisan tanpa surat permohonan', correct: false },
            ].map((option) => (
              <label
                key={option.id}
                onClick={() => {
                  setSelectedQuizOption(option.id);
                  setQuizSubmitted(true);
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs font-medium cursor-pointer transition-all ${
                  selectedQuizOption === option.id
                    ? option.correct
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                      : 'border-red-300 bg-red-50/50 text-red-900'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                }`}
              >
                <input
                  type="radio"
                  name="quiz"
                  checked={selectedQuizOption === option.id}
                  onChange={() => {}}
                  className="mt-0.5 text-[#245CF5]"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>

          {quizSubmitted && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              selectedQuizOption === 'opt1'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              {selectedQuizOption === 'opt1' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tepat sekali! Permohonan cuti akademik diajukan pada awal semester sebelum batas registrasi ditutup.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Belum tepat. Sesuai Buku Pedoman Akademik, cuti harus diajukan di awal semester kepada Dekan/Direktur.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Motivation card (4 cols) */}
        <div className="lg:col-span-4 bg-[#F5F3FF] rounded-3xl p-6 border border-purple-100 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-[#7C3AED] mb-2">
              A little learning goes a long way.
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Ketentuan dan regulasi kampus dapat diperbarui sewaktu-waktu. Selalu verifikasi tanggal penting dan persyaratan akademik melalui asisten cerdas atau portal resmi.
            </p>
          </div>

          <button
            onClick={() => navigate('/chat')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 text-[#7C3AED] text-xs font-bold rounded-xl transition-colors shadow-2xs border border-purple-200/50"
          >
            <span>Tanya AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
