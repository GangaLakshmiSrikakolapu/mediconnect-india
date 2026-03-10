import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { usePatient } from '@/contexts/PatientContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, UserPlus, LogIn } from 'lucide-react';

const PatientLogin = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn } = usePatient();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginPhone, setLoginPhone] = useState('');

  // Register form
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // If already logged in, redirect
  if (isLoggedIn) {
    navigate('/find-hospital');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', loginPhone.trim())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: 'No account found', description: 'Please register first.', variant: 'destructive' });
        setTab('register');
        setRegPhone(loginPhone);
        setLoading(false);
        return;
      }

      login({
        id: data.id,
        email: data.email || '',
        phone: data.phone,
        address: data.address || '',
      });
      toast({ title: 'Welcome back!' });
      navigate('/find-hospital');
    } catch (err) {
      console.error(err);
      toast({ title: 'Login failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone.trim()) return;
    setLoading(true);
    try {
      // Check if phone already exists
      const { data: existing } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', regPhone.trim())
        .maybeSingle();

      if (existing) {
        toast({ title: 'Phone already registered', description: 'Please login instead.', variant: 'destructive' });
        setTab('login');
        setLoginPhone(regPhone);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .insert({
          email: regEmail.trim() || null,
          phone: regPhone.trim(),
          address: regAddress.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      login({
        id: data.id,
        email: data.email || '',
        phone: data.phone,
        address: data.address || '',
      });
      toast({ title: 'Account created successfully!' });
      navigate('/find-hospital');
    } catch (err) {
      console.error(err);
      toast({ title: 'Registration failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 max-w-md animate-fade-in">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Patient Portal</CardTitle>
          <CardDescription>Login or register to book appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login"><LogIn className="h-4 w-4 mr-1" />Login</TabsTrigger>
              <TabsTrigger value="register"><UserPlus className="h-4 w-4 mr-1" />Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input required value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="Enter your registered phone" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input required value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="10-digit phone number" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={regAddress} onChange={e => setRegAddress(e.target.value)} placeholder="Your address" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save & Continue
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientLogin;
