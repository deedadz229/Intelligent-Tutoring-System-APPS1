import React from 'react';
import { Sparkles } from 'lucide-react';

export const XPProgress = ({
  level = 1,
  levelTitle = 'Mahasiswa Baru',
  totalXp = 0,
  minXp = 0,
  nextLevelXp = 100,
  xpNeeded = 100,
  percentage = 0,
  variant = 'purple', // 'blue' | 'purple'
}) => {
  const barColor = variant === 'blue' ? 'bg-[#245CF5]' : 'bg-[#8B5CF6]';
  const badgeBg = variant === 'blue' ? 'bg-blue-50 text-[#245CF5]' : 'bg-purple-50 text-[#7C3AED]';

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${badgeBg}`}>
            {String(level).padStart(2, '0')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                {levelTitle}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Level {level}
            </h3>
            <p className="text-xs text-slate-500">
              {totalXp.toLocaleString()} total XP terkumpul
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold text-slate-700">
            {xpNeeded > 0 ? `${xpNeeded} XP menuju Level ${level + 1}` : 'Level Maksimal'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-medium">
        <span>{minXp} XP</span>
        <span className="font-bold text-slate-700">{percentage.toFixed(1)}%</span>
        <span>{nextLevelXp} XP</span>
      </div>
    </div>
  );
};
