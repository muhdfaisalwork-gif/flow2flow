import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { d1Api } from '@/lib/api';
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

    // Check Cloudflare D1 first if user is authenticated with D1 JWT
    if (d1Api.getToken()) {
      try {
        const status = await d1Api.getTFAStatus();
        if (status.enabled) {
          setSettings({
            id: user.id,
            user_id: user.id,
            enabled: true,
            preferred_method: (status.preferred_method as TFAMethod) || 'totp',
            totp_verified: true,
            email_verified: false,
            phone_verified: false,
            backup_codes: status.backup_codes_remaining ? Array(status.backup_codes_remaining).fill('••••••••') : [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            totp_secret: null,
            phone_number: null,
          });
        } else {
          setSettings({
            id: user.id,
            user_id: user.id,
            enabled: false,
            preferred_method: null,
            totp_verified: false,
            email_verified: false,
            phone_verified: false,
            backup_codes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            totp_secret: null,
            phone_number: null,
          });
        }
      } catch (err) {
        console.error('Error fetching D1 TFA settings:', err);
        setSettings(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isUuid) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    // Use the safe view to avoid exposing sensitive fields (totp_secret, backup_codes, phone_number)
    const { data, error } = await supabase
      .from('user_tfa_settings_safe' as 'user_tfa_settings')
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

    if (d1Api.getToken()) {
      return { data: settings, error: null };
    }

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
      .from('user_tfa_settings_safe' as 'user_tfa_settings')
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
      .from('user_tfa_settings_safe' as 'user_tfa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setSettings(data as unknown as TFASettings);
    }

    return { data, error };
  };

  const enableTFA = async (method: TFAMethod) => {
    if (d1Api.getToken()) {
      await fetchSettings();
      return { data: null, error: null };
    }
    return updateSettings({
      enabled: true,
      preferred_method: method,
    });
  };

  const disableTFA = async () => {
    if (d1Api.getToken()) {
      try {
        await d1Api.disableTFA();
        await fetchSettings();
        return { data: null, error: null };
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        return { data: null, error };
      }
    }
    return updateSettings({
      enabled: false,
      preferred_method: null,
    });
  };

  const generateBackupCodes = async () => {
    if (d1Api.getToken()) {
      try {
        const res = await d1Api.generateTFABackupCodes();
        await fetchSettings();
        return { codes: res.codes, error: null };
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        return { codes: null, error };
      }
    }

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
