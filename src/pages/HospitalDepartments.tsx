import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { Plus, Stethoscope, Users, Calendar, User } from 'lucide-react';

const HospitalDepartments = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/hospital-admin/login'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const { data: doctors } = useQuery({
    queryKey: ['hosp-dept-docs', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*').eq('hospital_id', hospital!.id);
      return data || [];
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ['hosp-dept-appts', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('doctor_id, status, doctors(specialization)').eq('hospital_id', hospital!.id);
      return data || [];
    },
  });

  if (!hospital) return null;

  // Group by specialization as "departments"
  const deptMap = new Map<string, { doctors: any[], appts: number }>();
  (doctors || []).forEach((d: any) => {
    if (!deptMap.has(d.specialization)) deptMap.set(d.specialization, { doctors: [], appts: 0 });
    deptMap.get(d.specialization)!.doctors.push(d);
  });
  (appointments || []).forEach((a: any) => {
    const spec = (a as any).doctors?.specialization;
    if (spec && deptMap.has(spec)) deptMap.get(spec)!.appts++;
  });
  const departments = Array.from(deptMap.entries()).map(([name, data]) => ({ name, ...data }));

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={0}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Departments ({departments.length})</h1>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-1" />Add Department</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Department Name</Label><Input placeholder="e.g. Cardiology" /></div>
                <div><Label>Description</Label><Input placeholder="Brief description" /></div>
                <Button className="w-full rounded-xl bg-accent hover:bg-accent/90" onClick={() => setShowAdd(false)}>Create Department</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {departments.length === 0 ? (
          <Card className="border-0 card-shadow"><CardContent className="p-12 text-center text-muted-foreground">No departments yet. Add doctors to create departments automatically.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <Card key={dept.name} className="border-0 card-shadow hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-heading font-bold">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">{dept.doctors.length} doctor{dept.doctors.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span><Calendar className="h-3 w-3 inline mr-1" />{dept.appts} appointments</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dept.doctors.slice(0, 3).map((d: any) => (
                      <Badge key={d.id} variant="outline" className="text-[10px]">Dr. {d.name}</Badge>
                    ))}
                    {dept.doctors.length > 3 && <Badge variant="outline" className="text-[10px]">+{dept.doctors.length - 3}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalDepartments;
