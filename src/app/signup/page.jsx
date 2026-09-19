'use client';

import { User, Stethoscope, ShoppingBag, Heart, Eye, EyeOff, UserPlus, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const { marketplaceEnabled, sheltersEnabled } = useFeatureFlags();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('pet_owner');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const allRoles = [
    { id: 'pet_owner', icon: User, label: 'Pet Owner', approval: false },
    { id: 'veterinarian', icon: Stethoscope, label: 'Veterinarian', approval: true },
    marketplaceEnabled && { id: 'seller', icon: ShoppingBag, label: 'Seller / Company', approval: true },
    sheltersEnabled && { id: 'shelter', icon: Heart, label: 'Shelter', approval: true },
  ];
  const roles = allRoles.filter(Boolean);

  const roleRedirect = { veterinarian: '/dashboard/vet', seller: '/dashboard/seller', shelter: '/dashboard/shelter' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await signup(email, password, fullName, selectedRole);
      if (data.session) {
        router.push(roleRedirect[selectedRole] || '/');
      } else {
        // Email confirmation required — no active session yet, don't pretend the user is logged in
        setNeedsConfirmation(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg text-center p-8 rounded-2xl bg-card shadow-card">
          <div className="w-14 h-14 bg-vitality/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MailCheck size={28} className="text-vitality" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We&apos;ve sent a confirmation link to <span className="font-semibold text-foreground">{email}</span>. Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={28} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join the PetCare Ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-card shadow-card">
          {error && (
            <div className="mb-4 p-3 bg-emergency/10 border border-emergency/20 rounded-xl text-sm text-emergency">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-1">I want to join as</h2>
            <p className="text-sm text-muted-foreground mb-4">Select your account type</p>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(({ id, icon: Icon, label, approval }) => (
                <button key={id} type="button" onClick={() => setSelectedRole(id)}
                  className={`p-4 rounded-xl border-2 text-center btn-press transition-expo ${selectedRole === id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground/30'}`}>
                  <Icon size={24} className={`mx-auto mb-2 ${selectedRole === id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-semibold ${selectedRole === id ? 'text-primary' : 'text-foreground'}`}>{label}</p>
                  {approval && <p className="text-xs text-amber mt-0.5">Requires approval</p>}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-foreground mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm bg-muted" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-foreground mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm bg-muted" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm bg-muted" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full h-12 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl btn-press transition-expo flex items-center justify-center gap-2 text-sm">
            <UserPlus size={16} />
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
