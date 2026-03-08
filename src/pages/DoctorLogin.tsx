import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, Loader2, ArrowLeft, Lock } from 'lucide-react';

const DOCTOR_KEY = "1234";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [step, setStep] = useState<'code' | 'select'>('code');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() !== DOCTOR_KEY) {
      toast({ title: 'Invalid access key', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('doctors').select('id, name, hospital_id, specialization').eq('status', 'active');
      if (error || !data?.length) { toast({ title: 'No active doctors found', variant: 'destructive' }); return; }

      const hospitalIds = [...new Set(data.map(d => d.hospital_id))];
      const { data: hospitals } = await supabase.from('hospitals').select('id, name').in('id', hospitalIds);
      const hMap = new Map((hospitals || []).map(h => [h.id, h.name]));
      setDoctors(data.map(d => ({ ...d, hospital_name: hMap.get(d.hospital_id) || 'Unknown' })));
      setStep('select');
    } catch { toast({ title: 'Login failed', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const selectDoctor = (doc: any) => {
    sessionStorage.setItem('mediconnect_doctor', JSON.stringify({ id: doc.id, name: doc.name, hospital_id: doc.hospital_id, specialization: doc.specialization }));
    navigate('/doctor/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-secondary/30">
      <Card className="w-full max-w-md card-shadow border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-heading">{step === 'code' ? 'Doctor Portal' : 'Select Your Profile'}</CardTitle>
          <CardDescription>{step === 'code' ? 'Enter the access key to continue' : 'Choose your doctor profile'}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'code' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Access Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input required type="password" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter access key" className="pl-10 text-center tracking-widest" />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl" size="lg" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : 'Continue'}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              {doctors.map(doc => (
                <Button key={doc.id} variant="outline" className="w-full justify-start h-auto py-3 px-4 rounded-xl" onClick={() => selectDoctor(doc)}>
                  <div className="text-left">
                    <p className="font-semibold">Dr. {doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.specialization} · {doc.hospital_name}</p>
                  </div>
                </Button>
              ))}
              <Button variant="ghost" className="w-full" onClick={() => { setStep('code'); setCode(''); }}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorLogin;
