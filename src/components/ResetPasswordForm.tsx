"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!password || !confirmPassword) {
      setError('Semua field harus diisi.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: resetError } = await supabase.auth.updateUser({
        password: password,
      });

      if (resetError) {
        console.error('Reset password error:', resetError);
        
        // Handle specific error cases
        if (resetError.message?.includes('session_missing')) {
          setError('Sesi tidak valid. Silakan request reset password baru.');
        } else if (resetError.message?.includes('rate_limit')) {
          setError('Terlalu banyak percobaan. Silakan coba lagi nanti.');
        } else {
          setError(resetError.message || 'Terjadi kesalahan. Silakan coba lagi.');
        }
      } else {
        console.log('Password updated successfully:', data);
        setSuccess(true);
        
        // Sign out after successful password update to force re-login
        await supabase.auth.signOut();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/Lagi_ikon.png" alt="Lapor Giat Icon" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            Atur Ulang Password
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Masukkan password baru Anda
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              Password Berhasil Diubah!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Mengarahkan ke halaman login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
                <Lock className="inline-block w-4 h-4 mr-2 text-emerald-500" />
                Password Baru
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="********"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirmPassword">
                <Lock className="inline-block w-4 h-4 mr-2 text-emerald-500" />
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="********"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                <AlertCircle className="inline-block w-4 h-4 mr-2" />
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Atur Ulang Password</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;


