import React from 'react';
import { HelpCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = HelpCircle,
  title = 'Belum Ada Data',
  description = 'Data aktivitas atau riwayat belum tersedia.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-100 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#245CF5] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
