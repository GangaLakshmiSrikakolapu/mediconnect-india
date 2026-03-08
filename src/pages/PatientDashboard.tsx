import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import PatientLayout from '@/components/PatientLayout';
import {
  Calendar, Clock, Heart, Pill, Search, Sparkles, Building2,
  Stethoscope, MapPin, ArrowRight, Star, MoreVertical, Share2,
  CalendarPlus, X as XIcon
} from 'lucide-react';

const statusColors: Record<string, string> = {
  booked: 'bg-success/10 text-success border-success/20',
  waiting: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-accent/10 text-accent border-accent/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusLabels: Record<string, string> = {
  booked: 'Confirmed', waiting: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const HEALTH_TIPS = [
  { category: 'Nutrition', title: 'Top 10 Foods for Heart Health', preview: 'Discover nutrient-rich foods that support cardiovascular wellness and help prevent disease.' },
  { category: 'Fitness', title: '15-Minute Morning Routine', preview: 'Quick exercises to boost energy and mental clarity throughout the day.' },
  { category: 'Mental Health', title: 'Managing Stress at Work', preview: 'Practical tips for maintaining mental well-being during busy work schedules.' },
];

const AI_RECOMMENDATIONS = [
  { icon: '🩺', name: 'Annual Health Checkup', reason: 'Preventive Care', desc: 'Recommended yearly screening for early detection' },
  { icon: '🩸', name: 'Diabetes Screening', reason: 'Based on Profile', desc: 'HbA1c and fasting glucose test' },
  { icon: '👁️', name: 'Eye Checkup', reason: 'Age-appropriate', desc: 'Comprehensive vision and retina exam' },
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['patient-appointments', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialization), hospitals(name, address, district, state)')
        .eq('patient_email', user!.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: hospitals } = useQuery({
    queryKey: ['nearby-hospitals'],
    queryFn: async () => {
      const { data } = await supabase.from('hospitals').select('*').eq('status', 'approved').limit(6);
      return data || [];
    },
  });

  if (!user || authLoading) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient';
  const upcoming = appointments?.filter((a: any) => ['booked', 'waiting'].includes(a.status || '')) || [];
  const past = appointments?.filter((a: any) => a.status === 'completed') || [];
  const profileComplete = user.user_metadata?.blood_group ? 90 : 70;

  return (
    <PatientLayout upcomingCount={upcoming.length}>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1200px]">
        {/* Hero Welcome Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(214, 67%, 37%) 0%, hsl(214, 75%, 22%) 100%)' }}>
            <CardContent className="p-6 md:p-8 flex items-center justify-between">
              <div className="text-white">
                <h1 className="font-heading text-2xl md:text-3xl font-bold mb-1">
                  {getGreeting()}, {userName} 👋
                </h1>
                <p className="text-white/70">
                  {upcoming.length > 0
                    ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''} this week`
                    : 'You have no upcoming appointments'}
                </p>
              </div>
              <div className="hidden md:block text-6xl opacity-20">🏥</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Completion Banner */}
        {profileComplete < 100 && (
          <Card className="border-warning/30 bg-warning/5 border-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="hsl(var(--warning))" strokeWidth="3" strokeDasharray={`${profileComplete}, 100`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-warning">{profileComplete}%</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Complete your profile for better recommendations</p>
                <div className="flex gap-2 mt-1">
                  {!user.user_metadata?.blood_group && <Badge variant="outline" className="text-xs cursor-pointer hover:bg-warning/10">+ Blood Group</Badge>}
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-warning/10">+ Insurance</Badge>
                </div>
              </div>
              <Link to="/patient/profile"><Button size="sm" variant="outline" className="rounded-full text-xs">Complete</Button></Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: 'Upcoming', value: upcoming.length, color: 'bg-primary/10 text-primary', link: '/patient/appointments' },
            { icon: Clock, label: 'Total Visits', value: (appointments?.length || 0), color: 'bg-muted text-muted-foreground', link: '/patient/appointments' },
            { icon: Heart, label: 'Saved Hospitals', value: 0, color: 'bg-destructive/10 text-destructive', link: '/patient/find-hospitals' },
            { icon: Pill, label: 'Prescriptions', value: 0, color: 'bg-success/10 text-success', link: '/patient/records' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={stat.link}>
                <Card className="border-0 card-shadow hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <p className="text-[32px] font-heading font-bold leading-none">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-0 card-shadow">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Appointments
            </CardTitle>
            <Link to="/patient/appointments" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 opacity-30">📅</div>
                <p className="text-muted-foreground font-medium mb-4">No upcoming appointments</p>
                <Link to="/patient/find-hospitals"><Button className="rounded-full">Book Your First Appointment</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 3).map((appt: any) => (
                  <div key={appt.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/[0.02] transition-all group">
                    <div className={`w-1 h-14 rounded-full shrink-0 ${appt.status === 'booked' ? 'bg-success' : 'bg-warning'}`} />
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{(appt as any).hospitals?.name || 'Hospital'}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {(appt as any).doctors?.name || 'Doctor'} · <span className="text-accent">{(appt as any).doctors?.specialization || appt.health_problem}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />Token #{appt.token_number}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />~{appt.waiting_time} min wait
                        </span>
                      </div>
                    </div>
                    <Badge className={`${statusColors[appt.status || 'booked']} border shrink-0 text-xs`}>
                      {statusLabels[appt.status || 'booked']}
                    </Badge>
                    <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(214, 67%, 37%) 0%, hsl(174, 62%, 29%) 100%)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-white" />
              <h3 className="font-heading font-bold text-white text-lg">AI Health Recommendations</h3>
            </div>
            <p className="text-white/60 text-sm mb-5">Personalised based on your health profile</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AI_RECOMMENDATIONS.map(rec => (
                <Card key={rec.name} className="border-0 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <CardContent className="p-4">
                    <span className="text-2xl">{rec.icon}</span>
                    <p className="font-semibold text-white text-sm mt-2">{rec.name}</p>
                    <Badge className="bg-white/20 text-white/90 border-0 text-[10px] mt-1">{rec.reason}</Badge>
                    <p className="text-white/50 text-xs mt-2">{rec.desc}</p>
                    <Link to="/patient/find-hospitals">
                      <Button size="sm" className="mt-3 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs h-8 w-full">
                        Book Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nearby Hospitals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg">Nearby Hospitals</h3>
            <Link to="/patient/find-hospitals" className="text-sm text-primary font-medium hover:underline">See All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
            {!hospitals ? (
              [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-64 shrink-0 rounded-2xl" />)
            ) : hospitals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hospitals found in your area.</p>
            ) : (
              hospitals.map((h: any) => (
                <Card key={h.id} className="border-0 card-shadow w-64 shrink-0 snap-start hover:-translate-y-1 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="w-full h-24 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3">
                      <Building2 className="h-10 w-10 text-primary/30" />
                    </div>
                    <p className="font-semibold text-sm truncate">{h.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="text-xs font-medium">4.5</span>
                      <span className="text-xs text-muted-foreground ml-1">· {h.district}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(h.specializations || []).slice(0, 2).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                      ))}
                    </div>
                    <Link to={`/patient/hospital/${h.id}`}>
                      <Button size="sm" className="w-full mt-3 rounded-xl h-8 text-xs">Book</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Recent Appointments Table */}
        {past.length > 0 && (
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Hospital</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Doctor</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {past.slice(0, 5).map((appt: any) => (
                      <tr key={appt.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-2 text-xs">{new Date(appt.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-2 text-xs font-medium">{(appt as any).hospitals?.name}</td>
                        <td className="py-3 px-2 text-xs">Dr. {(appt as any).doctors?.name}</td>
                        <td className="py-3 px-2">
                          <Badge className="bg-success/10 text-success border-0 text-[10px]">Completed</Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm" className="text-xs h-7">View</Button>
                          <Button variant="ghost" size="sm" className="text-xs h-7 text-primary">Rate</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Tips */}
        <div>
          <h3 className="font-heading font-bold text-lg mb-4">Health Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HEALTH_TIPS.map(tip => (
              <Card key={tip.title} className="border-0 card-shadow hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="w-full h-28 rounded-xl bg-gradient-to-br from-muted to-secondary flex items-center justify-center mb-3">
                    <span className="text-3xl opacity-30">{tip.category === 'Nutrition' ? '🥗' : tip.category === 'Fitness' ? '🏃' : '🧠'}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] mb-2">{tip.category}</Badge>
                  <p className="font-semibold text-sm">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tip.preview}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
