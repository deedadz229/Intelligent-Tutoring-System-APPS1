import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gamificationService } from '../services/gamificationService';
import { healthService } from '../services/healthService';
import { useAuth } from './AuthContext';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || null;
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [questsData, setQuestsData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGamificationData = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setProgress(null);
      setQuestsData(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [profileRes, progressRes, questsRes, healthRes] = await Promise.allSettled([
        gamificationService.getProfile(userId),
        gamificationService.getProgress(userId),
        gamificationService.getQuests(userId),
        healthService.getHealth(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }
      if (progressRes.status === 'fulfilled') {
        setProgress(progressRes.value);
      }
      if (questsRes.status === 'fulfilled') {
        setQuestsData(questsRes.value);
      }
      if (healthRes.status === 'fulfilled') {
        setSystemHealth(healthRes.value);
      }

      if (profileRes.status === 'rejected') {
        throw profileRes.reason;
      }
    } catch (err) {
      console.error('Error fetching gamification context:', err);
      setError(err.message || 'Gagal memuat status gamifikasi');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const completeQuestAction = async (questId) => {
    try {
      const result = await gamificationService.completeQuest(questId, userId);
      // Refresh profile and quests after successful claim
      await fetchGamificationData();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return (
    <GamificationContext.Provider
      value={{
        userId,
        profile,
        progress,
        questsData,
        systemHealth,
        loading,
        error,
        refreshGamification: fetchGamificationData,
        completeQuestAction,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
