import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { LogOut, Users, CheckCircle, Clock, Play, Stethoscope } from 'lucide-react';

type DoctorInfo = {
  id: string;
  name: string;
  hospital_id: string;
  specialization: string | string[];
};

const statusColors: Record<string, string> = {
  booked: 'bg-blue-100 text-blue-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  'in_progress': 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_doctor');
    if (!stored) {
      navigate('/doctor/login');
      return;
    }
    setDoctor(JSON.parse(stored));
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', doctor?.id, today],
    enabled: !!doctor?.id,
    refetchInterval: 15000, // Auto-refresh every 15s
    queryFn: async () => {
      // Get today's slots for this doctor
      const { data: slots } = await supabase
        .from('time_slots')
        .select('id, slot_time')
        .eq('doctor_id', doctor!.id)
        .eq('slot_date', today);

      if (!slots || slots.length === 0) return [];

      const slotIds = slots.map(s => s.id);
      const slotTimeMap = Object.fromEntries(slots.map(s => [s.id, s.slot_time]));

      const { data: appts, error } = await supabase
        .from('appointments')
        .select('*')
        .in('slot_id', slotIds)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (appts || []).map(a => ({
        ...a,
        slot_time: slotTimeMap[a.slot_id || ''] || '',
      })).sort((a: any, b: any) => (a.token_number || 0) - (b.token_number || 0));
    },
  });

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus } as any)
        .eq('id', appointmentId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast({ title: `Status updated to ${newStatus}` });
    } catch (err) {
      console.error('Status update error:', err);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mediconnect_doctor');
    navigate('/doctor/login');
  };

  if (!doctor) return null;

  const totalPatients = appointments?.length || 0;
  const completed = appointments?.filter((a: any) => a.status === 'completed').length || 0;
  const waiting = appointments?.filter((a: any) => a.status === 'booked' || a.status === 'waiting').length || 0;

  return (
    <div className="container py-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            Dr. {doctor.name}
          </h1>
          <p className="text-muted-foreground text-sm">{Array.isArray(doctor.specialization) ? doctor.specialization.join(', ') : doctor.specialization} · {today}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-1" />Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalPatients}</p>
            <p className="text-xs text-muted-foreground">Total Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{waiting}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
          <CardDescription>Patients are ordered by token number</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading appointments...</p>
          ) : !appointments || appointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No appointments for today.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {appt.token_number || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{appt.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appt.slot_time} · {appt.health_problem}
                        {appt.patient_phone && ` · ${appt.patient_phone}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[appt.status || 'booked'] || 'bg-muted'}>
                      {(appt.status || 'booked').replace('_', ' ')}
                    </Badge>
                    {appt.status === 'booked' && (
                      <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(appt.id, 'waiting')}>
                        <Clock className="h-3 w-3 mr-1" />Waiting
                      </Button>
                    )}
                    {appt.status === 'waiting' && (
                      <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(appt.id, 'in_progress')}>
                        <Play className="h-3 w-3 mr-1" />Start
                      </Button>
                    )}
                    {appt.status === 'in_progress' && (
                      <Button size="sm" onClick={() => updateAppointmentStatus(appt.id, 'completed')}>
                        <CheckCircle className="h-3 w-3 mr-1" />Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
