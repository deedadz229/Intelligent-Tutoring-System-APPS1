import React, { useState, useEffect } from 'react';
import { Award, Sparkles, Trophy, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { XPProgress } from '../components/common/XPProgress';
import { AchievementBadge } from '../components/achievement/AchievementBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { gamificationService } from '../services/gamificationService';
import { useGamification } from '../context/GamificationContext';

export const AchievementsPage = () => {
  const { profile, userId } = useGamification();
  const [achievementsData, setAchievementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await gamificationService.getAchievements(userId);
      setAchievementsData(res);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err.message || 'Gagal memuat daftar achievements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  if (loading && !achievementsData) {
    return <LoadingState message="Memuat koleksi achievements..." className="py-20" />;
  }

  if (error && !achievementsData) {
    return (
      <ErrorState
        title="Gagal Memuat Achievements"
        message={error}
        onRetry={fetchAchievements}
        className="py-16"
      />
    );
  }

  const achievements = achievementsData?.achievements || [];
  const totalUnlocked = achievementsData?.total_unlocked || 0;
  const totalAvailable = achievementsData?.total_available || achievements.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Every milestone tells a story."
        subtitle="Kumpulkan lencana prestasi dari setiap aktivitas belajar dan tanya jawab akademik."
      />

      {/* Top Level Progression Card */}
      <XPProgress
        level={profile?.level || 1}
        levelTitle={profile?.level_title || 'Mahasiswa Baru'}
        totalXp={profile?.total_xp || 0}
        minXp={profile?.current_level_min_xp || 0}
        nextLevelXp={profile?.next_level_min_xp || 100}
        xpNeeded={profile?.xp_needed_for_next_level || 100}
        percentage={profile?.progress_percentage || 0}
        variant="purple"
      />

      {/* Badges Collection Grid */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Koleksi Lencana ({totalUnlocked} dari {totalAvailable} Terbuka)</span>
          </h3>

          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/50">
            {totalUnlocked} Lencana Terkumpul
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((ach) => (
            <AchievementBadge key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>

      {/* Next Milestone Card (Matching Reference Visual) */}
      <div className="bg-[#F5F3FF] border border-purple-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
            Next Milestone
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-1">
            Menuju Level {(profile?.level || 1) + 1}: Cendekiawan Mandiri
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            Kumpulkan {profile?.xp_needed_for_next_level || 50} XP lagi melalui penyelesaian daily quests untuk membuka badge berikutnya.
          </p>
        </div>

        <div className="shrink-0">
          <a
            href="/quests"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <span>Lihat Misi Tersedia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
