import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { ChatPage } from './pages/ChatPage';
import { DailyQuestPage } from './pages/DailyQuestPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AcademicQuizPage } from './pages/AcademicQuizPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F4F9] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#245CF5] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Memverifikasi sesi akademik...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Student Portal Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="quiz" element={<AcademicQuizPage />} />
              <Route path="quests" element={<DailyQuestPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GamificationProvider>
    </AuthProvider>
  );
}

export default App;
