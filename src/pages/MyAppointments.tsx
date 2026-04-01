import { useNavigate } from 'react-router-dom';
import { usePatient } from '@/contexts/PatientContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Stethoscope } from 'lucide-react';
import { useEffect } from 'react';

const statusColors: Record<string, string> = {
  booked: 'bg-blue-100 text-blue-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const MyAppointments = () => {
  const navigate = useNavigate();
  const { patient, isLoggedIn } = usePatient();

  useEffect(() => {
    if (!isLoggedIn) navigate('/patient/login');
  }, [isLoggedIn, navigate]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['my-appointments', patient?.id],
    enabled: !!patient?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          hospitals:hospital_id(name),
          doctors:doctor_id(name, specialization),
          time_slots:slot_id(slot_date, slot_time)
        `)
        .eq('patient_id', patient!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (!patient) return null;

  return (
    <div className="container py-8 max-w-3xl animate-fade-in">
      <h1 className="font-heading text-2xl font-bold mb-6">My Appointments</h1>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : !appointments || appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No appointments yet.</p>
            <Button onClick={() => navigate('/find-hospital')}>Book an Appointment</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt: any) => (
            <Card key={appt.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">
                      {(appt.hospitals as any)?.name || 'Hospital'}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      Dr. {(appt.doctors as any)?.name || 'N/A'} — {Array.isArray((appt.doctors as any)?.specialization) ? (appt.doctors as any).specialization.join(', ') : ((appt.doctors as any)?.specialization || '')}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {(appt.time_slots as any)?.slot_date || 'N/A'}
                      <Clock className="h-3.5 w-3.5 ml-2" />
                      {(appt.time_slots as any)?.slot_time || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Problem: {appt.health_problem} · Token: #{appt.token_number || '-'}
                    </p>
                  </div>
                  <Badge className={statusColors[appt.status || 'booked'] || 'bg-muted'}>
                    {(appt.status || 'booked').replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
