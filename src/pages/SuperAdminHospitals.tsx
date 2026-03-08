import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import {
  Search, CheckCircle, XCircle, Eye, Building2, MapPin, Mail, Phone,
  GraduationCap, AlertTriangle, Clock, Shield
} from 'lucide-react';

const CHECKLIST = [
  'Registration number verified',
  'All documents submitted and authentic',
  'No duplicate hospital in database',
  'Address verified',
  'Admin identity verified',
  'Meets platform standards',
];

const SuperAdminHospitals = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewHospital, setReviewHospital] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [hospitalDoctors, setHospitalDoctors] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<boolean[]>(new Array(CHECKLIST.length).fill(false));
  const [internalNotes, setInternalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['sa-all-hospitals'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('admin-hospitals', { body: { action: 'list' } });
      return data?.hospitals || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', { body: { action: 'update_status', hospitalId: id, status } });
      if (error || data?.error) throw new Error(data?.error || 'Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-all-hospitals'] });
      toast({ title: 'Hospital status updated' });
      setReviewOpen(false);
    },
  });

  const handleReview = async (hospital: any) => {
    setReviewHospital(hospital);
    setChecklist(new Array(CHECKLIST.length).fill(false));
    setInternalNotes('');
    setRejectReason('');
    const { data: reqDoctors } = await supabase.functions.invoke('admin-hospitals', { body: { key: adminKey, action: 'get_doctors_request', hospitalId: hospital.id } });
    const { data: activeDoctors } = await supabase.from('doctors').select('*').eq('hospital_id', hospital.id);
    const requestDocs = reqDoctors?.doctors || [];
    setHospitalDoctors(requestDocs.length > 0 ? requestDocs.map((d: any) => ({
      id: d.id, name: d.doctor_name, email: d.email, phone: d.phone,
      specialization: d.specialization, education: d.education, experience: d.experience, age: d.age,
    })) : (activeDoctors || []));
    setReviewOpen(true);
  };

  const allHospitals = (hospitals || []) as any[];
  const filtered = allHospitals.filter((h: any) => {
    if (activeTab !== 'all' && h.status !== activeTab) return false;
    if (searchTerm && !h.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingCount = allHospitals.filter(h => h.status === 'pending').length;
  const approvedCount = allHospitals.filter(h => h.status === 'approved').length;
  const rejectedCount = allHospitals.filter(h => h.status === 'rejected').length;
  const allChecked = checklist.every(Boolean);

  return (
    <SuperAdminLayout pendingHospitals={pendingCount}>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Hospital Management</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search hospitals..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-xl" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({allHospitals.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-0 card-shadow"><CardContent className="p-12 text-center text-muted-foreground"><Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />No hospitals found.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((h: any) => (
              <Card key={h.id} className="border-0 card-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold">{h.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{h.address}, {h.district}, {h.state}</p>
                      <p className="text-xs text-muted-foreground mt-1"><Mail className="h-3 w-3 inline mr-1" />{h.email} · <Phone className="h-3 w-3 inline mr-1" />{h.phone}</p>
                    </div>
                    <Badge variant={h.status === 'approved' ? 'default' : h.status === 'rejected' ? 'destructive' : 'secondary'}>{h.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {h.specializations?.map((s: string) => (
                      <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => handleReview(h)}>
                      <Eye className="h-4 w-4 mr-1" />Review
                    </Button>
                    {h.status === 'pending' && (
                      <>
                        <Button size="sm" className="rounded-lg bg-success hover:bg-success/90 text-success-foreground" onClick={() => updateStatus.mutate({ id: h.id, status: 'approved' })}>
                          <CheckCircle className="h-4 w-4 mr-1" />Quick Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => updateStatus.mutate({ id: h.id, status: 'rejected' })}>
                          <XCircle className="h-4 w-4 mr-1" />Quick Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Hospital Review — {reviewHospital?.name}</DialogTitle></DialogHeader>
            {reviewHospital && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Info */}
                <div className="space-y-4">
                  <Card className="border-0 bg-muted/30">
                    <CardContent className="p-4 space-y-2 text-sm">
                      <div><span className="text-muted-foreground text-xs block">Email</span>{reviewHospital.email}</div>
                      <div><span className="text-muted-foreground text-xs block">Phone</span>{reviewHospital.phone}</div>
                      <div><span className="text-muted-foreground text-xs block">Location</span>{reviewHospital.district}, {reviewHospital.state}</div>
                      <div><span className="text-muted-foreground text-xs block">Address</span>{reviewHospital.address}</div>
                      <div><span className="text-muted-foreground text-xs block">Specializations</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {reviewHospital.specializations?.map((s: string) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <h3 className="font-heading font-semibold text-sm mb-2">Doctors ({hospitalDoctors.length})</h3>
                    <div className="space-y-2">
                      {hospitalDoctors.map((d: any) => (
                        <div key={d.id} className="p-3 rounded-xl bg-muted/30 text-sm">
                          <p className="font-medium">Dr. {d.name} {d.age ? `· Age ${d.age}` : ''}</p>
                          <p className="text-xs text-muted-foreground">{d.specialization} · {d.experience} yrs</p>
                          {d.education && <p className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" />{d.education}</p>}
                        </div>
                      ))}
                      {hospitalDoctors.length === 0 && <p className="text-sm text-muted-foreground">No doctors.</p>}
                    </div>
                  </div>
                </div>

                {/* Right - Verification */}
                <div className="space-y-4">
                  <Card className="border-0 bg-muted/30">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Verification Checklist</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {CHECKLIST.map((item, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox checked={checklist[i]} onCheckedChange={c => { const nc = [...checklist]; nc[i] = !!c; setChecklist(nc); }} />
                          {item}
                        </label>
                      ))}
                    </CardContent>
                  </Card>

                  <div>
                    <label className="text-sm font-medium block mb-1">Internal Notes</label>
                    <Textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Notes visible only to admins..." rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full rounded-xl bg-success hover:bg-success/90 text-success-foreground" disabled={!allChecked || updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: reviewHospital.id, status: 'approved' })}>
                      <CheckCircle className="h-4 w-4 mr-2" />Approve Hospital
                    </Button>
                    {!allChecked && <p className="text-xs text-muted-foreground text-center">Complete all checklist items to approve</p>}
                    <Button variant="outline" className="w-full rounded-xl text-warning border-warning/30" onClick={() => toast({ title: 'Request for more info sent' })}>
                      <AlertTriangle className="h-4 w-4 mr-2" />Request More Info
                    </Button>
                    <Button variant="destructive" className="w-full rounded-xl" disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: reviewHospital.id, status: 'rejected' })}>
                      <XCircle className="h-4 w-4 mr-2" />Reject Application
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminHospitals;
