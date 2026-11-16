import React from 'react';
import { Check, Sparkles, ArrowRight, Clock, Target } from 'lucide-react';

export const QuestCard = ({
  quest,
  onComplete,
  isCompleting = false,
  onActionClick,
}) => {
  const {
    id,
    title,
    description,
    target_count,
    current_count,
    xp_reward,
    category,
    is_completed,
    can_complete,
  } = quest;

  const progressPct = Math.min(100, Math.round(((current_count || 0) / (target_count || 1)) * 100));

  return (
    <div className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm border transition-all ${
      is_completed
        ? 'border-emerald-100 bg-emerald-50/20'
        : can_complete
        ? 'border-blue-200 ring-2 ring-blue-500/10'
        : 'border-slate-100 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {category || 'Misi'}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            Target: {target_count}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          +{xp_reward} XP
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        {description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1.5">
          <span>Progres: {current_count} dari {target_count}</span>
          <span className="font-semibold text-slate-700">{progressPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              is_completed ? 'bg-emerald-500' : 'bg-[#245CF5]'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        {is_completed ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Misi Selesai Hari Ini
          </div>
        ) : can_complete ? (
          <button
            onClick={() => onComplete && onComplete(id)}
            disabled={isCompleting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#245CF5] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            {isCompleting ? 'Mengklaim...' : 'Klaim Reward XP'}
          </button>
        ) : (
          <button
            onClick={() => onActionClick && onActionClick(quest)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#245CF5] text-xs font-semibold rounded-xl transition-colors border border-slate-200/60"
          >
            <span>Kerjakan Misi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
