import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Heart, Loader2, Mail, Lock, User, Phone, Calendar, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const PatientSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', dob: '', gender: '', bloodGroup: '',
  });

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
          },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setStep(3);
    } catch (err: any) {
      toast({ title: err.message || 'Signup failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-secondary/30">
        <Card className="w-full max-w-md card-shadow border-0 text-center">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">Account Created!</h2>
            <p className="text-muted-foreground mb-6">Please check your email to verify your account, then sign in.</p>
            <Link to="/patient/login">
              <Button className="rounded-xl" size="lg">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-secondary/30">
      <Card className="w-full max-w-md card-shadow border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Heart className="h-8 w-8 text-primary fill-primary/20" />
          </div>
          <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
          <CardDescription>Join MediConnect to book appointments</CardDescription>
          {/* Progress */}
          <div className="flex items-center gap-2 justify-center mt-4">
            {[1, 2].map(s => (
              <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-10 bg-primary' : s < step ? 'w-10 bg-success' : 'w-10 bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" className="pl-10" />
                </div>
              </div>
              <Button className="w-full rounded-xl" size="lg" onClick={() => {
                if (!form.name || !form.email || !form.password) {
                  toast({ title: 'Please fill required fields', variant: 'destructive' });
                  return;
                }
                if (form.password.length < 6) {
                  toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
                  return;
                }
                setStep(2);
              }}>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={form.bloodGroup} onValueChange={v => setForm({ ...form, bloodGroup: v })}>
                  <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />Back
                </Button>
                <Button type="submit" className="flex-1 rounded-xl" size="lg" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/patient/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSignup;
