import React, { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown, Sparkles, Check, AlertCircle, Clock, Zap } from 'lucide-react';

export const ChatMessage = ({
  message,
  onFeedback,
}) => {
  const {
    id,
    sender, // 'user' | 'bot'
    text,
    status, // 'answer_found' | 'no_answer' | 'loading' | 'error'
    answer,
    category,
    matchMethod,
    score,
    matchedQuestion,
    executionTimeMs,
    feedbackGiven,
    accuracyLevel,
    xpEarned,
  } = message;

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(feedbackGiven || false);

  const handleFeedbackClick = (rating) => {
    if (feedbackSubmitted) return;
    setFeedbackSubmitted(true);
    if (onFeedback) {
      onFeedback({
        chatId: id,
        rating,
        comment: rating >= 4 ? 'Jawaban sangat membantu' : 'Jawaban kurang memuaskan',
      });
    }
  };

  if (sender === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[85%] md:max-w-[70%] bg-[#EEF2FF] border border-blue-100 text-slate-900 rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#245CF5] flex items-center justify-center shrink-0 mt-1 shadow-xs border border-blue-100/50">
          <Bot className="w-4 h-4 animate-pulse" />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs px-5 py-4 shadow-sm max-w-[85%] md:max-w-[75%]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#245CF5] mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Academic Assistant sedang mencari jawaban dalam FAQ...</span>
          </div>
          <div className="space-y-2 animate-pulse">
            <div className="h-2.5 bg-slate-200 rounded-full w-48"></div>
            <div className="h-2.5 bg-slate-100 rounded-full w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-1">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="bg-white border border-red-100 rounded-2xl rounded-tl-xs p-5 shadow-sm max-w-[85%] md:max-w-[75%]">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
            Gangguan Koneksi
          </p>
          <p className="text-sm text-slate-700">{text || 'Gagal memproses pertanyaan ke backend. Pastikan server aktif.'}</p>
        </div>
      </div>
    );
  }

  // No answer found
  if (status === 'no_answer') {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4" />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs p-5 shadow-sm max-w-[85%] md:max-w-[80%]">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#245CF5]" />
              Academic Assistant
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              FAQ Dataset
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Informasi belum tersedia dalam pedoman FAQ.
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Pertanyaan Anda belum mencapai ambang batas kemiripan (Cosine Similarity &ge; 0.35 atau Fuzzy Matching &ge; 75). Sistem kami tidak mengarang jawaban demi integritas data akademik.
          </p>

          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 border border-slate-100">
            <span className="font-semibold text-slate-800">Saran:</span> Coba gunakan kata kunci spesifik seperti <span className="font-medium text-[#245CF5]">"cuti kuliah"</span>, <span className="font-medium text-[#245CF5]">"syarat KRS"</span>, <span className="font-medium text-[#245CF5]">"munaqosyah"</span>, atau <span className="font-medium text-[#245CF5]">"skripsi"</span>.
          </div>
        </div>
      </div>
    );
  }

  // Answer found
  const isCosine = matchMethod === 'cosine_similarity';
  const methodLabel = isCosine ? 'TF-IDF + Cosine Similarity' : 'Fuzzy Matching (Typo Tolerant)';
  const methodBadgeClass = isCosine
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
    : 'bg-purple-50 text-purple-700 border-purple-200/60';

  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#245CF5] flex items-center justify-center shrink-0 mt-1 shadow-xs border border-blue-100/60">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs p-5 md:p-6 shadow-sm max-w-[90%] md:max-w-[80%] flex-1">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#245CF5]" />
              Academic Assistant
            </span>
            {category && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {category}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {accuracyLevel && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                accuracyLevel === 'Tinggi'
                  ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-100/70 text-blue-800 border border-blue-200'
              }`}>
                Akurasi {accuracyLevel}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${methodBadgeClass}`}>
              {methodLabel}
            </span>
            {xpEarned > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 animate-bounce">
                <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                +{xpEarned} XP
              </span>
            )}
            {score !== undefined && score !== null && (
              <span className="text-[10px] font-medium text-slate-500">
                Skor: {typeof score === 'number' ? (score > 1 ? score.toFixed(1) : score.toFixed(3)) : score}
              </span>
            )}
            {executionTimeMs && (
              <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {executionTimeMs} ms
              </span>
            )}
          </div>
        </div>

        {/* Matched Question Hint (if slightly different) */}
        {matchedQuestion && (
          <div className="mb-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">FAQ Terkait:</span> "{matchedQuestion}"
          </div>
        )}

        {/* Main Answer Content */}
        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-4 font-normal">
          {answer || text}
        </div>

        {/* Feedback Section */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-medium">Apakah jawaban ini membantu?</span>
          {feedbackSubmitted ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Terima kasih atas penilaian Anda!
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedbackClick(5)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/60 transition-colors"
                title="Membantu"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Membantu</span>
              </button>
              <button
                onClick={() => handleFeedbackClick(2)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/60 transition-colors"
                title="Kurang Membantu"
              >
                <ThumbsDown className="w-3 h-3" />
                <span>Kurang</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
