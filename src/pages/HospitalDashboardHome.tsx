import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import {
  Calendar, CheckCircle, Clock, XCircle, Users, Stethoscope, TrendingUp,
  AlertTriangle, Star, IndianRupee, ArrowRight, Play, User, Activity
} from 'lucide-react';

const HospitalDashboardHome = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hospital, setHospital] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/hospital-admin/login'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];

  const { data: doctors } = useQuery({
    queryKey: ['hosp-doctors', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*').eq('hospital_id', hospital!.id).eq('status', 'active');
      return data || [];
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ['hosp-appointments', hospital?.id],
    enabled: !!hospital?.id,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialization)')
        .eq('hospital_id', hospital!.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const todayAppts = appointments?.filter((a: any) => a.created_at?.startsWith(today)) || [];
  const confirmed = todayAppts.filter((a: any) => a.status === 'booked' || a.status === 'waiting' || a.status === 'in_progress').length;
  const pending = todayAppts.filter((a: any) => a.status === 'booked').length;
  const completed = todayAppts.filter((a: any) => a.status === 'completed').length;
  const cancelled = todayAppts.filter((a: any) => a.status === 'cancelled').length;
  const allPending = appointments?.filter((a: any) => a.status === 'booked') || [];

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status } as any).eq('id', id);
    if (error) { toast({ title: 'Failed to update', variant: 'destructive' }); return; }
    queryClient.invalidateQueries({ queryKey: ['hosp-appointments'] });
    toast({ title: `Appointment ${status}` });
  };

  if (!hospital) return null;

  const stats = [
    { icon: Calendar, label: "Today's Total", value: todayAppts.length, color: 'text-accent bg-accent/10', path: '/hospital/appointments' },
    { icon: CheckCircle, label: 'Confirmed', value: confirmed, color: 'text-success bg-success/10' },
    { icon: Clock, label: 'Pending', value: pending, color: 'text-warning bg-warning/10', sub: pending > 0 ? 'Action Needed' : undefined },
    { icon: XCircle, label: 'Cancelled', value: cancelled, color: 'text-destructive bg-destructive/10' },
    { icon: Activity, label: 'Completed', value: completed, color: 'text-primary bg-primary/10' },
    { icon: Stethoscope, label: 'Doctors On Duty', value: doctors?.length || 0, color: 'text-accent bg-accent/10' },
  ];

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={pending}>
      <div className="p-6 space-y-6">
        {/* Status Banner */}
        {hospital.status === 'pending' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
            <Clock className="h-5 w-5 text-warning animate-pulse" />
            <p className="text-sm font-medium text-warning">Your hospital is under review. You'll be notified within 24–48 hours.</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map(stat => (
            <Card key={stat.label} className="border-0 card-shadow cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => stat.path && navigate(stat.path)}>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-heading font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.sub && <p className="text-[10px] text-warning font-medium mt-1">{stat.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-2">
            {allPending.length > 0 ? (
              <Card className="border-destructive/20 card-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <CardTitle className="text-base">Action Required — {allPending.length} appointments awaiting confirmation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {allPending.slice(0, 10).map((appt: any) => (
                      <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                            #{appt.token_number || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{appt.patient_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Dr. {appt.doctors?.name || 'N/A'} · {appt.health_problem}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="rounded-lg bg-success hover:bg-success/90 text-success-foreground h-8 text-xs"
                            onClick={() => updateStatus(appt.id, 'waiting')}>
                            <CheckCircle className="h-3 w-3 mr-1" />Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg text-destructive h-8 text-xs"
                            onClick={() => updateStatus(appt.id, 'cancelled')}>
                            <XCircle className="h-3 w-3 mr-1" />Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 card-shadow">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="font-semibold">All Caught Up!</p>
                  <p className="text-sm text-muted-foreground">No pending appointments to review.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Revenue Today */}
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-accent" />Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Today", value: `₹${todayAppts.length * 500}` },
                { label: "This Week", value: `₹${(appointments?.length || 0) * 500}` },
                { label: "This Month", value: `₹${(appointments?.length || 0) * 500}` },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span className="font-heading font-bold text-lg">{r.value}</span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => navigate('/hospital/analytics')}>
                Full Report <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Availability Cards */}
        <Card className="border-0 card-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Doctor Availability</CardTitle>
              <Button variant="ghost" size="sm" className="text-accent text-xs" onClick={() => navigate('/hospital/doctors')}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!doctors || doctors.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">No active doctors.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {doctors.map((doc: any) => {
                  const docAppts = todayAppts.filter((a: any) => a.doctor_id === doc.id);
                  const completedDoc = docAppts.filter((a: any) => a.status === 'completed').length;
                  const totalDoc = docAppts.length;
                  const inProgress = docAppts.some((a: any) => a.status === 'in_progress');

                  return (
                    <div key={doc.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">Dr. {doc.name}</p>
                          <p className="text-[10px] text-muted-foreground">{doc.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={`text-[10px] border-0 ${inProgress ? 'bg-primary/10 text-primary' : totalDoc > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {inProgress ? `In Consultation` : totalDoc > 0 ? 'Available' : 'No Appointments'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{completedDoc}/{totalDoc} done</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card className="border-0 card-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Appointments</CardTitle>
              <Button variant="ghost" size="sm" className="text-accent text-xs" onClick={() => navigate('/hospital/appointments')}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(appointments || []).slice(0, 5).map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                      #{appt.token_number || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{appt.patient_name}</p>
                      <p className="text-xs text-muted-foreground">Dr. {appt.doctors?.name || 'N/A'} · {appt.health_problem}</p>
                    </div>
                  </div>
                  <Badge className={`border-0 text-[10px] ${
                    appt.status === 'completed' ? 'bg-success/10 text-success' :
                    appt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                    appt.status === 'waiting' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {(appt.status || 'booked').replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {(!appointments || appointments.length === 0) && (
                <p className="text-center text-muted-foreground py-6 text-sm">No appointments yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalDashboardHome;
