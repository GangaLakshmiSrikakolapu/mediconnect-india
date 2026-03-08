import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  LogOut, Calendar, Clock, Heart, Pill, Search, Sparkles,
  User, Building2, Stethoscope, MapPin, FileText, ArrowRight
} from 'lucide-react';

const statusColors: Record<string, string> = {
  booked: 'bg-primary/10 text-primary',
  waiting: 'bg-warning/10 text-warning',
  in_progress: 'bg-accent/10 text-accent',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/patient/login');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [navigate]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['patient-appointments', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialization), hospitals(name, address, district)')
        .eq('patient_email', user!.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient';
  const upcoming = appointments?.filter((a: any) => a.status === 'booked' || a.status === 'waiting') || [];
  const past = appointments?.filter((a: any) => a.status === 'completed') || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container py-8 max-w-5xl">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">
              Welcome, {userName} 👋
            </h1>
            <p className="text-muted-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Calendar, label: 'Upcoming', value: upcoming.length, color: 'text-primary bg-primary/10' },
            { icon: Clock, label: 'Past Visits', value: past.length, color: 'text-muted-foreground bg-muted' },
            { icon: Heart, label: 'Saved', value: 0, color: 'text-destructive bg-destructive/10' },
            { icon: Pill, label: 'Prescriptions', value: 0, color: 'text-success bg-success/10' },
          ].map(stat => (
            <Card key={stat.label} className="border-0 card-shadow">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-heading font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/find-hospital">
            <Card className="border-0 card-shadow hover:card-shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold">Find Hospital</p>
                  <p className="text-xs text-muted-foreground">Search & book appointments</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/insurance">
            <Card className="border-0 card-shadow hover:card-shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-heading font-bold">Insurance</p>
                  <p className="text-xs text-muted-foreground">Explore plans & coverage</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Card className="border-0 card-shadow bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="font-heading font-bold">AI Recommendations</p>
                <p className="text-xs text-muted-foreground">Personalized for you</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-0 card-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium mb-4">No upcoming appointments</p>
                <Link to="/find-hospital">
                  <Button className="rounded-xl">Book Now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt: any) => (
                  <div key={appt.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{appt.hospitals?.name || 'Hospital'}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {appt.doctors?.name || 'Doctor'} · {appt.doctors?.specialization || appt.health_problem}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Token #{appt.token_number} · Est. wait: {appt.waiting_time} min
                      </p>
                    </div>
                    <Badge className={`${statusColors[appt.status || 'booked']} border-0 shrink-0`}>
                      {(appt.status || 'booked').replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Appointments */}
        {past.length > 0 && (
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Past Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {past.slice(0, 5).map((appt: any) => (
                  <div key={appt.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Stethoscope className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{appt.hospitals?.name || 'Hospital'}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {appt.doctors?.name || 'Doctor'} · {appt.health_problem}
                      </p>
                    </div>
                    <Badge className="bg-success/10 text-success border-0 shrink-0">Completed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
