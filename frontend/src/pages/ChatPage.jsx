import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Plus,
  Compass,
  BookOpen,
  HelpCircle,
  FolderOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { SuggestedTopics } from '../components/chat/SuggestedTopics';
import { chatbotService } from '../services/chatbotService';
import { useGamification } from '../context/GamificationContext';

const DEFAULT_SAMPLES = [
  'Bagaimana cara mengajukan cuti?',
  'Kapan Buku Pedoman Akademik Program Sarjana UIN Sunan Kalijaga ini diterbitkan?',
  'Apa makna dari Core Value Integratif-Interkonektif?',
  'Apa visii uin sunan kalijaga?',
  'Bagaimana prosedur registrasi KRS?',
];

export const ChatPage = () => {
  const { userId, refreshGamification } = useGamification();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      status: 'answer_found',
      answer:
        'Halo! Saya Academic Assistant ITS, asisten cerdas untuk layanan informasi dan panduan akademik. Anda dapat menanyakan tentang registrasi mata kuliah, KRS, cuti kuliah, ujian munaqosyah, atau ketentuan akademik lainnya.',
      category: 'Layanan Akademik',
      matchMethod: 'cosine_similarity',
      score: 1.0,
      executionTimeMs: 1.2,
    },
  ]);

  const [categories, setCategories] = useState([]);
  const [sampleQuestions, setSampleQuestions] = useState(DEFAULT_SAMPLES);
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [isLoading, setIsLoading] = useState(false);
  const [chatCounter, setChatCounter] = useState(2);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load FAQ Categories & Samples on mount
  useEffect(() => {
    const loadFaqMetadata = async () => {
      try {
        const [catsRes, samplesRes] = await Promise.allSettled([
          chatbotService.getCategories(),
          chatbotService.getSamples(6),
        ]);

        if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value)) {
          setCategories(catsRes.value);
        }
        if (samplesRes.status === 'fulfilled' && Array.isArray(samplesRes.value) && samplesRes.value.length > 0) {
          setSampleQuestions(samplesRes.value);
        }
      } catch (err) {
        console.error('Error loading FAQ metadata:', err);
      }
    };

    loadFaqMetadata();
  }, []);

  const handleSendMessage = async (userQuestion) => {
    if (!userQuestion || isLoading) return;

    const userMsgId = chatCounter;
    const botMsgId = chatCounter + 1;
    setChatCounter((prev) => prev + 2);

    // 1. Append user message
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: userQuestion,
      timestamp: new Date().toISOString(),
    };

    // 2. Append temporary bot loading message
    const loadingMessage = {
      id: botMsgId,
      sender: 'bot',
      status: 'loading',
      text: '',
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      // 3. Call backend POST /api/process
      const response = await chatbotService.processQuestion(userQuestion, userId);

      // 4. Update bot message with real response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                status: response.status, // 'answer_found' | 'no_answer'
                answer: response.answer,
                category: response.category,
                matchMethod: response.match_method,
                score: response.score,
                matchedQuestion: response.matched_question,
                executionTimeMs: response.execution_time_ms,
                accuracyLevel: response.accuracy_level,
                xpEarned: response.xp_earned || 0,
              }
            : msg
        )
      );

      // 5. Trigger gamification refresh (sync daily quest progress & achievements in background)
      refreshGamification();
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                status: 'error',
                text: err.message || 'Gagal menghubungi server chatbot FAQ. Silakan coba kembali.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async ({ chatId, rating, comment }) => {
    try {
      await chatbotService.submitFeedback({
        chatId,
        rating,
        comment,
        userId,
      });
      refreshGamification();
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        status: 'answer_found',
        answer: 'Percakapan baru telah dimulai. Silakan ajukan pertanyaan seputar akademik!',
        category: 'Layanan Akademik',
        matchMethod: 'cosine_similarity',
        score: 1.0,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your questions, a clearer path."
        subtitle="Eksplorasi regulasi dan pedoman akademik dengan chatbot cerdas berbasis dataset FAQ."
      />

      {/* Two Column Layout: Categories Sidebar & Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Subpanel: Explore FAQ Categories (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-[#245CF5]" />
              <h3 className="text-sm font-bold text-slate-900">Eksplorasi Topik FAQ</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pilih kategori atau klik contoh pertanyaan untuk memulai.
            </p>

            {/* Category list */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('Semua Kategori')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                  selectedCategory === 'Semua Kategori'
                    ? 'bg-[#EEF2FF] text-[#245CF5]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Semua Topik FAQ</span>
                <span className="text-[10px] text-slate-500 font-normal">8.391 FAQ</span>
              </button>

              {categories.slice(0, 8).map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                    selectedCategory === cat.category
                      ? 'bg-[#EEF2FF] text-[#245CF5]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.category}</span>
                  <span className="text-[10px] text-slate-500 font-normal shrink-0 ml-2">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dataset Info Card */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#7C3AED] mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Sumber Data Terverifikasi</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Jawaban diambil secara deterministik dari dataset Buku Pedoman Akademik menggunakan Cosine Similarity (threshold 0.35) dan RapidFuzz (threshold 75).
            </p>
          </div>
        </div>

        {/* Right Main Chat Window (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col min-h-[620px] max-h-[780px]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#245CF5] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Academic Assistant</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                </h3>
                <p className="text-[11px] text-slate-500">
                  Didukung TF-IDF Vectorizer & RapidFuzz Matcher
                </p>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sesi Baru</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onFeedback={handleFeedback} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts & Chat Input */}
          <div className="shrink-0 pt-2 border-t border-slate-100">
            <SuggestedTopics
              suggestions={sampleQuestions.slice(0, 3)}
              onSelect={handleSendMessage}
            />

            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ketik pertanyaan akademik (misal: 'Bagaimana cara mengajukan cuti?')..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
