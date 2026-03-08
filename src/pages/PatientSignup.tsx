import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Heart, Loader2, Mail, Lock, User, Phone, Calendar,
  ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff,
  MapPin, Droplets, Activity, Shield
} from 'lucide-react';
import { indianStatesAndDistricts } from '@/data/indianLocations';

const indianStates = Object.keys(indianStatesAndDistricts);
const getDistrictsByState = (state: string) => indianStatesAndDistricts[state] || [];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Thyroid', 'Arthritis', 'None'];
const GENDERS = [
  { value: 'male', label: 'Male', icon: '👨' },
  { value: 'female', label: 'Female', icon: '👩' },
  { value: 'other', label: 'Other', icon: '🧑' },
];

const getStrength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const PatientSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', dob: '', gender: '',
    state: '', city: '', pincode: '', bloodGroup: '',
    conditions: [] as string[], emergencyName: '', emergencyPhone: '', hasInsurance: false,
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const strength = getStrength(form.password);
  const districts = form.state ? getDistrictsByState(form.state) : [];

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' }); return false;
    }
    if (form.password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' }); return false;
    }
    if (strength < 3) {
      toast({ title: 'Password needs uppercase, number, and special character', variant: 'destructive' }); return false;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' }); return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone,
            dob: form.dob,
            gender: form.gender,
            blood_group: form.bloodGroup,
            state: form.state,
            city: form.city,
            conditions: form.conditions,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setStep(4);
    } catch (err: any) {
      toast({ title: err.message || 'Signup failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 4) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-secondary/30">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="w-full max-w-md card-shadow border-0 text-center">
            <CardContent className="pt-10 pb-8 px-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
              </motion.div>
              <h2 className="font-heading text-2xl font-bold mb-2">Account Created!</h2>
              <p className="text-muted-foreground mb-6">Please check your email to verify your account, then sign in.</p>
              <Link to="/auth">
                <Button className="rounded-full" size="lg">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 bg-secondary/30">
      <Card className="w-full max-w-lg card-shadow border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Heart className="h-7 w-7 text-primary fill-primary/20" />
          </div>
          <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
          {/* Progress bar */}
          <div className="flex items-center gap-2 justify-center mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-2 rounded-full transition-all ${s <= step ? 'w-12 bg-primary' : 'w-12 bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" className="pl-10 h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="patient@email.com" className="pl-10 h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars, 1 upper, 1 number, 1 special" className="pl-10 pr-10 h-11" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? ['bg-destructive', 'bg-warning', 'bg-accent', 'bg-success'][strength - 1] : 'bg-muted'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter password" className="pl-10 h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="pl-10 h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <div className="flex gap-2">
                      {GENDERS.map(g => (
                        <button key={g.value} type="button" onClick={() => set('gender', g.value)}
                          className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs ${form.gender === g.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                          <span className="text-lg">{g.icon}</span>
                          <span>{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit number" className="pl-10 h-11" />
                  </div>
                </div>
                <Button className="w-full rounded-full h-12" onClick={() => validateStep1() && setStep(2)}>
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={form.state} onValueChange={v => { set('state', v); set('city', ''); }}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City/District</Label>
                    <Select value={form.city} onValueChange={v => set('city', v)} disabled={!form.state}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="6-digit" maxLength={6} className="pl-10 h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Select value={form.bloodGroup} onValueChange={v => set('bloodGroup', v)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />Back
                  </Button>
                  <Button className="flex-1 rounded-full h-12" onClick={() => setStep(3)}>
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Existing Conditions</Label>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.map(c => {
                        const selected = form.conditions.includes(c);
                        return (
                          <button key={c} type="button"
                            onClick={() => {
                              if (c === 'None') set('conditions', ['None']);
                              else set('conditions', selected ? form.conditions.filter(x => x !== c) : [...form.conditions.filter(x => x !== 'None'), c]);
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40 text-muted-foreground'}`}>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Emergency Contact</Label>
                      <Input value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="Contact name" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Emergency Phone</Label>
                      <Input value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} placeholder="Phone number" className="h-11" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Health Insurance</p>
                        <p className="text-xs text-muted-foreground">Do you have health insurance?</p>
                      </div>
                    </div>
                    <Switch checked={form.hasInsurance} onCheckedChange={v => set('hasInsurance', v)} />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(2)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />Back
                    </Button>
                    <Button type="submit" className="flex-1 rounded-full h-12" disabled={loading}>
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/auth" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSignup;
