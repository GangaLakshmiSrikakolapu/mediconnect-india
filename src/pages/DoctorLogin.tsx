import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, Loader2 } from 'lucide-react';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({ title: 'Please enter your access code', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctor_access_codes' as any)
        .select('*, doctors:doctor_id(id, name, hospital_id, specialization)')
        .eq('access_code', code.trim())
        .single();

      if (error || !data) {
        toast({ title: 'Invalid access code. Please try again.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Store doctor info in session
      const doctorData = (data as any).doctors;
      sessionStorage.setItem('mediconnect_doctor', JSON.stringify({
        id: doctorData.id,
        name: doctorData.name,
        hospital_id: doctorData.hospital_id,
        specialization: doctorData.specialization,
      }));

      navigate('/doctor/dashboard');
    } catch (err) {
      console.error('Doctor login error:', err);
      toast({ title: 'Login failed. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16 max-w-md animate-fade-in">
      <Card>
        <CardHeader className="text-center">
          <Stethoscope className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">Doctor Login</CardTitle>
          <CardDescription>Enter your access code to view your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Access Code *</Label>
              <Input
                required
                type="password"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter your access code"
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : 'Login to Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorLogin;
