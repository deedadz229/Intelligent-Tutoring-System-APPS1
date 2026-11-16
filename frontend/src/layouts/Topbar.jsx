import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, Menu, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';

const ROUTE_NAMES = {
  '/': 'Dashboard',
  '/chat': 'AI Assistant',
  '/quiz': 'Kuis Akademik',
  '/quests': 'Daily Quest',
  '/achievements': 'Achievements',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Profile',
};

export const Topbar = ({ onToggleMobile }) => {
  const { profile, systemHealth } = useGamification();
  const { user: authUser, logout } = useAuth();
  const location = useLocation();

  const currentTitle = ROUTE_NAMES[location.pathname] || 'Workspace';
  const isHealthy = systemHealth?.status === 'healthy';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">{currentTitle}</span>
        </div>
      </div>

      {/* Right: Server Status, XP Badge, and Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Server Status Indicator */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isHealthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
              : 'bg-red-50 text-red-600 border-red-200/50'
          }`}
          title={isHealthy ? 'Backend FastAPI & Model NLP Terhubung' : 'Backend belum terhubung'}
        >
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
          <span>{isHealthy ? 'NLP Engine Aktif' : 'Server Terputus'}</span>
        </div>

        {/* Live XP Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF6E9] text-[#B45309] font-bold text-xs border border-amber-200/60 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{(profile?.total_xp || 0).toLocaleString()} XP</span>
        </div>

        {/* User Avatar & NIM */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors"
          title="Lihat Profil Mahasiswa"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {profile?.full_name?.charAt(0) || authUser?.full_name?.charAt(0) || 'M'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[120px]">
              {profile?.full_name || authUser?.full_name || 'Mahasiswa'}
            </span>
            <span className="block text-[10px] text-slate-400">
              {authUser?.nim ? `NIM: ${authUser.nim}` : 'ITS Student'}
            </span>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          title="Keluar / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
