'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Home, ShieldAlert, PawPrint } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { supabase } from '@/lib/supabase';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-13 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-green-600' : 'bg-gray-300'}`}
      style={{ width: '3.25rem' }}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { refreshFlags } = useFeatureFlags();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_settings').select('*').eq('id', true).single();
    setSettings(data || { marketplace_enabled: false, shelters_enabled: false, pet_delivery_enabled: false });
    setLoading(false);
  };

  const logAudit = (action, details) =>
    supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target_type: 'site_settings', target_id: null, details });

  const handleToggle = async (field, value) => {
    setSaving(field);
    setSettings(prev => ({ ...prev, [field]: value }));
    await supabase.from('site_settings').update({ [field]: value, updated_by: user.id, updated_at: new Date().toISOString() }).eq('id', true);
    await logAudit(value ? `enable_${field}` : `disable_${field}`, `${field} set to ${value}`);
    await refreshFlags();
    setSaving(null);
  };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center"><p className="text-gray-500 text-sm">Loading...</p></div>;

  const modules = [
    {
      key: 'marketplace_enabled',
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Product listings, seller stores, cart & checkout, and the seller dashboard.',
    },
    {
      key: 'shelters_enabled',
      icon: Home,
      title: 'Shelters',
      description: 'Shelter profiles, adoption listings, donations, and the shelter dashboard.',
    },
    {
      key: 'pet_delivery_enabled',
      icon: PawPrint,
      title: 'Pet Delivery',
      description: '"Bring Home Happiness" — buying a pet from a company with delivery, vaccination, and guarantee.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Site-wide feature toggles for Phase 1 launch</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <ShieldAlert size={18} className="text-orange-600 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-700">
          Turning a module off hides it everywhere on the site — nav, homepage, search, and direct links — without deleting any data. Turn it back on any time.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {modules.map(({ key, icon: Icon, title, description }) => {
          const enabled = !!settings[key];
          return (
            <div key={key} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-green-50' : 'bg-gray-100'}`}>
                <Icon size={20} className={enabled ? 'text-green-600' : 'text-gray-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {enabled ? 'LIVE' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
              <Toggle checked={enabled} disabled={saving === key} onChange={(v) => handleToggle(key, v)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
