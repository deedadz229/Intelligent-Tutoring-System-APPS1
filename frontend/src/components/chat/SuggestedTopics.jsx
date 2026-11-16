import React from 'react';
import { Sparkles } from 'lucide-react';

export const SuggestedTopics = ({ suggestions = [], onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#245CF5]" />
        <span>Rekomendasi Topik FAQ:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect && onSelect(suggestion)}
            className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-[#245CF5] px-3 py-1.5 rounded-full border border-slate-200/80 transition-colors shadow-2xs text-left cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
