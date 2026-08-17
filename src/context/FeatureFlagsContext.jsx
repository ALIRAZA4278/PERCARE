'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const FeatureFlagsContext = createContext();

const DEFAULT_FLAGS = { marketplaceEnabled: false, sheltersEnabled: false };

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('marketplace_enabled, shelters_enabled')
      .eq('id', true)
      .single();
    if (data) {
      setFlags({
        marketplaceEnabled: !!data.marketplace_enabled,
        sheltersEnabled: !!data.shelters_enabled,
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  return (
    <FeatureFlagsContext.Provider value={{ ...flags, loading, refreshFlags: fetchFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
