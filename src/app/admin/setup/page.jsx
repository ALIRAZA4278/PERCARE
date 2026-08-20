'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('fluffynestadmin@gmail.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: 'FluffyNest Admin', role: 'admin' },
      },
    });

    if (error) {
      setStatus('error');
      setMessage('Supabase error: ' + error.message);
      return;
    }

    const userId = data?.user?.id;
    if (!userId) {
      setStatus('error');
      setMessage('No user ID returned. Check Supabase dashboard.');
      return;
    }

    const confirmed = data?.user?.email_confirmed_at || data?.user?.confirmed_at;
    if (!confirmed) {
      setStatus('confirm');
      setMessage(`User created (ID: ${userId}) but email not confirmed. In Supabase: Authentication → Users → find this user → click "..." → "Confirm email". Then run the SQL below.`);
      return;
    }

    const { error: pe } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: 'FluffyNest Admin',
      role: 'admin',
    });

    if (pe) {
      setStatus('sql');
      setMessage(`Auth user created (ID: ${userId}). Profile needs SQL — run it below.`);
      return;
    }

    setStatus('success');
    setMessage('Admin account created! You can now log in.');
  };

  const sqlFix = `INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'FluffyNest Admin', 'admin'
FROM auth.users
WHERE email = '${email}'
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'FluffyNest Admin';`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Create the admin account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {status === 'idle' || status === 'error' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{message}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Admin Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 border border-gray-300 outline-none focus:border-red-500 text-gray-900 text-sm placeholder-gray-400" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                Create Admin Account
              </button>
            </form>
          ) : status === 'loading' ? (
            <div className="text-center py-6 text-gray-500 text-sm">Creating account...</div>
          ) : status === 'success' ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">✓ {message}</div>
              <a href="/admin/login" className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm text-center">
                Go to Admin Login
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">{message}</div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Run this SQL in Supabase SQL Editor:</p>
                <pre className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs text-green-700 overflow-x-auto whitespace-pre-wrap">{sqlFix}</pre>
              </div>
              <a href="/admin/login" className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm text-center">
                Try Admin Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
