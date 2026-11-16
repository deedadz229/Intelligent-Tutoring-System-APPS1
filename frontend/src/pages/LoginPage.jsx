import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  User,
  LogIn,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Mohon isi NIM/Username/Email dan password Anda.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        username_or_email: identifier.trim(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = async () => {
    setIdentifier('demo_mahasiswa');
    setPassword('DemoMahasiswa123!');
    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        username_or_email: 'demo_mahasiswa',
        password: 'DemoMahasiswa123!',
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Demo login error:', err);
      setError(err.message || 'Gagal login dengan akun demo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F4F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#245CF5] text-white shadow-lg shadow-blue-500/20 mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Academic Assistant ITS
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Chatbot Layanan Informasi & FAQ Akademik Berbasis Gamifikasi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl sm:px-10 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Masuk ke Portal
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Gunakan NIM, Username, atau Email universitas yang telah terdaftar.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIM / Username / Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: 5025211001 atau username"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245CF5] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  className="block w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#245CF5] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-[#245CF5] hover:bg-blue-600 focus:outline-hidden transition-all disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Akun'}</span>
            </button>
          </form>

          {/* Development Demo Login Helper */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium mb-3">
              Keperluan Pengujian & Review Asesor:
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-bold border border-amber-200/70 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Masuk Cepat sebagai Akun Demo (NIM: 5025211001)</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Belum memiliki akun? </span>
            <Link
              to="/register"
              className="font-bold text-[#245CF5] hover:underline"
            >
              Daftar Mahasiswa Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
