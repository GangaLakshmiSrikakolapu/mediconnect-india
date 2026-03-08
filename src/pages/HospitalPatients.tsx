import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { Search, User, Calendar } from 'lucide-react';

const HospitalPatients = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/hospital-admin/login'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const { data: appointments } = useQuery({
    queryKey: ['hosp-patients', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('*, doctors(name)').eq('hospital_id', hospital!.id).order('created_at', { ascending: false });
      return data || [];
    },
  });

  if (!hospital) return null;

  // Aggregate unique patients
  const patientMap = new Map<string, any>();
  (appointments || []).forEach((a: any) => {
    const key = a.patient_name + (a.patient_phone || '');
    if (!patientMap.has(key)) {
      patientMap.set(key, { name: a.patient_name, age: a.patient_age, phone: a.patient_phone, email: a.patient_email, visits: 0, firstVisit: a.created_at, lastVisit: a.created_at, doctors: new Set() });
    }
    const p = patientMap.get(key)!;
    p.visits++;
    if (a.created_at < p.firstVisit) p.firstVisit = a.created_at;
    if (a.created_at > p.lastVisit) p.lastVisit = a.created_at;
    if (a.doctors?.name) p.doctors.add(a.doctors.name);
  });

  const patients = Array.from(patientMap.values())
    .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={0}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Patients ({patients.length})</h1>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-xl" />
        </div>

        {patients.length === 0 ? (
          <Card className="border-0 card-shadow"><CardContent className="p-12 text-center text-muted-foreground">No patients found.</CardContent></Card>
        ) : (
          <Card className="border-0 card-shadow">
            <CardContent className="p-0 divide-y divide-border">
              {patients.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.name} <span className="text-muted-foreground font-normal">· {p.age}y</span></p>
                    <p className="text-xs text-muted-foreground">{p.phone || 'No phone'} · {p.email || 'No email'}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                    <span><Calendar className="h-3 w-3 inline mr-1" />{p.visits} visits</span>
                    <span>Doctors: {Array.from(p.doctors).slice(0, 2).map((d: any) => `Dr. ${d}`).join(', ')}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Last: {new Date(p.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalPatients;
