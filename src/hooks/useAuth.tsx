import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'patient' | 'hospitalAdmin' | 'doctor' | 'superAdmin' | 'insurancePartner';

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

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_ROUTES: Record<AppRole, string> = {
  patient: '/patient/dashboard',
  hospitalAdmin: '/hospital-admin/dashboard',
  doctor: '/doctor/dashboard',
  superAdmin: '/admin/dashboard',
  insurancePartner: '/insurance',
};

export const getRedirectForRole = (role: AppRole) => ROLE_ROUTES[role] || '/';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, session: null, role: null, loading: true, profile: null,
  });

  const detectRole = useCallback(async (userId: string): Promise<AppRole> => {
    // Check user_roles table first
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', userId);
    if (roles?.length) {
      if (roles.some(r => r.role === 'admin')) return 'superAdmin';
    }
    // Check if stored role in localStorage
    const stored = localStorage.getItem('mediconnect_role');
    if (stored) return stored as AppRole;
    return 'patient';
  }, []);

  const refreshRole = useCallback(async () => {
    if (!state.user) return;
    const role = await detectRole(state.user.id);
    setState(s => ({ ...s, role }));
    localStorage.setItem('mediconnect_role', role);
  }, [state.user, detectRole]);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const role = await detectRole(session.user.id);
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();
        setState({ user: session.user, session, role, loading: false, profile });
        localStorage.setItem('mediconnect_role', role);
        localStorage.setItem('mediconnect_last_role', role);
      } else {
        setState({ user: null, session: null, role: null, loading: false, profile: null });
        localStorage.removeItem('mediconnect_role');
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await detectRole(session.user.id);
        const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle();
        setState({ user: session.user, session, role, loading: false, profile });
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [detectRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('mediconnect_role');
    sessionStorage.removeItem('mediconnect_doctor');
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
