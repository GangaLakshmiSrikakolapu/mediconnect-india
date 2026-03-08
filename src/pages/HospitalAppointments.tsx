import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import {
  Search, CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp, Download, User
} from 'lucide-react';

const STATUS_TABS = ['all', 'booked', 'waiting', 'in_progress', 'completed', 'cancelled'];

const statusColors: Record<string, string> = {
  booked: 'bg-primary/10 text-primary',
  waiting: 'bg-warning/10 text-warning',
  in_progress: 'bg-accent/10 text-accent',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const HospitalAppointments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hospital, setHospital] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/auth'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const { data: doctors } = useQuery({
    queryKey: ['hosp-docs', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('id, name').eq('hospital_id', hospital!.id);
      return data || [];
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ['hosp-appts', hospital?.id],
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

  const pendingCount = appointments?.filter((a: any) => a.status === 'booked').length || 0;

  const filtered = (appointments || []).filter((a: any) => {
    if (activeTab !== 'all' && a.status !== activeTab) return false;
    if (doctorFilter !== 'all' && a.doctor_id !== doctorFilter) return false;
    if (searchTerm && !a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status } as any).eq('id', id);
    if (error) { toast({ title: 'Update failed', variant: 'destructive' }); return; }
    queryClient.invalidateQueries({ queryKey: ['hosp-appts'] });
    toast({ title: `Status updated to ${status}` });
  };

  const bulkConfirm = async () => {
    for (const id of selectedIds) {
      await supabase.from('appointments').update({ status: 'waiting' } as any).eq('id', id);
    }
    queryClient.invalidateQueries({ queryKey: ['hosp-appts'] });
    setSelectedIds([]);
    toast({ title: `${selectedIds.length} appointments confirmed` });
  };

  const exportCSV = () => {
    const headers = ['Patient,Doctor,Status,Problem,Phone,Date'];
    const rows = filtered.map((a: any) => `${a.patient_name},Dr. ${a.doctors?.name || 'N/A'},${a.status},${a.health_problem},${a.patient_phone || ''},${a.created_at}`);
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointments.csv';
    link.click();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (!hospital) return null;

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={pendingCount}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Appointments</h1>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button size="sm" className="rounded-lg bg-success hover:bg-success/90 text-success-foreground" onClick={bulkConfirm}>
                Confirm {selectedIds.length} Selected
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-lg" onClick={exportCSV}>
              <Download className="h-3 w-3 mr-1" />Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patient..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-xl" />
          </div>
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-[180px] h-9 rounded-xl"><SelectValue placeholder="All Doctors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {(doctors || []).map((d: any) => <SelectItem key={d.id} value={d.id}>Dr. {d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {STATUS_TABS.map(t => (
              <TabsTrigger key={t} value={t} className="capitalize text-xs">
                {t === 'all' ? 'All' : t.replace('_', ' ')}
                {t === 'booked' && pendingCount > 0 && <Badge className="ml-1 bg-warning/20 text-warning text-[10px] h-4 px-1">{pendingCount}</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Card className="border-0 card-shadow">
          <CardContent className="p-0">
            <div className="text-sm text-muted-foreground px-4 py-3 border-b border-border">
              {filtered.length} appointments found
            </div>
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No appointments match your filters.</p>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((appt: any) => (
                  <div key={appt.id}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <input type="checkbox" checked={selectedIds.includes(appt.id)} onChange={() => toggleSelect(appt.id)}
                        className="rounded border-border" />
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                        #{appt.token_number || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{appt.patient_name} <span className="text-muted-foreground font-normal">· {appt.patient_age}y</span></p>
                        <p className="text-xs text-muted-foreground">Dr. {appt.doctors?.name || 'N/A'} · {appt.health_problem}</p>
                      </div>
                      <div className="hidden md:block text-xs text-muted-foreground">
                        {new Date(appt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <Badge className={`${statusColors[appt.status || 'booked']} border-0 text-[10px]`}>
                        {(appt.status || 'booked').replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {appt.status === 'booked' && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-success" onClick={() => updateStatus(appt.id, 'waiting')}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => updateStatus(appt.id, 'cancelled')}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {appt.status === 'waiting' && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-accent" onClick={() => updateStatus(appt.id, 'in_progress')}>
                            Start
                          </Button>
                        )}
                        {appt.status === 'in_progress' && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-success" onClick={() => updateStatus(appt.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}>
                          {expandedId === appt.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {expandedId === appt.id && (
                      <div className="px-4 pb-4 pt-1 bg-muted/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div><span className="text-muted-foreground">Phone:</span> {appt.patient_phone || 'N/A'}</div>
                          <div><span className="text-muted-foreground">Email:</span> {appt.patient_email || 'N/A'}</div>
                          <div><span className="text-muted-foreground">Payment:</span> {appt.payment_status}</div>
                          <div><span className="text-muted-foreground">Transaction:</span> {appt.transaction_id || 'N/A'}</div>
                          <div><span className="text-muted-foreground">Token:</span> #{appt.token_number}</div>
                          <div><span className="text-muted-foreground">Wait Time:</span> {appt.waiting_time} min</div>
                          <div><span className="text-muted-foreground">Specialty:</span> {appt.doctors?.specialization || 'N/A'}</div>
                          <div><span className="text-muted-foreground">Booked:</span> {new Date(appt.created_at).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalAppointments;
