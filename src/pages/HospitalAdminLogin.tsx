import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Building2, Loader2, Mail, Lock } from 'lucide-react';

const HospitalAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [step, setStep] = useState<'email' | 'select'>('email');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, district, state, email')
        .eq('email', email.trim())
        .eq('status', 'approved');

      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ title: 'No approved hospital found with this email', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setHospitals(data);
      if (data.length === 1) {
        selectHospital(data[0]);
      } else {
        setStep('select');
      }
    } catch {
      toast({ title: 'Login failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectHospital = (hospital: any) => {
    sessionStorage.setItem('mediconnect_hospital_admin', JSON.stringify({
      id: hospital.id,
      name: hospital.name,
      email: hospital.email,
      district: hospital.district,
      state: hospital.state,
    }));
    navigate('/hospital-admin/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-secondary/30">
      <Card className="w-full max-w-md card-shadow border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-heading">Hospital Admin</CardTitle>
          <CardDescription>Access your hospital's management dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label>Hospital Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hospital@email.com" className="pl-10" />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : 'Continue'}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">Select your hospital:</p>
              {hospitals.map(h => (
                <Button key={h.id} variant="outline" className="w-full justify-start h-auto py-3 px-4 rounded-xl" onClick={() => selectHospital(h)}>
                  <div className="text-left">
                    <p className="font-semibold">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.district}, {h.state}</p>
                  </div>
                </Button>
              ))}
              <Button variant="ghost" className="w-full mt-2" onClick={() => setStep('email')}>Back</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalAdminLogin;
