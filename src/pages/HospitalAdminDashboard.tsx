import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  LogOut, Building2, Users, Calendar, Clock, CheckCircle, Stethoscope,
  XCircle, Play, User, Activity, TrendingUp, BarChart3
} from 'lucide-react';

const statusColors: Record<string, string> = {
  booked: 'bg-primary/10 text-primary',
  waiting: 'bg-warning/10 text-warning',
  in_progress: 'bg-accent/10 text-accent',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const HospitalAdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hospital, setHospital] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/hospital-admin/login'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];

  const { data: doctors } = useQuery({
    queryKey: ['hospital-doctors', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('*').eq('hospital_id', hospital!.id).eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['hospital-appointments', hospital?.id],
    enabled: !!hospital?.id,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialization)')
        .eq('hospital_id', hospital!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const todayAppointments = appointments?.filter((a: any) => a.created_at?.startsWith(today)) || [];
  const confirmed = todayAppointments.filter((a: any) => a.status !== 'cancelled').length;
  const completed = todayAppointments.filter((a: any) => a.status === 'completed').length;
  const pending = todayAppointments.filter((a: any) => a.status === 'booked').length;

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('appointments').update({ status } as any).eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['hospital-appointments'] });
      toast({ title: `Status updated to ${status}` });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mediconnect_hospital_admin');
    navigate('/hospital-admin/login');
  };

  if (!hospital) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold">{hospital.name}</h1>
              <p className="text-sm text-muted-foreground">{hospital.district}, {hospital.state} · <Badge className="bg-success/10 text-success border-0 text-xs">Verified ✓</Badge></p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Calendar, label: "Today's Total", value: todayAppointments.length, color: 'text-primary bg-primary/10' },
            { icon: CheckCircle, label: 'Confirmed', value: confirmed, color: 'text-success bg-success/10' },
            { icon: Clock, label: 'Pending', value: pending, color: 'text-warning bg-warning/10' },
            { icon: Activity, label: 'Completed', value: completed, color: 'text-accent bg-accent/10' },
            { icon: Stethoscope, label: 'Doctors', value: doctors?.length || 0, color: 'text-primary bg-primary/10' },
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="doctors">Doctors ({doctors?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>Manage patient appointments for your hospital</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : !appointments || appointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No appointments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appt: any) => (
                      <div key={appt.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            #{appt.token_number || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{appt.patient_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Dr. {appt.doctors?.name || 'N/A'} · {appt.health_problem}
                              {appt.patient_phone && ` · ${appt.patient_phone}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusColors[appt.status || 'booked']} border-0`}>
                            {(appt.status || 'booked').replace('_', ' ')}
                          </Badge>
                          {appt.status === 'booked' && (
                            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => updateStatus(appt.id, 'waiting')}>
                              <Clock className="h-3 w-3 mr-1" />Waiting
                            </Button>
                          )}
                          {appt.status === 'booked' && (
                            <Button size="sm" variant="outline" className="rounded-lg text-destructive" onClick={() => updateStatus(appt.id, 'cancelled')}>
                              <XCircle className="h-3 w-3 mr-1" />Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors">
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle>Hospital Doctors</CardTitle>
                <CardDescription>Active doctors in your hospital</CardDescription>
              </CardHeader>
              <CardContent>
                {!doctors || doctors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active doctors.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Dr. {doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.specialization} · {doc.experience} yrs exp</p>
                          {doc.email && <p className="text-xs text-muted-foreground">{doc.email}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HospitalAdminDashboard;
