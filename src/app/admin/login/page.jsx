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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">PetCare Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Restricted area — authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 shadow-elevated">
          <h2 className="text-base font-bold text-foreground">Sign in</h2>
          <p className="text-xs text-muted-foreground mb-5">Use your admin credentials</p>

          {error && (
            <div className="mb-4 p-3 bg-emergency/10 border border-emergency/20 rounded-xl text-sm text-emergency">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm placeholder:text-muted-foreground"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-muted border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-elevated">
            <LogIn size={16} />
            {isLoading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
