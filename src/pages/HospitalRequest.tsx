import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { indianStatesAndDistricts, healthProblems } from '@/data/indianLocations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Plus, Trash2, UserPlus, ArrowRight, ArrowLeft, Loader2, Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';

type DoctorEntry = { doctor_name: string; age: string; email: string; phone: string; specialization: string; education: string; experience: string };
const emptyDoctor: DoctorEntry = { doctor_name: '', age: '', email: '', phone: '', specialization: '', education: '', experience: '' };

const HospitalRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'account' | 'hospital' | 'doctors' | 'review' | 'done'>('account');
  const [loading, setLoading] = useState(false);
  
  // Account fields
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', state: '', district: '', address: '' });
  const [specs, setSpecs] = useState<string[]>([]);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [doctors, setDoctors] = useState<DoctorEntry[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorEntry>({ ...emptyDoctor });

  const states = Object.keys(indianStatesAndDistricts).sort();
  const districts = form.state ? indianStatesAndDistricts[form.state] || [] : [];
  const toggleSpec = (s: string) => setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const passwordStrength = () => {
    let score = 0;
    if (accountPassword.length >= 8) score++;
    if (/[A-Z]/.test(accountPassword)) score++;
    if (/[0-9]/.test(accountPassword)) score++;
    if (/[^A-Za-z0-9]/.test(accountPassword)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'][passwordStrength()];
  const strengthColor = ['', 'bg-destructive', 'bg-warning', 'bg-primary', 'bg-success'][passwordStrength()];

  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountPassword.length < 8) { toast({ title: 'Password must be at least 8 characters', variant: 'destructive' }); return; }
    if (accountPassword !== confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    if (passwordStrength() < 3) { toast({ title: 'Password needs uppercase, number, and special character', variant: 'destructive' }); return; }
    setStep('hospital');
  };

  const addDoctor = () => {
    if (!currentDoctor.doctor_name.trim() || !currentDoctor.specialization) {
      toast({ title: 'Fill required doctor fields (name, specialization)', variant: 'destructive' });
      return;
    }
    setDoctors(prev => [...prev, { ...currentDoctor }]);
    setCurrentDoctor({ ...emptyDoctor });
    toast({ title: `Dr. ${currentDoctor.doctor_name} added` });
  };

  const handleSubmit = async () => {
    if (doctors.length === 0) { toast({ title: 'Add at least one doctor', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const normalizedEmail = accountEmail.trim().toLowerCase();

      // 1. Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: accountPassword,
        options: {
          data: { full_name: form.name + ' Admin', role: 'hospitalAdmin' },
          emailRedirectTo: window.location.origin,
        },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Upload QR if provided
      let qrUrl: string | null = null;
      if (qrFile) {
        const filePath = `qr/${Date.now()}-${qrFile.name}`;
        const { error: uploadError } = await supabase.storage.from('hospital-assets').upload(filePath, qrFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('hospital-assets').getPublicUrl(filePath);
          qrUrl = urlData.publicUrl;
        }
      }

      // 3. Submit hospital request (edge function assigns hospital_admin role)
      const { data, error } = await supabase.functions.invoke('hospital-request', {
        body: {
          hospital_name: form.name, email: normalizedEmail, phone: form.phone,
          state: form.state, district: form.district, address: form.address,
          specializations: specs, upi_qr_url: qrUrl,
          admin_user_id: userId,
          doctors: doctors.map(d => ({
            doctor_name: d.doctor_name, age: d.age, email: d.email,
            phone: d.phone, specialization: d.specialization,
            education: d.education, experience: d.experience,
          })),
        },
      });
      if (error || data?.error) throw new Error(data?.error || 'Failed');

      // 4. Store role
      localStorage.setItem('mediconnect_role', 'hospitalAdmin');
      localStorage.setItem('mediconnect_last_role', 'hospitalAdmin');
      
      setStep('done');
    } catch (err: any) {
      toast({ title: err.message || 'Registration failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  if (step === 'done') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30 flex items-center justify-center px-4">
        <div className="text-center py-16 animate-fade-in max-w-md">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">Registration Successful!</h2>
          <p className="text-muted-foreground mb-2">Your hospital account has been created with {doctors.length} doctor(s).</p>
          <p className="text-sm text-muted-foreground mb-6">Please check your email to verify your account. Once verified and approved by our admin team, you'll have full access to your hospital dashboard.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/auth')} className="rounded-xl">Go to Login</Button>
            <Button variant="outline" onClick={() => navigate('/')} className="rounded-xl">Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container py-8 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Create Account', 'Hospital Info', 'Add Doctors', 'Review'].map((label, i) => {
            const steps = ['account', 'hospital', 'doctors', 'review'];
            const idx = steps.indexOf(step);
            return (
              <div key={label} className="flex items-center">
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${i === idx ? 'bg-primary text-primary-foreground' : i < idx ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}. {label}
                </div>
                {i < 3 && <div className="w-6 h-0.5 bg-muted mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Create Account */}
        {step === 'account' && (
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" />Create Hospital Admin Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountNext} className="space-y-4">
                <div>
                  <Label>Admin Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required type="email" value={accountEmail} onChange={e => setAccountEmail(e.target.value)} placeholder="admin@hospital.com" className="pl-10" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This will be your login email and hospital contact email</p>
                </div>
                <div>
                  <Label>Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required type={showPassword ? 'text' : 'password'} value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder="Min 8 chars, uppercase, number, special" className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {accountPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= passwordStrength() ? strengthColor : 'bg-muted'}`} />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength() >= 3 ? 'text-success' : 'text-muted-foreground'}`}>{strengthLabel}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="pl-10" />
                  </div>
                  {confirmPassword && confirmPassword !== accountPassword && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                </div>
                <Button type="submit" className="w-full rounded-xl" size="lg">Next: Hospital Info <ArrowRight className="h-4 w-4 ml-2" /></Button>
                <p className="text-center text-sm text-muted-foreground">Already registered? <a href="/auth" className="text-primary font-medium hover:underline">Login here</a></p>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Hospital Info */}
        {step === 'hospital' && (
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Hospital Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={e => { e.preventDefault(); if (!form.name || !form.phone || !form.state || !form.district || !form.address || specs.length === 0) { toast({ title: 'Fill all required fields & select specializations', variant: 'destructive' }); return; } setStep('doctors'); }} className="space-y-4">
                <div><Label>Hospital Name *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Phone *</Label><Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>State *</Label>
                    <Select value={form.state} onValueChange={v => setForm({ ...form, state: v, district: '' })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>District *</Label>
                    <Select value={form.district} onValueChange={v => setForm({ ...form, district: v })} disabled={!form.state}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Address *</Label><Textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div>
                  <Label>Specializations *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {healthProblems.map(p => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer"><Checkbox checked={specs.includes(p)} onCheckedChange={() => toggleSpec(p)} />{p}</label>
                    ))}
                  </div>
                </div>
                <div><Label>UPI QR Code (optional)</Label><Input type="file" accept="image/*" onChange={e => setQrFile(e.target.files?.[0] || null)} /></div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep('account')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
                  <Button type="submit" className="flex-1 rounded-xl" size="lg">Next: Add Doctors <ArrowRight className="h-4 w-4 ml-2" /></Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Add Doctors */}
        {step === 'doctors' && (
          <div className="space-y-4">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Add Doctor</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name *</Label><Input value={currentDoctor.doctor_name} onChange={e => setCurrentDoctor({ ...currentDoctor, doctor_name: e.target.value })} placeholder="Dr. Name" /></div>
                  <div><Label>Age</Label><Input type="number" value={currentDoctor.age} onChange={e => setCurrentDoctor({ ...currentDoctor, age: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" value={currentDoctor.email} onChange={e => setCurrentDoctor({ ...currentDoctor, email: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={currentDoctor.phone} onChange={e => setCurrentDoctor({ ...currentDoctor, phone: e.target.value })} /></div>
                  <div><Label>Specialization *</Label>
                    <Select value={currentDoctor.specialization} onValueChange={v => setCurrentDoctor({ ...currentDoctor, specialization: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{specs.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Education</Label><Input value={currentDoctor.education} onChange={e => setCurrentDoctor({ ...currentDoctor, education: e.target.value })} /></div>
                  <div><Label>Experience (yrs)</Label><Input type="number" value={currentDoctor.experience} onChange={e => setCurrentDoctor({ ...currentDoctor, experience: e.target.value })} /></div>
                </div>
                <Button type="button" variant="outline" className="rounded-lg" onClick={addDoctor}><Plus className="h-4 w-4 mr-1" />Add Doctor</Button>
              </CardContent>
            </Card>

            {doctors.length > 0 && (
              <Card className="border-0 card-shadow">
                <CardHeader><CardTitle>Doctors Added ({doctors.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {doctors.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div>
                        <p className="font-semibold text-sm">Dr. {d.doctor_name}</p>
                        <p className="text-xs text-muted-foreground">{d.specialization} · {d.experience} yrs</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setDoctors(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setStep('hospital')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
              <Button className="flex-1 rounded-xl" onClick={() => { if (doctors.length === 0) { toast({ title: 'Add at least one doctor', variant: 'destructive' }); return; } setStep('review'); }}>Review & Submit <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <div className="space-y-4">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle>Account</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p><span className="text-muted-foreground">Email:</span> {accountEmail}</p>
              </CardContent>
            </Card>
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle>Hospital Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground block text-xs">Name</span>{form.name}</div>
                <div><span className="text-muted-foreground block text-xs">Phone</span>{form.phone}</div>
                <div><span className="text-muted-foreground block text-xs">Location</span>{form.district}, {form.state}</div>
                <div className="col-span-2"><span className="text-muted-foreground block text-xs">Address</span>{form.address}</div>
                <div className="col-span-2"><span className="text-muted-foreground block text-xs">Specializations</span>{specs.join(', ')}</div>
              </CardContent>
            </Card>
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle>Doctors ({doctors.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {doctors.map((d, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/50 text-sm">
                    <p className="font-semibold">Dr. {d.doctor_name}</p>
                    <p className="text-xs text-muted-foreground">{d.specialization} · {d.experience} yrs</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm text-warning">
              Your hospital will be reviewed by our admin team within 24–48 hours. Once approved, you can login and manage everything from your dashboard.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setStep('doctors')}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
              <Button className="flex-1 rounded-xl" size="lg" onClick={handleSubmit} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Account...</> : 'Create Account & Submit'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalRequest;
