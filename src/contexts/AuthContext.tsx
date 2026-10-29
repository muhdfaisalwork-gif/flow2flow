import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { d1Api } from '@/lib/api';
import type { Session } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  display_name?: string;
  created_at?: string;
  user_metadata?: { display_name?: string; full_name?: string };
}

export interface SignInResult {
  error: Error | null;
  require2FA?: boolean;
  tempToken?: string;
  method?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, tfaCode?: string) => Promise<SignInResult>;
  complete2FA: (tempToken: string, code: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // 1. Check Cloudflare D1 token first
      const d1User = await d1Api.getMe();
      if (d1User && isMounted) {
        setUser({
          id: d1User.id,
          email: d1User.email,
          display_name: d1User.display_name,
          user_metadata: { display_name: d1User.display_name },
        });
        setIsLoading(false);
        return;
      }

      // 2. Otherwise check Supabase session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              created_at: session.user.created_at,
              user_metadata: session.user.user_metadata,
            });
          } else {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();

    // Supabase listener for external OAuth or fallback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!d1Api.getToken() && isMounted) {
        setSession(session);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
            created_at: session.user.created_at,
            user_metadata: session.user.user_metadata,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      // Prioritize Cloudflare D1 edge database
      const res = await d1Api.signUp(email, password, displayName);
      setUser({
        id: res.user.id,
        email: res.user.email,
        display_name: res.user.display_name,
        user_metadata: { display_name: res.user.display_name },
      });
      return { error: null };
    } catch (d1Err: unknown) {
      const d1Msg = d1Err instanceof Error ? d1Err.message : String(d1Err);
      // Fallback to Supabase if D1 has an error
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        return { error };
      } catch (sbErr: unknown) {
        const sbMsg = sbErr instanceof Error ? sbErr.message : String(sbErr);
        return { error: new Error(d1Msg || sbMsg || 'Signup failed') };
      }
    }
  };

  const signIn = async (email: string, password: string, tfaCode?: string): Promise<SignInResult> => {
    try {
      // Prioritize Cloudflare D1 edge database
      const res = await d1Api.login(email, password, tfaCode);
      if (res.require2FA) {
        return {
          error: null,
          require2FA: true,
          tempToken: res.tempToken,
          method: res.method || 'totp',
        };
      }
      if (res.user) {
        setUser({
          id: res.user.id,
          email: res.user.email,
          display_name: res.user.display_name,
          user_metadata: { display_name: res.user.display_name },
        });
      }
      return { error: null };
    } catch (d1Err: unknown) {
      const d1Msg = d1Err instanceof Error ? d1Err.message : String(d1Err);
      // Fallback to Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data?.user) {
          // Sync account to D1 edge database in background with exact UUID
          d1Api.signUp(email, password, data.user.user_metadata?.display_name || email.split('@')[0], data.user.id)
            .catch(() => {});
        }
        return { error };
      } catch (sbErr: unknown) {
        const sbMsg = sbErr instanceof Error ? sbErr.message : String(sbErr);
        return { error: new Error(d1Msg || sbMsg || 'Login failed') };
      }
    }
  };

  const complete2FA = async (tempToken: string, code: string): Promise<{ error: Error | null }> => {
    try {
      const res = await d1Api.login2FA(tempToken, code);
      if (res.user) {
        setUser({
          id: res.user.id,
          email: res.user.email,
          display_name: res.user.display_name,
          user_metadata: { display_name: res.user.display_name },
        });
      }
      return { error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: new Error(msg || '2FA verification failed') };
    }
  };

  const signOut = async () => {
    await d1Api.logout();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, complete2FA, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
