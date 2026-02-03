"use client";

import React, { useState } from 'react';
import { supabase, createProfileForNewUser } from '../services/supabaseService'; // Import createProfileForNewUser
import { Mail, Lock, LogIn, UserPlus, KeyRound } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Basic validation
    if (!email.trim() || !password) {
      setError('Email dan password harus diisi.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting authentication with:', { 
        email: email.trim(), 
        passwordLength: password.length,
        supabaseUrl: 'CONFIGURED',
        isLogin 
      });
      
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password: password 
        });
        console.log('Sign in response:', { data, error: signInError });
        if (signInError) {
          console.error('Sign in error details:', {
            message: signInError.message,
            status: signInError.status,
            name: signInError.name
          });
          throw signInError;
        }
        setMessage('Berhasil masuk!');
        onAuthSuccess();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password: password 
        });
        console.log('Sign up response:', { data, error: signUpError });
        if (signUpError) {
          console.error('Sign up error details:', {
            message: signUpError.message,
            status: signUpError.status,
            name: signUpError.name
          });
          throw signUpError;
        }

        // If signup is successful and a user is returned, create a profile for them
        if (data.user) {
          await createProfileForNewUser(data.user.id, data.user.email || '');
        }
        
        setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
        setIsLogin(true); // Switch to login after successful signup
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('email_provider_disabled')) {
        setError('Autentikasi email dinonaktifkan. Hubungi administrator.');
      } else if (err.message?.includes('invalid_credentials')) {
        setError('Email atau password salah.');
      } else if (err.message?.includes('email_not_confirmed')) {
        setError('Email belum dikonfirmasi. Silakan cek email Anda.');
      } else if (err.status === 400) {
        setError('Permintaan tidak valid. Periksa email dan password Anda.');
      } else {
        setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!forgotPasswordEmail.trim()) {
      setError('Email harus diisi.');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        console.error('Forgot password error:', resetError);
        throw resetError;
      }

      setMessage('Link reset password telah dikirim ke email Anda. Periksa inbox dan folder spam.');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/Lagi_ikon.png" alt="Lapor Giat Icon" className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Lupa Password</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Masukkan email Anda untuk menerima link reset password
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="forgotEmail">
                <Mail className="inline-block w-4 h-4 mr-2 text-emerald-500" />
                Email
              </label>
              <input
                id="forgotEmail"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            {message && (
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Sukses!</strong>
                <span className="block sm:inline"> {message}</span>
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
                  <KeyRound className="w-5 h-5" />
                  <span>Kirim Link Reset Password</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setError(null);
                setMessage(null);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/Lagi_ikon.png" alt="Lapor Giat Icon" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Lapor Giat</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {isLogin ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
              <Mail className="inline-block w-4 h-4 mr-2 text-emerald-500" />
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="email@example.com"
              required
              autoComplete="email" // Added autocomplete attribute
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
              <Lock className="inline-block w-4 h-4 mr-2 text-emerald-500" />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="********"
              required
              autoComplete="current-password" // Added autocomplete attribute
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
              >
                Lupa Password?
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {message && (
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Sukses!</strong>
              <span className="block sm:inline"> {message}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                <span>Masuk</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Daftar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
          >
            {isLogin ? 'Belum punya akun? Daftar sekarang' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;