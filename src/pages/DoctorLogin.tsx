import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, Loader2, ArrowLeft } from 'lucide-react';

const DOCTOR_KEY = "1234";

type DoctorOption = {
  id: string;
  name: string;
  hospital_id: string;
  specialization: string;
  hospital_name?: string;
};

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [step, setStep] = useState<'code' | 'select'>('code');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({ title: 'Please enter the access key', variant: 'destructive' });
      return;
    }
    if (code.trim() !== DOCTOR_KEY) {
      toast({ title: 'Invalid access key. Try again.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, hospital_id, specialization')
        .eq('status', 'active');

      if (error || !data || data.length === 0) {
        toast({ title: 'No active doctors found.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Fetch hospital names
      const hospitalIds = [...new Set(data.map(d => d.hospital_id))];
      const { data: hospitals } = await supabase
        .from('hospitals')
        .select('id, name')
        .in('id', hospitalIds);

      const hospitalMap = new Map((hospitals || []).map(h => [h.id, h.name]));
      const enriched = data.map(d => ({ ...d, hospital_name: hospitalMap.get(d.hospital_id) || 'Unknown' }));

      setDoctors(enriched);
      setStep('select');
    } catch (err) {
      console.error('Doctor login error:', err);
      toast({ title: 'Login failed. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = (doc: DoctorOption) => {
    sessionStorage.setItem('mediconnect_doctor', JSON.stringify({
      id: doc.id,
      name: doc.name,
      hospital_id: doc.hospital_id,
      specialization: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization,
    }));
    navigate('/doctor/dashboard');
  };

  return (
    <div className="container py-16 max-w-md animate-fade-in">
      {step === 'code' ? (
        <Card>
          <CardHeader className="text-center">
            <Stethoscope className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-2xl">Doctor Login</CardTitle>
            <CardDescription>Enter the access key to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Access Key *</Label>
                <Input
                  required
                  type="password"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Enter access key"
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Select Your Profile</CardTitle>
            <CardDescription>Choose your doctor profile to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {doctors.map(doc => (
              <Button
                key={doc.id}
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4"
                onClick={() => selectDoctor(doc)}
              >
                <div className="text-left">
                  <div className="font-semibold">Dr. {doc.name}</div>
                  <div className="text-xs text-muted-foreground">{doc.specialization} • {doc.hospital_name}</div>
                </div>
              </Button>
            ))}
            <Button variant="ghost" className="w-full mt-2" onClick={() => { setStep('code'); setCode(''); }}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorLogin;
