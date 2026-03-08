import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Search, Calendar } from 'lucide-react';

const statusColors: Record<string, string> = {
  booked: 'bg-primary/10 text-primary', waiting: 'bg-warning/10 text-warning',
  in_progress: 'bg-accent/10 text-accent', completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const SuperAdminAppointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: appointments } = useQuery({
    queryKey: ['sa-all-appointments'],
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('*, hospitals(name), doctors(name, specialization)').order('created_at', { ascending: false }).limit(200);
      return data || [];
    },
  });

  const filtered = (appointments || []).filter((a: any) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchTerm && !a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">All Appointments ({(appointments || []).length})</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patient..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-xl" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="border-0 card-shadow">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No appointments found.</p>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                      #{a.token_number || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{a.patient_name} <span className="text-muted-foreground font-normal">· {a.patient_age}y</span></p>
                      <p className="text-xs text-muted-foreground">{(a as any).hospitals?.name || 'Hospital'} · Dr. {(a as any).doctors?.name || 'N/A'}</p>
                    </div>
                    <div className="hidden md:block text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString('en-IN')}</div>
                    <Badge className={`${statusColors[a.status || 'booked']} border-0 text-[10px]`}>{a.status || 'booked'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAppointments;
