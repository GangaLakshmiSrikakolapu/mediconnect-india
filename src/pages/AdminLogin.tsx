import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Shield, Lock, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-admin-key', { body: { key } });
      if (error || !data?.valid) {
        toast({ title: 'Invalid key', variant: 'destructive' });
        return;
      }
      sessionStorage.setItem('mediconnect_admin', 'true');
      sessionStorage.setItem('mediconnect_admin_key', key);
      navigate('/admin/dashboard');
    } catch {
      toast({ title: 'Invalid key', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-secondary/30">
      <Card className="w-full max-w-md card-shadow border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-heading">Super Admin</CardTitle>
          <CardDescription>Enter your private key to access the admin portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Private Key</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input required type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="Enter admin private key" className="pl-10" />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : 'Access Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
