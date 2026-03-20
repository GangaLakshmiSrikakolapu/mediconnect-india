import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, MapPin, LogOut, Eye, GraduationCap, Phone, Mail, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [detailHospital, setDetailHospital] = useState<any | null>(null);
  const [hospitalDoctors, setHospitalDoctors] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('mediconnect_admin');
    const storedKey = sessionStorage.getItem('mediconnect_admin_key');
    if (!isAdmin || !storedKey) navigate('/admin/login');
  }, [navigate]);

  const adminKey = sessionStorage.getItem('mediconnect_admin_key') || '';

  const { data: hospitals, isLoading, isError, error } = useQuery({
    queryKey: ['admin-hospitals'],
    enabled: Boolean(adminKey),
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { key: adminKey, action: 'list' },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to load hospitals');
      }

      return data?.hospitals || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { key: adminKey, action: 'update_status', hospitalId: id, status },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || 'Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hospitals'] });
      toast({ title: 'Hospital status updated' });
    },
    onError: (mutationError: Error) => {
      toast({
        title: 'Failed to update hospital status',
        description: mutationError.message,
        variant: 'destructive',
      });
    },
  });

  const handleViewDetails = async (hospital: any) => {
    try {
      setDetailHospital(hospital);

      const { data: reqDoctors, error: reqDoctorsError } = await supabase.functions.invoke('admin-hospitals', {
        body: { key: adminKey, action: 'get_doctors_request', hospitalId: hospital.id },
      });

      if (reqDoctorsError || reqDoctors?.error) {
        throw new Error(reqDoctors?.error || reqDoctorsError?.message || 'Failed to load doctors');
      }

      const { data: activeDoctors, error: activeDoctorsError } = await supabase
        .from('doctors')
        .select('*')
        .eq('hospital_id', hospital.id);

      if (activeDoctorsError) {
        throw activeDoctorsError;
      }

      const requestDocs = reqDoctors?.doctors || [];
      const merged = requestDocs.length > 0
        ? requestDocs.map((d: any) => ({
            id: d.id,
            name: d.doctor_name,
            email: d.email,
            phone: d.phone,
            specialization: d.specialization,
            education_details: d.education,
            experience: d.experience,
            age: d.age,
          }))
        : (activeDoctors || []);

      setHospitalDoctors(merged);
      setDetailOpen(true);
    } catch (detailsError) {
      toast({
        title: 'Unable to load hospital details',
        description: detailsError instanceof Error ? detailsError.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mediconnect_admin');
    sessionStorage.removeItem('mediconnect_admin_key');
    navigate('/admin/login');
  };

  const filtered = (hospitals as any[])?.filter((h: any) => h.status === activeTab) || [];
  const hospitalErrorMessage = error instanceof Error ? error.message : 'Unable to fetch hospital data.';

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
          {isLoading ? (
            <p className="text-muted-foreground">{t.common.loading}</p>
          ) : isError ? (
            <p className="text-destructive text-center py-8">{hospitalErrorMessage}</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.admin.noRequests}</p>
          ) : (
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
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(h)}>
                        <Eye className="h-4 w-4 mr-1" />View Details
                      </Button>
                      {h.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateStatus.mutate({ id: h.id, status: 'approved' })}>
                            <CheckCircle className="h-4 w-4 mr-1" />{t.admin.accept}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: h.id, status: 'rejected' })}>
                            <XCircle className="h-4 w-4 mr-1" />{t.admin.deny}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailHospital?.name} – Details</DialogTitle>
          </DialogHeader>
          {detailHospital && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {detailHospital.email}</p>
                <p><strong>Phone:</strong> {detailHospital.phone}</p>
                <p><strong>Location:</strong> {detailHospital.address}, {detailHospital.district}, {detailHospital.state}</p>
                <p><strong>Specializations:</strong> {detailHospital.specializations?.join(', ')}</p>
                <p><strong>Status:</strong> <Badge variant={detailHospital.status === 'approved' ? 'default' : detailHospital.status === 'rejected' ? 'destructive' : 'secondary'}>{detailHospital.status}</Badge></p>
                {detailHospital.upi_qr_url && (
                  <div>
                    <strong>UPI QR:</strong>
                    <img src={detailHospital.upi_qr_url} alt="UPI QR" className="mt-2 max-w-[150px] rounded-lg border" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-base mb-2">Doctors ({hospitalDoctors.length})</h3>
                {hospitalDoctors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No doctors added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {hospitalDoctors.map((d: any) => (
                      <div key={d.id} className="p-3 rounded-lg bg-muted/50 text-sm">
                        <p className="font-medium">Dr. {d.name} {d.age ? `(Age: ${d.age})` : ''}</p>
                        <p className="text-muted-foreground">{d.specialization} · {d.experience} yrs exp</p>
                        {d.education_details && (
                          <p className="text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" />{d.education_details}</p>
                        )}
                        <div className="flex gap-3 text-muted-foreground mt-1">
                          {d.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</span>}
                          {d.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
