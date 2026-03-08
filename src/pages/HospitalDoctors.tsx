import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { Plus, User, Star, Calendar, Edit, Search } from 'lucide-react';

const SPECIALIZATIONS = ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology', 'Gynecology', 'Neurology', 'Psychiatry', 'Dentistry', 'Urology'];

const HospitalDoctors = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hospital, setHospital] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [addStep, setAddStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '', experience: '', age: '', education_details: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/auth'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const { data: doctors } = useQuery({
    queryKey: ['hosp-doctors-page', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*').eq('hospital_id', hospital!.id).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ['hosp-appts-docs', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('doctor_id, status').eq('hospital_id', hospital!.id);
      return data || [];
    },
  });

  const pendingCount = appointments?.filter((a: any) => a.status === 'booked').length || 0;

  const filtered = (doctors || []).filter((d: any) => {
    if (specFilter !== 'all' && d.specialization !== specFilter) return false;
    if (searchTerm && !d.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getDoctorStats = (doctorId: string) => {
    const docAppts = (appointments || []).filter((a: any) => a.doctor_id === doctorId);
    return { total: docAppts.length, completed: docAppts.filter((a: any) => a.status === 'completed').length };
  };

  const handleAddDoctor = async () => {
    if (!form.name || !form.specialization) { toast({ title: 'Name and specialization required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('doctors').insert({
        hospital_id: hospital!.id,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        specialization: form.specialization,
        experience: parseInt(form.experience) || 0,
        age: parseInt(form.age) || null,
        education_details: form.education_details || null,
        status: 'active',
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['hosp-doctors-page'] });
      toast({ title: 'Doctor added successfully!' });
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', specialization: '', experience: '', age: '', education_details: '' });
      setAddStep(1);
    } catch {
      toast({ title: 'Failed to add doctor', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!hospital) return null;

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={pendingCount}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Doctors ({doctors?.length || 0})</h1>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" />Add Doctor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Doctor — Step {addStep} of 2</DialogTitle>
              </DialogHeader>
              {addStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dr. Name" /></div>
                    <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="doctor@email.com" /></div>
                    <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91..." /></div>
                    <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                  </div>
                  <div>
                    <Label>Specialization *</Label>
                    <Select value={form.specialization} onValueChange={v => setForm({...form, specialization: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full rounded-xl" onClick={() => setAddStep(2)}>Next</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Experience (years)</Label><Input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} /></div>
                  </div>
                  <div>
                    <Label>Education / Qualifications</Label>
                    <Input value={form.education_details} onChange={e => setForm({...form, education_details: e.target.value})} placeholder="MBBS, MD..." />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setAddStep(1)}>Back</Button>
                    <Button className="flex-1 rounded-xl bg-accent hover:bg-accent/90" onClick={handleAddDoctor} disabled={saving}>
                      {saving ? 'Creating...' : 'Create Doctor'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search doctors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-xl" />
          </div>
          <Select value={specFilter} onValueChange={setSpecFilter}>
            <SelectTrigger className="w-[180px] h-9 rounded-xl"><SelectValue placeholder="All Specialties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Doctor Grid */}
        {filtered.length === 0 ? (
          <Card className="border-0 card-shadow"><CardContent className="p-12 text-center text-muted-foreground">No doctors found.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc: any) => {
              const stats = getDoctorStats(doc.id);
              return (
                <Card key={doc.id} className="border-0 card-shadow hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <User className="h-7 w-7 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-base truncate">Dr. {doc.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{doc.specialization}</Badge>
                        {doc.education_details && <p className="text-[10px] text-muted-foreground mt-1 truncate">{doc.education_details}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{doc.experience} yrs exp</span>
                      {doc.email && <span>· {doc.email}</span>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground"><Calendar className="h-3 w-3 inline mr-1" />{stats.total} appts</span>
                        <span className="text-success">{stats.completed} done</span>
                      </div>
                      <Badge className={`border-0 text-[10px] ${doc.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {doc.status || 'active'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalDoctors;
