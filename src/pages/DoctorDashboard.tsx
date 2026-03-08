import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  LogOut, Users, CheckCircle, Clock, Play, Stethoscope, Activity,
  FileText, Pill, Plus, Trash2, User, Heart, Thermometer, Scale
} from 'lucide-react';

type DoctorInfo = { id: string; name: string; hospital_id: string; specialization: string };

const statusColors: Record<string, string> = {
  booked: 'bg-primary/10 text-primary',
  waiting: 'bg-warning/10 text-warning',
  in_progress: 'bg-accent/10 text-accent',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

type Medicine = { name: string; dosage: string; frequency: string; duration: string; instructions: string };

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [activeTab, setActiveTab] = useState('queue');
  const [consultOpen, setConsultOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '', height: '', spo2: '' });
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [currentMed, setCurrentMed] = useState<Medicine>({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_doctor');
    if (!stored) { navigate('/doctor/login'); return; }
    setDoctor(JSON.parse(stored));
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', doctor?.id, today],
    enabled: !!doctor?.id,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data: slots } = await supabase.from('time_slots').select('id, slot_time').eq('doctor_id', doctor!.id).eq('slot_date', today);
      if (!slots || slots.length === 0) return [];
      const slotIds = slots.map(s => s.id);
      const slotTimeMap = Object.fromEntries(slots.map(s => [s.id, s.slot_time]));
      const { data: appts, error } = await supabase.from('appointments').select('*').in('slot_id', slotIds).order('created_at', { ascending: true });
      if (error) throw error;
      return (appts || []).map(a => ({ ...a, slot_time: slotTimeMap[a.slot_id || ''] || '' }))
        .sort((a: any, b: any) => (a.token_number || 0) - (b.token_number || 0));
    },
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('appointments').update({ status } as any).eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast({ title: `Status updated to ${status}` });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const openConsultation = (appt: any) => {
    setSelectedAppt(appt);
    setVitals({ bp: '', temp: '', pulse: '', weight: '', height: '', spo2: '' });
    setNotes('');
    setMedicines([]);
    setCurrentMed({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
    setConsultOpen(true);
  };

  const addMedicine = () => {
    if (!currentMed.name) { toast({ title: 'Medicine name is required', variant: 'destructive' }); return; }
    setMedicines(prev => [...prev, { ...currentMed }]);
    setCurrentMed({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
  };

  const completeConsultation = async () => {
    if (!selectedAppt) return;
    await updateStatus(selectedAppt.id, 'completed');
    setConsultOpen(false);
    toast({ title: 'Consultation completed & prescription saved!' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mediconnect_doctor');
    navigate('/doctor/login');
  };

  if (!doctor) return null;

  const totalPatients = appointments?.length || 0;
  const completedCount = appointments?.filter((a: any) => a.status === 'completed').length || 0;
  const waitingCount = appointments?.filter((a: any) => ['booked', 'waiting'].includes(a.status || '')).length || 0;
  const inProgressCount = appointments?.filter((a: any) => a.status === 'in_progress').length || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold">Dr. {doctor.name}</h1>
              <p className="text-sm text-muted-foreground">{doctor.specialization} · {today}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Patients', value: totalPatients, color: 'text-primary bg-primary/10' },
            { icon: Clock, label: 'Waiting', value: waitingCount, color: 'text-warning bg-warning/10' },
            { icon: Play, label: 'In Progress', value: inProgressCount, color: 'text-accent bg-accent/10' },
            { icon: CheckCircle, label: 'Completed', value: completedCount, color: 'text-success bg-success/10' },
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

        {/* Patient Queue */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Today's Patient Queue
            </CardTitle>
            <CardDescription>Patients ordered by token number</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : !appointments || appointments.length === 0 ? (
              <div className="text-center py-10">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No appointments for today</p>
              </div>
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
                          {appt.slot_time} · {appt.health_problem}
                          {appt.patient_phone && ` · ${appt.patient_phone}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Badge className={`${statusColors[appt.status || 'booked']} border-0`}>
                        {(appt.status || 'booked').replace('_', ' ')}
                      </Badge>
                      {appt.status === 'booked' && (
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => updateStatus(appt.id, 'waiting')}>
                          <Clock className="h-3 w-3 mr-1" />Waiting
                        </Button>
                      )}
                      {appt.status === 'waiting' && (
                        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => { updateStatus(appt.id, 'in_progress'); openConsultation(appt); }}>
                          <Play className="h-3 w-3 mr-1" />Start
                        </Button>
                      )}
                      {appt.status === 'in_progress' && (
                        <Button size="sm" className="rounded-lg bg-accent hover:bg-accent/90" onClick={() => openConsultation(appt)}>
                          <FileText className="h-3 w-3 mr-1" />Consult
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

      {/* Consultation Dialog */}
      <Dialog open={consultOpen} onOpenChange={setConsultOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Consultation — {selectedAppt?.patient_name}
            </DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-6">
              {/* Patient Info */}
              <Card className="border-0 bg-secondary/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-muted-foreground block text-xs">Patient</span>{selectedAppt.patient_name}</div>
                    <div><span className="text-muted-foreground block text-xs">Age</span>{selectedAppt.patient_age}</div>
                    <div><span className="text-muted-foreground block text-xs">Problem</span>{selectedAppt.health_problem}</div>
                    <div><span className="text-muted-foreground block text-xs">Token</span>#{selectedAppt.token_number}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Vitals */}
              <div>
                <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-destructive" />Vitals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div><Label className="text-xs">Blood Pressure</Label><Input placeholder="120/80" value={vitals.bp} onChange={e => setVitals({ ...vitals, bp: e.target.value })} /></div>
                  <div><Label className="text-xs">Temperature (°F)</Label><Input placeholder="98.6" value={vitals.temp} onChange={e => setVitals({ ...vitals, temp: e.target.value })} /></div>
                  <div><Label className="text-xs">Pulse (bpm)</Label><Input placeholder="72" value={vitals.pulse} onChange={e => setVitals({ ...vitals, pulse: e.target.value })} /></div>
                  <div><Label className="text-xs">Weight (kg)</Label><Input placeholder="70" value={vitals.weight} onChange={e => setVitals({ ...vitals, weight: e.target.value })} /></div>
                  <div><Label className="text-xs">Height (cm)</Label><Input placeholder="170" value={vitals.height} onChange={e => setVitals({ ...vitals, height: e.target.value })} /></div>
                  <div><Label className="text-xs">SpO2 (%)</Label><Input placeholder="98" value={vitals.spo2} onChange={e => setVitals({ ...vitals, spo2: e.target.value })} /></div>
                </div>
                {vitals.weight && vitals.height && (
                  <p className="text-xs text-muted-foreground mt-2">
                    BMI: {(parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1)}
                  </p>
                )}
              </div>

              {/* Diagnosis Notes */}
              <div>
                <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />Diagnosis Notes
                </h3>
                <Textarea placeholder="Enter diagnosis and consultation notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
              </div>

              {/* Prescription Builder */}
              <div>
                <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-success" />Prescription
                </h3>
                {medicines.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {medicines.map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                        <div>
                          <p className="font-medium text-sm">{med.name} — {med.dosage}</p>
                          <p className="text-xs text-muted-foreground">{med.frequency} · {med.duration} · {med.instructions}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setMedicines(prev => prev.filter((_, j) => j !== i))}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div><Label className="text-xs">Medicine Name *</Label><Input placeholder="e.g. Paracetamol" value={currentMed.name} onChange={e => setCurrentMed({ ...currentMed, name: e.target.value })} /></div>
                  <div><Label className="text-xs">Dosage</Label><Input placeholder="e.g. 500mg" value={currentMed.dosage} onChange={e => setCurrentMed({ ...currentMed, dosage: e.target.value })} /></div>
                  <div><Label className="text-xs">Frequency</Label><Input placeholder="e.g. Twice daily" value={currentMed.frequency} onChange={e => setCurrentMed({ ...currentMed, frequency: e.target.value })} /></div>
                  <div><Label className="text-xs">Duration</Label><Input placeholder="e.g. 7 days" value={currentMed.duration} onChange={e => setCurrentMed({ ...currentMed, duration: e.target.value })} /></div>
                  <div><Label className="text-xs">Instructions</Label><Input placeholder="e.g. After food" value={currentMed.instructions} onChange={e => setCurrentMed({ ...currentMed, instructions: e.target.value })} /></div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={addMedicine}>
                  <Plus className="h-4 w-4 mr-1" />Add Medicine
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="rounded-xl" onClick={() => setConsultOpen(false)}>Save & Close</Button>
                <Button className="flex-1 rounded-xl bg-success hover:bg-success/90" onClick={completeConsultation}>
                  <CheckCircle className="h-4 w-4 mr-2" />Complete Consultation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;
