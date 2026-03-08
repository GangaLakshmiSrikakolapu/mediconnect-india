import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';

const AdminLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-admin-key', {
        body: { key },
      });
      if (error || !data?.valid) {
        toast({ title: data?.message || 'Invalid key. Try again.', variant: 'destructive' });
        return;
      }
      // Store admin session in sessionStorage (not localStorage for security)
      sessionStorage.setItem('mediconnect_admin', 'true');
      sessionStorage.setItem('mediconnect_admin_key', key);
      navigate('/admin/dashboard');
    } catch {
      toast({ title: 'Invalid key. Try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16 max-w-md animate-fade-in">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-primary/10 p-4 mb-2">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{t.admin.login}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Private Key</Label>
              <Input
                required
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="Enter admin private key"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.common.loading : t.admin.loginBtn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminLogin;
