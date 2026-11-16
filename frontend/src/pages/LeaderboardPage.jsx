import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Sparkles, TrendingUp, Users, ArrowUp } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { gamificationService } from '../services/gamificationService';
import { useGamification } from '../context/GamificationContext';

export const LeaderboardPage = () => {
  const { profile, userId } = useGamification();
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await gamificationService.getLeaderboard(20);
      setLeaderboardData(res);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Gagal memuat papan peringkat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading && !leaderboardData) {
    return <LoadingState message="Memuat Leaderboard Mahasiswa..." className="py-20" />;
  }

  if (error && !leaderboardData) {
    return (
      <ErrorState
        title="Gagal Memuat Leaderboard"
        message={error}
        onRetry={fetchLeaderboard}
        className="py-16"
      />
    );
  }

  const list = leaderboardData?.leaderboard || [];
  const top1 = list[0];
  const top2 = list[1];
  const top3 = list[2];
  const others = list.slice(3);

  // Find user's rank
  const myRank = list.find((item) => item.user_id === (profile?.user_id || userId));
  const userRankIndex = list.findIndex((item) => item.user_id === (profile?.user_id || userId));
  const nextUserAbove = userRankIndex > 0 ? list[userRankIndex - 1] : null;
  const xpDifference = nextUserAbove && myRank ? nextUserAbove.total_xp - myRank.total_xp : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="A little friendly motivation."
        subtitle="Rayakan konsistensi belajar dan pencapaian akademik bersama mahasiswa lainnya."
      />

      {/* Top 3 Podium Cards (Matching Reference Layout) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Peringkat Teratas Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Akumulasi poin XP berdasarkan penyelesaian quest dan keaktifan FAQ.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
            Total {leaderboardData?.total_users || list.length} Mahasiswa
          </span>
        </div>

        {/* Podium Layout: #02 - #01 - #03 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* #02 Runner-up */}
          {top2 ? (
            <div className="bg-slate-50/80 rounded-2xl p-5 text-center border border-slate-100 flex flex-col items-center justify-between order-2 md:order-1 h-56">
              <span className="text-xs font-extrabold text-slate-400 self-end">#02</span>
              <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-700 font-extrabold text-lg flex items-center justify-center border-2 border-white shadow-xs">
                {top2.full_name?.charAt(0) || '2'}
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                  {top2.full_name}
                </h4>
                <p className="text-[11px] text-slate-500">{top2.level_title}</p>
                <p className="text-xs font-extrabold text-[#245CF5] mt-1">
                  {top2.total_xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 hidden md:block" />
          )}

          {/* #01 Champion (Highlighted Center) */}
          {top1 && (
            <div className="bg-[#FEF6E9] rounded-2xl p-6 text-center border border-amber-200/80 flex flex-col items-center justify-between order-1 md:order-2 h-64 shadow-md shadow-amber-500/5">
              <span className="text-xs font-extrabold text-amber-700 self-end flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                #01
              </span>
              <div className="w-16 h-16 rounded-full bg-amber-400 text-amber-950 font-black text-xl flex items-center justify-center border-4 border-white shadow-md">
                {top1.full_name?.charAt(0) || '1'}
              </div>
              <div className="mt-2">
                <h4 className="text-base font-bold text-slate-900 truncate max-w-[200px]">
                  {top1.full_name}
                </h4>
                <p className="text-xs text-amber-800 font-medium">{top1.level_title}</p>
                <p className="text-sm font-black text-amber-700 mt-1">
                  {top1.total_xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          )}

          {/* #03 Third Place */}
          {top3 ? (
            <div className="bg-slate-50/80 rounded-2xl p-5 text-center border border-slate-100 flex flex-col items-center justify-between order-3 h-52">
              <span className="text-xs font-extrabold text-slate-400 self-end">#03</span>
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 font-bold text-base flex items-center justify-center border-2 border-white shadow-xs">
                {top3.full_name?.charAt(0) || '3'}
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                  {top3.full_name}
                </h4>
                <p className="text-[11px] text-slate-500">{top3.level_title}</p>
                <p className="text-xs font-extrabold text-[#245CF5] mt-1">
                  {top3.total_xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          ) : (
            <div className="order-3 hidden md:block" />
          )}
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Daftar Lengkap Peringkat
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            XP Terkumpul
          </span>
        </div>

        <div className="space-y-2">
          {list.map((item) => {
            const isCurrentUser = item.user_id === (profile?.user_id || userId);

            return (
              <div
                key={item.user_id}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  isCurrentUser
                    ? 'bg-[#EEF2FF] border border-blue-200/80 shadow-xs'
                    : 'hover:bg-slate-50/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 text-xs font-extrabold text-center ${
                      item.rank === 1
                        ? 'text-amber-600'
                        : item.rank === 2
                        ? 'text-slate-600'
                        : item.rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {String(item.rank).padStart(2, '0')}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {item.full_name?.charAt(0) || 'M'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.full_name}
                      </span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#245CF5] text-white">
                          Anda
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Level {item.level} · {item.level_title}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-slate-800">
                  {item.total_xp.toLocaleString()} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Banner at Bottom */}
      {nextUserAbove && xpDifference > 0 && (
        <div className="bg-[#F5F3FF] border border-purple-100 rounded-3xl p-5 text-xs text-[#7C3AED] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <ArrowUp className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div>
            <span className="font-bold">
              Anda berjarak {xpDifference.toLocaleString()} XP dari posisi di atas Anda ({nextUserAbove.full_name})!
            </span>
            <p className="text-slate-600 mt-0.5 text-[11px]">
              Selesaikan misi harian dan terus lakukan eksplorasi FAQ untuk meraih peringkat lebih tinggi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
