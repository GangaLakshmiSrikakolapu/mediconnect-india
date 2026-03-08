import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth, getRedirectForRole, type AppRole } from '@/hooks/useAuth';
import {
  Heart, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  Building2, Stethoscope, Shield, Briefcase, User,
  Hospital, Users, Sparkles
} from 'lucide-react';

const ROLES = [
  { id: 'patient' as AppRole, label: 'Patient', icon: User, emoji: '🏥' },
  { id: 'hospitalAdmin' as AppRole, label: 'Hospital Admin', icon: Building2, emoji: '🏨' },
  { id: 'doctor' as AppRole, label: 'Doctor', icon: Stethoscope, emoji: '👨‍⚕️' },
  { id: 'superAdmin' as AppRole, label: 'Super Admin', icon: Shield, emoji: '🛡️' },
  { id: 'insurancePartner' as AppRole, label: 'Insurance', icon: Briefcase, emoji: '💼' },
];

const PLACEHOLDERS: Record<AppRole, string> = {
  patient: 'Enter your email address',
  hospitalAdmin: 'Enter hospital admin email',
  doctor: 'Enter your doctor email',
  superAdmin: 'Enter super admin email',
  insurancePartner: 'Enter partner email',
};

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Kharar', 'Chandigarh', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Patna', 'Bhopal', 'Indore', 'Nagpur', 'Visakhapatnam', 'Coimbatore', 'Kochi', 'Surat'];

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, role: authRole, loading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AppRole>(() => {
    return (localStorage.getItem('mediconnect_last_role') as AppRole) || 'patient';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && authRole) {
      navigate(getRedirectForRole(authRole), { replace: true });
    }
  }, [user, authRole, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (failedAttempts >= 10) {
      toast({ title: 'Account temporarily locked. Try again in 15 minutes.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setFailedAttempts(p => p + 1);
        if (error.message.includes('Invalid login')) {
          toast({ title: 'Incorrect email or password', description: failedAttempts >= 4 ? 'Too many attempts. Account may be locked.' : undefined, variant: 'destructive' });
        } else {
          toast({ title: error.message, variant: 'destructive' });
        }
        return;
      }
      localStorage.setItem('mediconnect_role', selectedRole);
      localStorage.setItem('mediconnect_last_role', selectedRole);
      setFailedAttempts(0);
      toast({ title: 'Welcome back!' });
      navigate(getRedirectForRole(selectedRole));
    } catch (err: any) {
      toast({ title: err.message || 'Login failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getRegisterLink = () => {
    switch (selectedRole) {
      case 'patient': return <Link to="/patient/signup" className="text-primary font-semibold hover:underline">Register here</Link>;
      case 'hospitalAdmin': return <Link to="/hospital-request" className="text-primary font-semibold hover:underline">Register your hospital</Link>;
      case 'doctor': return <span className="text-muted-foreground">Doctors are added by Hospital Admin — contact your hospital</span>;
      case 'superAdmin': return <span className="text-muted-foreground">Super Admin accounts are system-created only</span>;
      case 'insurancePartner': return <span className="text-muted-foreground">Contact us at partner@mediconnect.in</span>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Animated Medical Illustration */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(214, 75%, 22%) 0%, hsl(214, 67%, 37%) 100%)' }}>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Heart className="h-10 w-10 text-white fill-white/20" />
            <span className="text-2xl font-heading font-bold text-white">MEDICONNECT INDIA</span>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-6"
            >
              India's Complete Healthcare Network
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-lg mb-10"
            >
              Book appointments, find hospitals, and manage your health — all in one place.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-6"
            >
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
            </motion.div>

            {/* Floating SVG shapes */}
            <div className="absolute top-20 right-20 opacity-10">
              <svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" stroke="white" strokeWidth="2" fill="none" /><circle cx="100" cy="100" r="40" stroke="white" strokeWidth="1" fill="none" /></svg>
            </div>
            <div className="absolute bottom-40 right-40 opacity-10">
              <svg width="120" height="120" viewBox="0 0 120 120"><rect x="20" y="20" width="80" height="80" rx="16" stroke="white" strokeWidth="2" fill="none" /></svg>
            </div>
          </div>

          {/* City Marquee */}
          <div className="overflow-hidden">
            <motion.div
              animate={{ x: [0, -1200] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="flex gap-4 whitespace-nowrap"
            >
              {[...CITIES, ...CITIES].map((city, i) => (
                <span key={i} className="text-white/40 text-sm">
                  {city} {i < CITIES.length * 2 - 1 ? '·' : ''}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {showForgot ? (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Forgot Password */}
                <div className="text-center mb-8">
                  <Heart className="h-10 w-10 text-primary fill-primary/20 mx-auto mb-4" />
                  <h2 className="text-2xl font-heading font-bold">Reset Password</h2>
                  <p className="text-muted-foreground mt-1">Enter your email to receive a reset link</p>
                </div>
                {forgotSent ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                      <Mail className="h-8 w-8 text-success" />
                    </div>
                    <p className="text-muted-foreground">Check your inbox — we've sent a reset link to <strong>{forgotEmail}</strong></p>
                    <Button variant="outline" onClick={() => { setShowForgot(false); setForgotSent(false); }}>Back to Login</Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input required type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" className="pl-10 h-12" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-full bg-gradient-to-r from-[hsl(214,75%,22%)] to-primary" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>Back to Login</Button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Logo */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Heart className="h-8 w-8 text-primary fill-primary/20" />
                    <span className="text-xl font-heading font-bold text-primary lg:hidden">MEDICONNECT</span>
                  </div>
                  <h2 className="text-2xl font-heading font-bold">Welcome Back</h2>
                  <p className="text-muted-foreground mt-1">Sign in to your account</p>
                </div>

                {/* Role Selector */}
                <div className="flex flex-wrap gap-1.5 p-1.5 bg-muted rounded-2xl mb-6">
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-1 min-w-0 justify-center ${
                        selectedRole === r.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                      }`}
                    >
                      <span className="text-sm">{r.emoji}</span>
                      <span className="hidden sm:inline truncate">{r.label}</span>
                    </button>
                  ))}
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        required type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder={PLACEHOLDERS[selectedRole]}
                        className="pl-10 h-12 rounded-xl"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        required type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                        className="pl-10 pr-10 h-12 rounded-xl"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" />
                      <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                    </div>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-accent font-medium hover:underline">
                      Forgot Password?
                    </button>
                  </div>

                  {failedAttempts >= 5 && (
                    <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center">
                      {failedAttempts >= 10 ? 'Account temporarily locked for 15 minutes.' : `${10 - failedAttempts} attempts remaining before lockout.`}
                    </div>
                  )}

                  <Button type="submit"
                    className="w-full h-[52px] rounded-full bg-gradient-to-r from-[hsl(214,75%,22%)] to-primary text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
                </form>

                {/* Register Link */}
                <div className="text-center text-sm text-muted-foreground mt-6 space-y-1">
                  <p>Don't have an account? {getRegisterLink()}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
