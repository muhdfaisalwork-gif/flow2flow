import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TFASettings, TFAMethod } from '@/types/tfa';

export function useTFA() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TFASettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    // Use the safe view to avoid exposing sensitive fields (totp_secret, backup_codes, phone_number)
    const { data, error } = await supabase
      .from('user_tfa_settings_safe' as any)
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching TFA settings:', error);
    }

    // Cast the data to TFASettings since Supabase types may not be updated yet
    setSettings(data as unknown as TFASettings | null);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const initializeTFA = async () => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data: upsertData, error: upsertError } = await supabase
      .from('user_tfa_settings')
      .upsert({
        user_id: user.id,
        enabled: false,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) return { data: null, error: upsertError };

    // Re-fetch from safe view to avoid exposing secrets
    const { data, error } = await supabase
      .from('user_tfa_settings_safe' as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setSettings(data as unknown as TFASettings);
    }

    return { data, error };
  };

  const updateSettings = async (updates: Partial<TFASettings>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error: updateError } = await supabase
      .from('user_tfa_settings')
      .update(updates)
      .eq('user_id', user.id);

    if (updateError) return { data: null, error: updateError };

    // Re-fetch from safe view
    const { data, error } = await supabase
      .from('user_tfa_settings_safe' as any)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setSettings(data as unknown as TFASettings);
    }

    return { data, error };
  };

  const enableTFA = async (method: TFAMethod) => {
    return updateSettings({
      enabled: true,
      preferred_method: method,
    });
  };

  const disableTFA = async () => {
    return updateSettings({
      enabled: false,
      preferred_method: null,
    });
  };

  const generateBackupCodes = async () => {
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    const { error } = await updateSettings({ backup_codes: codes });
    
    if (error) return { codes: null, error };
    return { codes, error: null };
  };

  return {
    settings,
    isLoading,
    initializeTFA,
    updateSettings,
    enableTFA,
    disableTFA,
    generateBackupCodes,
    refetch: fetchSettings,
  };
}
