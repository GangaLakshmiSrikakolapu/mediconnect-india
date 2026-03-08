import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  CheckCircle, XCircle, MapPin, LogOut, Eye, GraduationCap, Phone, Mail,
  Building2, Users, Calendar, Activity, Shield, TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [detailHospital, setDetailHospital] = useState<any>(null);
  const [hospitalDoctors, setHospitalDoctors] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('mediconnect_admin')) navigate('/admin/login');
  }, [navigate]);

  const adminKey = sessionStorage.getItem('mediconnect_admin_key') || '';

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['admin-hospitals'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', { body: { key: adminKey, action: 'list' } });
      if (error) throw error;
      return data?.hospitals || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', { body: { key: adminKey, action: 'update_status', hospitalId: id, status } });
      if (error || data?.error) throw new Error(data?.error || 'Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hospitals'] });
      toast({ title: 'Hospital status updated' });
    },
  });

  const handleViewDetails = async (hospital: any) => {
    setDetailHospital(hospital);
    const { data: reqDoctors } = await supabase.functions.invoke('admin-hospitals', { body: { key: adminKey, action: 'get_doctors_request', hospitalId: hospital.id } });
    const { data: activeDoctors } = await supabase.from('doctors').select('*').eq('hospital_id', hospital.id);
    const requestDocs = reqDoctors?.doctors || [];
    setHospitalDoctors(requestDocs.length > 0 ? requestDocs.map((d: any) => ({
      id: d.id, name: d.doctor_name, email: d.email, phone: d.phone,
      specialization: d.specialization, education_details: d.education, experience: d.experience, age: d.age,
    })) : (activeDoctors || []));
    setDetailOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mediconnect_admin');
    sessionStorage.removeItem('mediconnect_admin_key');
    navigate('/admin/login');
  };

  const allHospitals = (hospitals as any[]) || [];
  const filtered = allHospitals.filter((h: any) => h.status === activeTab);
  const pendingCount = allHospitals.filter((h: any) => h.status === 'pending').length;
  const approvedCount = allHospitals.filter((h: any) => h.status === 'approved').length;
  const rejectedCount = allHospitals.filter((h: any) => h.status === 'rejected').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold">Super Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform management & hospital verification</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: 'Total', value: allHospitals.length, color: 'text-primary bg-primary/10' },
            { icon: Calendar, label: 'Pending', value: pendingCount, color: 'text-warning bg-warning/10' },
            { icon: CheckCircle, label: 'Approved', value: approvedCount, color: 'text-success bg-success/10' },
            { icon: XCircle, label: 'Rejected', value: rejectedCount, color: 'text-destructive bg-destructive/10' },
          ].map(stat => (
            <Card key={stat.label} className="border-0 card-shadow">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-xl font-heading font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No {activeTab} hospitals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((h: any) => (
                  <Card key={h.id} className="border-0 card-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-heading font-bold">{h.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{h.address}, {h.district}, {h.state}</p>
                          <p className="text-xs text-muted-foreground mt-1">{h.email} · {h.phone}</p>
                        </div>
                        <Badge variant={h.status === 'approved' ? 'default' : h.status === 'rejected' ? 'destructive' : 'secondary'}>{h.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {h.specializations?.map((s: string) => (
                          <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleViewDetails(h)}>
                          <Eye className="h-4 w-4 mr-1" />Details
                        </Button>
                        {h.status === 'pending' && (
                          <>
                            <Button size="sm" className="rounded-lg" onClick={() => updateStatus.mutate({ id: h.id, status: 'approved' })}>
                              <CheckCircle className="h-4 w-4 mr-1" />Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => updateStatus.mutate({ id: h.id, status: 'rejected' })}>
                              <XCircle className="h-4 w-4 mr-1" />Reject
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

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{detailHospital?.name} — Details</DialogTitle></DialogHeader>
            {detailHospital && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground block text-xs">Email</span>{detailHospital.email}</div>
                  <div><span className="text-muted-foreground block text-xs">Phone</span>{detailHospital.phone}</div>
                  <div><span className="text-muted-foreground block text-xs">Location</span>{detailHospital.district}, {detailHospital.state}</div>
                  <div><span className="text-muted-foreground block text-xs">Address</span>{detailHospital.address}</div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm mb-2">Doctors ({hospitalDoctors.length})</h3>
                  {hospitalDoctors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No doctors added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {hospitalDoctors.map((d: any) => (
                        <div key={d.id} className="p-3 rounded-xl bg-secondary/50 text-sm">
                          <p className="font-medium">Dr. {d.name} {d.age ? `· Age ${d.age}` : ''}</p>
                          <p className="text-xs text-muted-foreground">{d.specialization} · {d.experience} yrs</p>
                          {d.education_details && <p className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" />{d.education_details}</p>}
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
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
    </div>
  );
};

export default AdminDashboard;
