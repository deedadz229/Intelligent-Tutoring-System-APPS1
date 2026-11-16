import React from 'react';

export const PageHeader = ({ title, subtitle, rightElement }) => {
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date()).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {rightElement ? (
          rightElement
        ) : (
          <span className="text-xs font-semibold tracking-wider text-slate-500 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
            {todayFormatted}
          </span>
        )}
      </div>
    </div>
  );
};
