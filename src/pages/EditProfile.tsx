import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const { patient, login, isLoggedIn } = usePatient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/patient/login'); return; }
    if (patient) {
      setName(patient.name);
      setEmail(patient.email);
      setPhone(patient.phone);
      setAddress(patient.address);
    }
  }, [isLoggedIn, patient, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({ name: name.trim(), email: email.trim() || null, phone: phone.trim(), address: address.trim() || null } as any)
        .eq('id', patient.id);

      if (error) throw error;

      login({ ...patient, name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim() });
      toast({ title: 'Profile updated successfully!' });
      navigate('/find-hospital');
    } catch (err) {
      console.error(err);
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-md animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Full Name *</Label><Input required value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>Phone *</Label><Input required value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div><Label>Address</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate(-1)}>Cancel</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
