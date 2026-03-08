import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'patient' | 'hospitalAdmin' | 'superAdmin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  profile: any;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

// Keep context instance stable across HMR reloads
const AUTH_CONTEXT_KEY = '__mediconnect_auth_context__';
const AuthContext = ((globalThis as any)[AUTH_CONTEXT_KEY] ??
  ((globalThis as any)[AUTH_CONTEXT_KEY] = createContext<AuthContextType | null>(null))) as ReturnType<typeof createContext<AuthContextType | null>>;

const ROLE_ROUTES: Record<AppRole, string> = {
  patient: '/patient/dashboard',
  hospitalAdmin: '/hospital/dashboard',
  superAdmin: '/superadmin/dashboard',
};

export const getRedirectForRole = (role: AppRole) => ROLE_ROUTES[role] || '/';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, session: null, role: null, loading: true, profile: null,
  });

  const detectRole = useCallback(async (userId: string, email?: string | null): Promise<AppRole> => {
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', userId);

    if (roles?.some(r => r.role === 'admin')) return 'superAdmin';
    if (roles?.some(r => (r.role as string) === 'hospital_admin')) return 'hospitalAdmin';

    // Fallback for older records where role row might be missing but hospital is linked
    const { data: linkedHospital } = await supabase
      .from('hospitals')
      .select('id')
      .eq('admin_user_id', userId)
      .maybeSingle();

    if (linkedHospital) return 'hospitalAdmin';

    // Soft fallback: only when user explicitly owns a hospital email and logs in with it
    if (email) {
      const { data: emailHospital } = await supabase
        .from('hospitals')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (emailHospital) return 'hospitalAdmin';
    }

    return 'patient';
  }, []);

  const refreshRole = useCallback(async () => {
    if (!state.user) return;
    const role = await detectRole(state.user.id, state.user.email);
    setState(s => ({ ...s, role }));
    localStorage.setItem('mediconnect_role', role);
  }, [state.user, detectRole]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const role = await detectRole(session.user.id, session.user.email);
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();
        setState({ user: session.user, session, role, loading: false, profile });
        localStorage.setItem('mediconnect_role', role);
        localStorage.setItem('mediconnect_last_role', role);
      } else {
        setState({ user: null, session: null, role: null, loading: false, profile: null });
        localStorage.removeItem('mediconnect_role');
        localStorage.removeItem('mediconnect_last_role');
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await detectRole(session.user.id, session.user.email);
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();
        setState({ user: session.user, session, role, loading: false, profile });
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [detectRole]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } finally {
      localStorage.removeItem('mediconnect_role');
      localStorage.removeItem('mediconnect_last_role');
      sessionStorage.removeItem('mediconnect_hospital_admin');
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext<AuthContextType | null>(AuthContext);
  if (ctx) return ctx;

  // Defensive fallback to prevent blank screen during hot reload glitches
  return {
    user: null,
    session: null,
    role: null,
    loading: false,
    profile: null,
    signOut: async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('mediconnect_role');
      localStorage.removeItem('mediconnect_last_role');
      sessionStorage.removeItem('mediconnect_hospital_admin');
      window.location.href = '/auth';
    },
    refreshRole: async () => {},
  };
}
