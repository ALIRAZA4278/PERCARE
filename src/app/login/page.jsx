'use client';

import { User, Stethoscope, ShoppingBag, Heart, Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { login } = useAuth();
  const { marketplaceEnabled, sheltersEnabled } = useFeatureFlags();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('pet_owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allRoles = [
    { id: 'pet_owner', icon: User, label: 'Pet Owner', description: 'Manage pets, book vets, shop' },
    { id: 'veterinarian', icon: Stethoscope, label: 'Veterinarian', description: 'Manage clinic & patients' },
    marketplaceEnabled && { id: 'seller', icon: ShoppingBag, label: 'Seller / Company', description: 'Sell products & manage store' },
    sheltersEnabled && { id: 'shelter', icon: Heart, label: 'Shelter', description: 'Manage shelter & adoptions' },
  ];
  const roles = allRoles.filter(Boolean);

  const roleRedirect = { veterinarian: '/dashboard/vet', seller: '/dashboard/seller', company: '/dashboard/seller', shelter: '/dashboard/shelter', admin: '/admin' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { user } = await login(email, password);
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();

      if ((p?.role === 'seller' || p?.role === 'company') && !marketplaceEnabled) {
        await supabase.auth.signOut();
        setError('Seller accounts are temporarily unavailable while the marketplace is in beta. Check back soon.');
        return;
      }
      if (p?.role === 'shelter' && !sheltersEnabled) {
        await supabase.auth.signOut();
        setError('Shelter accounts are temporarily unavailable while shelters are in beta. Check back soon.');
        return;
      }

      router.push(roleRedirect[p?.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome to PetCare</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-emergency/10 border border-emergency/20 rounded-xl text-sm text-emergency">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-1">Choose your role</h2>
            <p className="text-sm text-muted-foreground mb-4">Select how you want to sign in</p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(({ id, icon: Icon, label, description }) => (
                <button key={id} type="button" onClick={() => setSelectedRole(id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${selectedRole === id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-border'}`}>
                  <Icon size={24} className={`mx-auto mb-2 ${selectedRole === id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-semibold ${selectedRole === id ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-foreground mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
              className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm bg-muted" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm bg-muted" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-muted-foreground transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <LogIn size={16} />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:text-primary transition-colors">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
