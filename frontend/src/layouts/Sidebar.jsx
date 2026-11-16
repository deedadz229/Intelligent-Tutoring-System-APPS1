import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  HelpCircle,
  Zap,
  Award,
  Trophy,
  User,
  ArrowRight,
  GraduationCap,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Assistant', icon: MessageSquareText },
  { path: '/quiz', label: 'Kuis Akademik', icon: HelpCircle },
  { path: '/quests', label: 'Daily Quest', icon: Zap, hasBadge: true },
  { path: '/achievements', label: 'Achievements', icon: Award },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/profile', label: 'Profile', icon: User },
];

export const Sidebar = ({ onCloseMobile }) => {
  const { profile, questsData } = useGamification();
  const { user, logout } = useAuth();
  const location = useLocation();

  const pendingQuestsCount = questsData?.quests?.filter((q) => !q.is_completed).length || 0;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/70 h-full flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-100/80">
          <RouterNavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-[#245CF5] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Academic
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Assistant ITS
              </p>
            </div>
          </RouterNavLink>
        </div>

        {/* Navigation Links */}
        <div className="px-4 py-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2.5">
            Workspace
          </p>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <RouterNavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#245CF5] shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#245CF5]' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.hasBadge && pendingQuestsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      {pendingQuestsCount}
                    </span>
                  )}
                </RouterNavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* Promotional / Motivation Card */}
        <div className="bg-[#F5F3FF] rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-1 text-xs font-bold text-[#7C3AED] mb-1">
            <Sparkles className="w-3.5 h-3.5 fill-purple-400" />
            <span>A little every day</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Tingkatkan level akademikmu dengan satu pertanyaan berkualitas hari ini.
          </p>
          <RouterNavLink
            to="/chat"
            onClick={onCloseMobile}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] hover:text-purple-800 transition-colors"
          >
            <span>Mulai eksplorasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </RouterNavLink>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
          <RouterNavLink
            to="/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {(user?.full_name || profile?.full_name)?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || profile?.full_name || 'Mahasiswa ITS'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.nim ? `NIM: ${user.nim}` : `Level ${profile?.level || 1}`}
              </p>
            </div>
          </RouterNavLink>

          <button
            onClick={() => logout()}
            title="Keluar / Logout"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
