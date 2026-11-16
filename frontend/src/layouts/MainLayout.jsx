import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AcademicDisclaimer } from '../components/common/AcademicDisclaimer';
import { X } from 'lucide-react';

const MOBILE_PILL_LINKS = [
  { path: '/', label: 'Dashboard' },
  { path: '/chat', label: 'AI Assistant' },
  { path: '/quiz', label: 'Kuis Akademik' },
  { path: '/quests', label: 'Daily Quest' },
  { path: '/achievements', label: 'Achievements' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/profile', label: 'Profile' },
];

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F1F4F9] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar onToggleMobile={() => setMobileOpen(true)} />

        {/* Mobile Horizontal Pill Navigation (Inspired by Reference Mobile Design) */}
        <div className="md:hidden bg-white border-b border-slate-200/60 px-4 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
          {MOBILE_PILL_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-xs font-semibold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#245CF5] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <div className="max-w-7xl mx-auto flex flex-col min-h-full justify-between">
            <div>
              <Outlet />
            </div>

            <AcademicDisclaimer />
          </div>
        </main>
      </div>
    </div>
  );
};
