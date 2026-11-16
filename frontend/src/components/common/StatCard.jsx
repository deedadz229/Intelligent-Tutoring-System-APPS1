import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-amber-50',
  iconColor = 'text-amber-600',
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex items-start gap-4 transition-all hover:shadow-md ${className}`}>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
          {title}
        </p>
        <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
