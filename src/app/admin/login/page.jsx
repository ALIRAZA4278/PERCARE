'use client';

import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const { login, isLoggedIn, profile, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Already logged in as admin? redirect straight to dashboard
  useEffect(() => {
    if (!loading && isLoggedIn && profile?.role === 'admin') {
      router.replace('/admin');
    }
  }, [loading, isLoggedIn, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (p?.role !== 'admin') {
        await supabase.auth.signOut();
        setError('Access denied. Admin accounts only.');
        return;
      }
      router.replace('/admin');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show nothing while checking existing session
  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PetCare Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Restricted area — authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl">
          <h2 className="text-base font-bold text-gray-900">Sign in</h2>
          <p className="text-xs text-gray-500 mb-5">Use your admin credentials</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm placeholder-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm placeholder-gray-400"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
            <LogIn size={16} />
            {isLoading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
