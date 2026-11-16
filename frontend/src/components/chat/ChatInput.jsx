import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, CornerDownLeft } from 'lucide-react';

export const ChatInput = ({ onSend, isLoading = false, placeholder = 'Tanyakan informasi akademik, KRS, cuti kuliah, atau ujian...' }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= 1000) {
      setText(val);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-sm border border-slate-200/80 p-2 transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden disabled:opacity-50 min-h-[44px] max-h-32"
      />

      <div className="flex items-center justify-between pt-1 px-2 border-t border-slate-50">
        <span className="text-[10px] text-slate-500">
          {text.length}/1000 karakter · Tekan Enter untuk kirim
        </span>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="w-8 h-8 rounded-full bg-[#245CF5] hover:bg-blue-600 text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:hover:bg-[#245CF5] shadow-xs cursor-pointer disabled:cursor-not-allowed"
          title="Kirim Pertanyaan"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </form>
  );
};
