import React from 'react';
import { Info } from 'lucide-react';

export const AcademicDisclaimer = ({ className = '' }) => {
  return (
    <footer className={`mt-8 pt-4 pb-6 text-xs text-slate-500 border-t border-slate-200/60 flex items-start gap-2 ${className}`}>
      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-slate-700">Academic Disclaimer:</span>{' '}
        Sistem ini merupakan prototipe asisten cerdas edukatif berbasis dataset FAQ akademik (8.391 pasang tanya-jawab) yang diproses melalui algoritma TF-IDF Cosine Similarity & Fuzzy Matching. Jawaban disajikan untuk tujuan informasi akademik mandiri dan tidak menggantikan keputusan resmi pihak universitas.
      </div>
    </footer>
  );
};
