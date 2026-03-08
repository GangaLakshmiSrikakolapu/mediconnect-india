import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, MapPin, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('mediconnect_admin');
    if (!isAdmin) navigate('/admin/login');
  }, [navigate]);

  const adminKey = sessionStorage.getItem('mediconnect_admin_key') || '';

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['admin-hospitals'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { key: adminKey, action: 'list' },
      });
      if (error) throw error;
      return data?.hospitals || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { key: adminKey, action: 'update_status', hospitalId: id, status },
      });
      if (error || data?.error) throw new Error(data?.error || 'Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hospitals'] });
      toast({ title: 'Hospital status updated' });
    },
  });

  const handleLogout = () => {
    sessionStorage.removeItem('mediconnect_admin');
    sessionStorage.removeItem('mediconnect_admin_key');
    navigate('/admin/login');
  };

  const filtered = (hospitals as any[])?.filter((h: any) => h.status === activeTab) || [];

  return (
    <div className="container py-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">{t.admin.dashboard}</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1" />{t.admin.logout}</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">{t.admin.pending} ({(hospitals as any[])?.filter((h: any) => h.status === 'pending').length || 0})</TabsTrigger>
          <TabsTrigger value="approved">{t.admin.approved} ({(hospitals as any[])?.filter((h: any) => h.status === 'approved').length || 0})</TabsTrigger>
          <TabsTrigger value="rejected">{t.admin.rejected} ({(hospitals as any[])?.filter((h: any) => h.status === 'rejected').length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? <p className="text-muted-foreground">{t.common.loading}</p> :
            filtered.length === 0 ? <p className="text-muted-foreground text-center py-8">{t.admin.noRequests}</p> :
            <div className="space-y-4">
              {filtered.map((h: any) => (
                <Card key={h.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{h.name}</CardTitle>
                        <CardDescription>{h.email} · {h.phone}</CardDescription>
                      </div>
                      <Badge variant={h.status === 'approved' ? 'default' : h.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {h.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="h-3.5 w-3.5" />{h.address}, {h.district}, {h.state}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {h.specializations?.map((s: string) => (
                        <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    {h.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: h.id, status: 'approved' })}>
                          <CheckCircle className="h-4 w-4 mr-1" />{t.admin.accept}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: h.id, status: 'rejected' })}>
                          <XCircle className="h-4 w-4 mr-1" />{t.admin.deny}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default AdminDashboard;
