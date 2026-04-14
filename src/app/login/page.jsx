'use client';

import { User, Stethoscope, ShoppingBag, Heart, Building2, Store, Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome to PetCare</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-gray-50" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm bg-gray-50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <LogIn size={16} />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-5">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
