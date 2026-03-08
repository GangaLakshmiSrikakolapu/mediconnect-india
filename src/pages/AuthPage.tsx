import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { type AppRole, getRedirectForRole } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Heart, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  Building2, Shield, User, Hospital, Users, Sparkles
} from 'lucide-react';

/* ── role tabs ─────────────────────────────────────── */
const ROLES: { id: AppRole; label: string; emoji: string }[] = [
  { id: 'patient', label: 'Patient', emoji: '🏥' },
  { id: 'hospitalAdmin', label: 'Hospital Admin', emoji: '🏨' },
  { id: 'superAdmin', label: 'Super Admin', emoji: '🛡️' },
];

/* ── helpers ───────────────────────────────────────── */
async function resolveRole(userId: string, email: string): Promise<AppRole> {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (roles?.some(r => r.role === 'admin')) return 'superAdmin';
  if (roles?.some(r => (r.role as string) === 'hospital_admin')) return 'hospitalAdmin';

  const { data: linked } = await supabase
    .from('hospitals')
    .select('id')
    .eq('admin_user_id', userId)
    .maybeSingle();
  if (linked) return 'hospitalAdmin';

  const { data: byEmail } = await supabase
    .from('hospitals')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (byEmail) return 'hospitalAdmin';

  return 'patient';
}

async function hydrateHospitalSession(userId: string, email: string) {
  let hospital: any = null;

  const { data: byOwner } = await supabase
    .from('hospitals')
    .select('id, name, district, state, email, status')
    .eq('admin_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);
  hospital = byOwner?.[0] ?? null;

  if (!hospital) {
    const { data: byEmail } = await supabase
      .from('hospitals')
      .select('id, name, district, state, email, status')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);
    hospital = byEmail?.[0] ?? null;
  }

  if (!hospital) return null;
  if (hospital.status === 'rejected') return 'rejected';

  sessionStorage.setItem(
    'mediconnect_hospital_admin',
    JSON.stringify({
      id: hospital.id,
      name: hospital.name,
      email: hospital.email,
      district: hospital.district,
      state: hospital.state,
      status: hospital.status,
    }),
  );
  return hospital;
}

/* ── component ─────────────────────────────────────── */
const AuthPage = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<AppRole>(() => {
    const stored = localStorage.getItem('mediconnect_last_role') as AppRole | null;
    return stored === 'hospitalAdmin' || stored === 'superAdmin' ? stored : 'patient';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  /* redirect already-authed users */
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await resolveRole(session.user.id, session.user.email ?? '');
        navigate(getRedirectForRole(role), { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  /* ── forgot password ── */
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    setForgotSent(true);
  };

  /* ── login ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      /* 1 ─ sign in */
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        toast({
          title: error.message.includes('Invalid login')
            ? 'Incorrect email or password'
            : error.message,
          variant: 'destructive',
        });
        return;
      }

      /* 2 ─ get user id */
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        toast({ title: 'Unable to retrieve user info', variant: 'destructive' });
        return;
      }

      /* 3 ─ resolve role from DB (ignores tab selection) */
      const effectiveRole = await resolveRole(userId, normalizedEmail);

      /* 4 ─ hospital admin? hydrate session */
      if (effectiveRole === 'hospitalAdmin') {
        const result = await hydrateHospitalSession(userId, normalizedEmail);
        if (!result) {
          await supabase.auth.signOut({ scope: 'local' });
          toast({ title: 'No hospital linked to this account', description: 'Register your hospital first.', variant: 'destructive' });
          return;
        }
        if (result === 'rejected') {
          await supabase.auth.signOut({ scope: 'local' });
          toast({ title: 'Hospital registration rejected', variant: 'destructive' });
          return;
        }
      }

      /* 5 ─ persist & redirect */
      localStorage.setItem('mediconnect_role', effectiveRole);
      localStorage.setItem('mediconnect_last_role', effectiveRole);
      toast({ title: 'Welcome back!' });
      navigate(getRedirectForRole(effectiveRole));
    } catch (err: any) {
      toast({ title: err.message || 'Login failed', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  /* ── register link ── */
  const registerLink = () => {
    switch (tab) {
      case 'patient':
        return <Link to="/patient/signup" className="text-primary font-semibold hover:underline">Register here</Link>;
      case 'hospitalAdmin':
        return <Link to="/hospital-request" className="text-primary font-semibold hover:underline">Register your hospital</Link>;
      case 'superAdmin':
        return <span className="text-muted-foreground">Super Admin accounts are system-created only</span>;
    }
  };

  /* ── loading guard ── */
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ── forgot password view ── */
  if (showForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold">Reset Password</h2>
            <p className="text-muted-foreground mt-1">Enter your email to receive a reset link</p>
          </div>
          {forgotSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground">Check your inbox — we sent a reset link to <strong>{forgotEmail}</strong></p>
              <Button variant="outline" onClick={() => { setShowForgot(false); setForgotSent(false); }}>Back to Login</Button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input required type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>Back to Login</Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ── main login view ── */
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(214, 75%, 22%) 0%, hsl(214, 67%, 37%) 100%)' }}>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <Heart className="h-10 w-10 text-white fill-white/20" />
            <span className="text-2xl font-heading font-bold text-white">MEDICONNECT INDIA</span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-6">
              India's Complete Healthcare Network
            </h1>
            <p className="text-white/70 text-lg mb-10">
              Book appointments, find hospitals, and manage your health — all in one place.
            </p>
            <div className="flex gap-6">
              {[
                { icon: Hospital, label: '10,000+ Hospitals' },
                { icon: Users, label: '2M+ Patients' },
                { icon: Sparkles, label: 'AI Powered' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                  <b.icon className="h-4 w-4 text-white/80" />
                  <span className="text-white/90 text-sm font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Logo on mobile */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-primary fill-primary/20" />
              <span className="text-xl font-heading font-bold text-primary lg:hidden">MEDICONNECT</span>
            </div>
            <h2 className="text-2xl font-heading font-bold">Welcome Back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {/* Role tabs */}
          <div className="flex gap-1.5 p-1.5 bg-muted rounded-2xl mb-6">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTab(r.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex-1 justify-center ${
                  tab === r.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                <span className="text-sm">{r.emoji}</span>
                <span className="hidden sm:inline truncate">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 h-12 rounded-xl"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 rounded-xl"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-accent font-medium hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-[52px] rounded-full bg-gradient-to-r from-[hsl(214,75%,22%)] to-primary text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={busy}
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>Don't have an account? {registerLink()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
