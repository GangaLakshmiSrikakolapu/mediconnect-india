import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Check admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        toast({ title: 'Access denied. Admin role required.', variant: 'destructive' });
        return;
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast({ title: err.message || t.common.error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16 max-w-md animate-fade-in">
      <Card>
        <CardHeader><CardTitle className="text-center">{t.admin.login}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><Label>{t.admin.email}</Label><Input required type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>{t.admin.password}</Label><Input required type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? t.common.loading : t.admin.loginBtn}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminLogin;
