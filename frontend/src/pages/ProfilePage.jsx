import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Sparkles,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  Settings,
  Bell,
  Eye,
  LogOut,
  Fingerprint,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { XPProgress } from '../components/common/XPProgress';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { profile, progress, loading, error, refreshGamification } = useGamification();
  const { user: authUser, logout } = useAuth();

  const [reminderActive, setReminderActive] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(true);

  if (loading && !profile) {
    return <LoadingState message="Memuat data profil mahasiswa..." className="py-20" />;
  }

  if (error && !profile) {
    return (
      <ErrorState
        title="Gagal Memuat Profil"
        message={error}
        onRetry={refreshGamification}
        className="py-16"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your learning, at a glance."
        subtitle="Rangkuman profil akademik, rekam jejak XP, dan progres leveling belajar Anda."
      />

      {/* Main Profile Identity Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
            {(authUser?.full_name || profile?.full_name)?.charAt(0) || 'M'}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                {profile?.level_title || 'Mahasiswa Baru'} · Level {profile?.level || 1}
              </span>
              {authUser?.is_demo ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Akun Demo (Pengujian)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Mahasiswa Terverifikasi
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              {authUser?.full_name || profile?.full_name || 'Mahasiswa ITS'}
            </h2>
            <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2 mt-1">
              {authUser?.nim && (
                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  NIM: {authUser.nim}
                </span>
              )}
              <span>@{authUser?.username || profile?.username || 'mahasiswa_its'}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {authUser?.email || profile?.email || 'student@its.ac.id'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Semester Ganjil 2026/2027</span>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer border border-rose-100"
            title="Keluar dari akun saat ini"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Learning Snapshot & Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Snapshot XP & Badges (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-sm font-bold text-slate-900">
            Learning Snapshot
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Total XP
              </span>
              <p className="text-2xl font-extrabold text-amber-900 mt-1">
                {(profile?.total_xp || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-amber-700 font-medium">Poin terkumpul</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Lencana
              </span>
              <p className="text-2xl font-extrabold text-purple-900 mt-1">
                {progress?.achievements_unlocked || profile?.unlocked_achievements_count || 1}
              </p>
              <span className="text-[11px] text-purple-700 font-medium">Dari 5 lencana</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
              <span>Progres Level {profile?.level || 1}</span>
              <span>{profile?.progress_percentage?.toFixed(1) || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#245CF5] transition-all duration-500"
                style={{ width: `${profile?.progress_percentage || 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {profile?.xp_needed_for_next_level || 0} XP lagi menuju Level {(profile?.level || 1) + 1}.
            </p>
          </div>
        </div>

        {/* Right: Recent Activity / Milestones (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Aktivitas Pembelajaran Terverifikasi
          </h3>

          <div className="space-y-3">
            {[
              {
                title: 'Menyelesaikan Misi Login Harian',
                desc: 'Aktivitas eksplorasi sistem hari ini',
                xp: '+20 XP',
                tag: 'Daily Quest',
                time: 'Hari ini',
              },
              {
                title: 'Membuka Lencana "Langkah Perdana"',
                desc: 'Mengajukan pertanyaan pertama ke chatbot FAQ akademik',
                xp: '+50 XP',
                tag: 'Milestone',
                time: 'Tercatat di server',
              },
              {
                title: 'Eksplorasi Regulasi KRS & Kurikulum',
                desc: 'Mencari informasi tentang ketentuan beban SKS dan syarat cuti',
                xp: 'Terdata',
                tag: 'Akademik',
                time: 'Tercatat di server',
              },
            ].map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{act.title}</h5>
                    <p className="text-[11px] text-slate-500">{act.desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600">{act.xp}</span>
                  <span className="text-[10px] text-slate-400 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences Section (Matching Reference Design) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Preferensi Belajar
        </h3>

        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Pengingat Misi Harian</p>
                <p className="text-[11px] text-slate-500">Notifikasi motivasi untuk menjaga streak belajar setiap hari.</p>
              </div>
            </div>
            <button
              onClick={() => setReminderActive(!reminderActive)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                reminderActive ? 'bg-[#245CF5]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  reminderActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Eye className="w-4 h-4 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">Visibilitas Leaderboard</p>
                <p className="text-[11px] text-slate-500">Tampilkan nama dan akumulasi XP Anda di papan peringkat mahasiswa.</p>
              </div>
            </div>
            <button
              onClick={() => setLeaderboardVisible(!leaderboardVisible)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                leaderboardVisible ? 'bg-[#245CF5]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  leaderboardVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
