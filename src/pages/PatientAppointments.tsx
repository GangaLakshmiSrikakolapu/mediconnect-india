import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import PatientLayout from '@/components/PatientLayout';
import {
  Calendar, Clock, Building2, Stethoscope, MoreVertical,
  CalendarPlus, X, Download, Star, Share2, ArrowRight
} from 'lucide-react';

const statusColors: Record<string, string> = {
  booked: 'bg-success/10 text-success border-success/20',
  waiting: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-accent/10 text-accent border-accent/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const PatientAppointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [detailAppt, setDetailAppt] = useState<any>(null);
  const [reviewAppt, setReviewAppt] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['patient-all-appointments', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*, doctors(name, specialization), hospitals(name, address, district)')
        .eq('patient_email', user!.email)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const upcoming = appointments?.filter((a: any) => ['booked', 'waiting', 'in_progress'].includes(a.status || '')) || [];
  const past = appointments?.filter((a: any) => a.status === 'completed') || [];
  const cancelled = appointments?.filter((a: any) => a.status === 'cancelled') || [];

  const handleCancel = async () => {
    if (!cancelId) return;
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', cancelId);
    queryClient.invalidateQueries({ queryKey: ['patient-all-appointments'] });
    setCancelId(null);
    setCancelReason('');
    toast({ title: 'Appointment cancelled' });
  };

  const AppointmentCard = ({ appt, showActions = true }: { appt: any; showActions?: boolean }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-all ${appt.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <div className={`w-1 h-16 rounded-full shrink-0 ${appt.status === 'cancelled' ? 'bg-destructive/40' : appt.status === 'completed' ? 'bg-success' : appt.status === 'booked' ? 'bg-success' : 'bg-warning'}`} />
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Building2 className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{appt.hospitals?.name || 'Hospital'}</p>
        <p className="text-xs text-muted-foreground">Dr. {appt.doctors?.name} · {appt.doctors?.specialization}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />{new Date(appt.created_at).toLocaleDateString('en-IN')}
          </span>
          <span className="text-xs text-muted-foreground">Token #{appt.token_number}</span>
        </div>
      </div>
      <Badge className={`${statusColors[appt.status || 'booked']} border text-[10px] shrink-0`}>
        {(appt.status || 'booked').replace('_', ' ')}
      </Badge>
      {showActions && appt.status !== 'cancelled' && appt.status !== 'completed' && (
        <div className="flex gap-1 shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg" onClick={() => setDetailAppt(appt)}>View</Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 rounded-lg text-destructive" onClick={() => setCancelId(appt.id)}>Cancel</Button>
        </div>
      )}
      {appt.status === 'completed' && (
        <div className="flex gap-1 shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg" onClick={() => setDetailAppt(appt)}>View</Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 rounded-lg text-primary" onClick={() => setReviewAppt(appt)}>Rate</Button>
        </div>
      )}
    </div>
  );

  return (
    <PatientLayout upcomingCount={upcoming.length}>
      <div className="p-4 md:p-6 lg:p-8 max-w-[1000px]">
        <h1 className="font-heading text-2xl font-bold mb-6">My Appointments</h1>

        <Tabs defaultValue="upcoming">
          <TabsList className="bg-muted/50 mb-4">
            <TabsTrigger value="upcoming" className="text-xs">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past" className="text-xs">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 opacity-30">📅</div>
                <p className="text-muted-foreground font-medium mb-4">No upcoming appointments</p>
                <Link to="/patient/find-hospitals"><Button className="rounded-full">Book Appointment</Button></Link>
              </div>
            ) : upcoming.map((a: any) => <AppointmentCard key={a.id} appt={a} />)}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {past.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No past appointments</p>
            ) : past.map((a: any) => <AppointmentCard key={a.id} appt={a} />)}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelled.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No cancelled appointments</p>
            ) : cancelled.map((a: any) => <AppointmentCard key={a.id} appt={a} showActions={false} />)}
          </TabsContent>
        </Tabs>

        {/* Cancel Modal */}
        <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Cancel Appointment?</DialogTitle></DialogHeader>
            <Select value={cancelReason} onValueChange={setCancelReason}>
              <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduling">Scheduling conflict</SelectItem>
                <SelectItem value="feeling_better">Feeling better</SelectItem>
                <SelectItem value="doctor_unavailable">Doctor unavailable</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelId(null)}>No, Keep It</Button>
              <Button variant="destructive" onClick={handleCancel}>Yes, Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={!!detailAppt} onOpenChange={() => setDetailAppt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Appointment Details</DialogTitle></DialogHeader>
            {detailAppt && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{detailAppt.hospitals?.name}</p>
                    <p className="text-xs text-muted-foreground">{detailAppt.hospitals?.district}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/30"><span className="text-muted-foreground">Doctor:</span><br /><strong>Dr. {detailAppt.doctors?.name}</strong></div>
                  <div className="p-2 rounded-lg bg-muted/30"><span className="text-muted-foreground">Specialty:</span><br /><strong>{detailAppt.doctors?.specialization}</strong></div>
                  <div className="p-2 rounded-lg bg-muted/30"><span className="text-muted-foreground">Token:</span><br /><strong>#{detailAppt.token_number}</strong></div>
                  <div className="p-2 rounded-lg bg-muted/30"><span className="text-muted-foreground">Status:</span><br /><strong>{detailAppt.status}</strong></div>
                  <div className="p-2 rounded-lg bg-muted/30 col-span-2"><span className="text-muted-foreground">Problem:</span><br /><strong>{detailAppt.health_problem}</strong></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Modal */}
        <Dialog open={!!reviewAppt} onOpenChange={() => setReviewAppt(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Rate Your Experience</DialogTitle></DialogHeader>
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star className={`h-8 w-8 transition-colors ${s <= rating ? 'text-warning fill-warning' : 'text-muted'}`} />
                </button>
              ))}
            </div>
            <Textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." rows={3} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewAppt(null)}>Skip</Button>
              <Button onClick={() => { toast({ title: 'Thank you for your review!' }); setReviewAppt(null); }}>Submit Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  );
};

export default PatientAppointments;
