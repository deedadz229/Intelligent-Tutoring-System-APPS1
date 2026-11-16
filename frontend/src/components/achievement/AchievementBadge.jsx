import React from 'react';
import { Award, Check, Lock, Sparkles, Trophy, BookOpen, Star, Crown } from 'lucide-react';

const getIconComponent = (code, isUnlocked) => {
  const iconClass = `w-6 h-6 ${isUnlocked ? 'text-[#245CF5]' : 'text-slate-400'}`;
  switch (code) {
    case 'FIRST_QUESTION':
      return <BookOpen className={iconClass} />;
    case 'CURIOUS_MIND':
      return <Star className={iconClass} />;
    case 'SCHOLAR_RANK':
      return <Award className={iconClass} />;
    case 'QUEST_HUNTER':
      return <Trophy className={iconClass} />;
    case 'ACADEMIC_MASTERY':
      return <Crown className={iconClass} />;
    default:
      return <Award className={iconClass} />;
  }
};

export const AchievementBadge = ({ achievement }) => {
  const {
    id,
    code,
    title,
    description,
    xp_reward,
    category,
    is_unlocked,
    unlocked_at,
  } = achievement;

  const dateFormatted = unlocked_at
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(unlocked_at))
    : null;

  return (
    <div
      className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm border transition-all flex flex-col justify-between ${
        is_unlocked
          ? 'border-blue-100/80 hover:shadow-md'
          : 'border-slate-100/90 opacity-75 bg-slate-50/40'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              is_unlocked ? 'bg-blue-50' : 'bg-slate-100'
            }`}
          >
            {getIconComponent(code, is_unlocked)}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200/50">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            +{xp_reward} XP
          </div>
        </div>

        <div className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {category}
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            {title}
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {is_unlocked ? (
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Terbuka {dateFormatted && `· ${dateFormatted}`}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Belum Terbuka</span>
          </div>
        )}
      </div>
    </div>
  );
};
