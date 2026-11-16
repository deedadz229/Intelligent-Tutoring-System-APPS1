import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  BookOpen,
  Award,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { XPProgress } from '../components/common/XPProgress';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export const Dashboard = () => {
  const { profile, progress, questsData, loading, error, refreshGamification } = useGamification();

  if (loading) {
    return <LoadingState message="Memuat dasbor akademik..." className="py-20" />;
  }

  if (error && !profile) {
    return (
      <ErrorState
        title="Gagal Memuat Dasbor"
        message={error}
        onRetry={refreshGamification}
        className="py-16"
      />
    );
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Selamat pagi' : currentHour < 17 ? 'Selamat siang' : 'Selamat malam';

  const studentName = profile?.full_name || 'Mahasiswa ITS';
  const ongoingQuest = questsData?.quests?.find((q) => !q.is_completed) || questsData?.quests?.[0];
  const completedQuestsCount = questsData?.completed_count || 0;
  const totalQuestsCount = questsData?.total_quests || 4;
  const questPercentage = Math.round((completedQuestsCount / Math.max(1, totalQuestsCount)) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="A little curiosity. A lot of progress."
        subtitle="Lanjutkan eksplorasi akademik dan kumpulkan pencapaian belajarmu hari ini."
      />

      {/* Hero Card Banner */}
      <div className="bg-[#245CF5] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/15">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none transform translate-x-32 -translate-y-32"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Your Academic Companion
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-1 tracking-tight text-white">
              {greeting}, {studentName}
            </h2>
            <p className="text-sm text-blue-100/90 mt-2 leading-relaxed">
              Tanyakan seputar regulasi perkuliahan, registrasi KRS, cuti kuliah, hingga prosedur skripsi dari pedoman resmi berbasis FAQ.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-xs text-blue-50 hidden sm:block">
              <span className="font-semibold text-white block">"Bagaimana cara mengajukan cuti?"</span>
              <span className="text-blue-200 text-[11px]">Pedoman Akademik · FAQ Terverifikasi</span>
            </div>

            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-[#245CF5] hover:bg-blue-50 text-xs font-bold rounded-2xl transition-all shadow-md shadow-black/5 hover:scale-[1.02]"
            >
              <span>Buka AI Assistant</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Total Experience"
          value={`${(profile?.total_xp || 0).toLocaleString()} XP`}
          subtitle="Poin pengalaman belajar terkumpul"
          icon={Sparkles}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="Current Level"
          value={String(profile?.level || 1).padStart(2, '0')}
          subtitle={profile?.level_title || 'Mahasiswa Baru'}
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Learning Streak"
          value={`${profile?.current_streak || 1} Hari`}
          subtitle="Konsistensi aktivitas belajar aktif"
          icon={Flame}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Dynamic Level Progress Bar */}
      <XPProgress
        level={profile?.level || 1}
        levelTitle={profile?.level_title || 'Mahasiswa Baru'}
        totalXp={profile?.total_xp || 0}
        minXp={profile?.current_level_min_xp || 0}
        nextLevelXp={profile?.next_level_min_xp || 250}
        xpNeeded={profile?.xp_needed_for_next_level || 100}
        percentage={profile?.progress_percentage || 0}
        variant="purple"
      />

      {/* Interactive Academic Quiz Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-[#245CF5] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-blue-100">
                Aktivitas Interaktif
              </span>
              <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-300" /> Hingga +75 XP
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white">
              Tantangan Kuis Regulasi Akademik ITS
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed max-w-xl">
              Uji pemahaman Anda seputar batas SKS, cuti kuliah, syarat wisuda, dan evaluasi studi dari kurikulum resmi kampus.
            </p>
          </div>
        </div>

        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#245CF5] hover:bg-blue-50 text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <span>Mulai Kuis Sekarang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Two Column Section: Daily Quest & Little Wins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ongoing Daily Quest */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Daily Quest
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                +{ongoingQuest?.xp_reward || 30} XP
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {ongoingQuest?.title || 'Misi Harian Mahasiswa'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              {ongoingQuest?.description || 'Selesaikan misi harian untuk mengumpulkan XP dan meningkatkan level belajarmu.'}
            </p>

            {/* Progress bar */}
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <span>{completedQuestsCount} dari {totalQuestsCount} selesai</span>
                <span className="font-bold text-slate-700">{questPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#245CF5] transition-all duration-500"
                  style={{ width: `${questPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            to="/quests"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#245CF5] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <span>Lanjutkan Misi Harian</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right: Badges & Little Wins */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Little Wins, Lasting Progress
              </span>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                {progress?.achievements_unlocked || 0} dari {progress?.achievements_total || 5} badge
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Koleksi Badge & Prestasi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Setiap pencapaian belajar mencatat jejak kemajuan akademikmu.
            </p>

            {/* 3 Badge Previews */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#245CF5] flex items-center justify-center mx-auto mb-1.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold text-slate-800 truncate">Langkah Perdana</p>
                <span className="text-[10px] text-emerald-600 font-semibold block">50 XP</span>
              </div>

              <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-1.5">
                  <Award className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold text-slate-800 truncate">Rasa Ingin Tahu</p>
                <span className="text-[10px] text-purple-600 font-semibold block">100 XP</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-1.5">
                  <Zap className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold text-slate-800 truncate">Pemburu Quest</p>
                <span className="text-[10px] text-amber-600 font-semibold block">200 XP</span>
              </div>
            </div>
          </div>

          <Link
            to="/achievements"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] text-xs font-bold rounded-xl transition-colors border border-purple-200/50"
          >
            <span>Lihat Semua Badge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation / System Highlights */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#245CF5] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Status Korpus & Algoritma NLP Terverifikasi
              </h4>
              <p className="text-xs text-slate-500">
                8.391 pasang FAQ akademik aktif · TF-IDF Cosine Similarity & RapidFuzz terintegrasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/chat"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Mulai Tanya Jawab
            </Link>
            <Link
              to="/leaderboard"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Lihat Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
