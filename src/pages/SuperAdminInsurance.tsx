import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Plus, Shield, Building2, IndianRupee, Users, Edit } from 'lucide-react';

const SuperAdminInsurance = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('companies');
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: '', type: 'Health', irdai_number: '', contact_person: '', contact_email: '', contact_phone: '', website: '', revenue_share_pct: '10' });
  const [planForm, setPlanForm] = useState({ company_id: '', name: '', plan_type: 'Health', coverage_min: '', coverage_max: '', premium_min: '', premium_max: '', age_min: '0', age_max: '100', cashless_available: true });
  const [saving, setSaving] = useState(false);

  const { data: companies } = useQuery({
    queryKey: ['sa-insurance-companies'],
    queryFn: async () => {
      const { data } = await supabase.from('insurance_companies').select('*').order('name');
      return data || [];
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['sa-insurance-plans'],
    queryFn: async () => {
      const { data } = await supabase.from('insurance_plans').select('*, insurance_companies(name, logo_url)').order('name');
      return data || [];
    },
  });

  const handleAddCompany = async () => {
    if (!companyForm.name) { toast({ title: 'Company name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('insurance_companies').insert({
        name: companyForm.name, type: companyForm.type,
        irdai_number: companyForm.irdai_number || null,
        contact_person: companyForm.contact_person || null,
        contact_email: companyForm.contact_email || null,
        contact_phone: companyForm.contact_phone || null,
        website: companyForm.website || null,
        revenue_share_pct: parseFloat(companyForm.revenue_share_pct) || 0,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['sa-insurance-companies'] });
      toast({ title: 'Insurance company added!' });
      setShowAddCompany(false);
      setCompanyForm({ name: '', type: 'Health', irdai_number: '', contact_person: '', contact_email: '', contact_phone: '', website: '', revenue_share_pct: '10' });
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleAddPlan = async () => {
    if (!planForm.company_id || !planForm.name) { toast({ title: 'Company and plan name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('insurance_plans').insert({
        company_id: planForm.company_id, name: planForm.name, plan_type: planForm.plan_type,
        coverage_min: parseFloat(planForm.coverage_min) || 0, coverage_max: parseFloat(planForm.coverage_max) || 0,
        premium_min: parseFloat(planForm.premium_min) || 0, premium_max: parseFloat(planForm.premium_max) || 0,
        age_min: parseInt(planForm.age_min) || 0, age_max: parseInt(planForm.age_max) || 100,
        cashless_available: planForm.cashless_available,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['sa-insurance-plans'] });
      toast({ title: 'Insurance plan added!' });
      setShowAddPlan(false);
      setPlanForm({ company_id: '', name: '', plan_type: 'Health', coverage_min: '', coverage_max: '', premium_min: '', premium_max: '', age_min: '0', age_max: '100', cashless_available: true });
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const pendingCount = 0; // computed elsewhere

  return (
    <SuperAdminLayout pendingHospitals={pendingCount}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Insurance Management</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="companies">Companies ({(companies || []).length})</TabsTrigger>
            <TabsTrigger value="plans">Plans ({(plans || []).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="companies">
            <div className="flex justify-end mb-4">
              <Dialog open={showAddCompany} onOpenChange={setShowAddCompany}>
                <DialogTrigger asChild><Button className="rounded-xl"><Plus className="h-4 w-4 mr-1" />Add Insurance Company</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Add Insurance Company</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Company Name *</Label><Input value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} /></div>
                      <div><Label>Type</Label>
                        <Select value={companyForm.type} onValueChange={v => setCompanyForm({...companyForm, type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Life">Life</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>IRDAI Number</Label><Input value={companyForm.irdai_number} onChange={e => setCompanyForm({...companyForm, irdai_number: e.target.value})} /></div>
                      <div><Label>Revenue Share %</Label><Input type="number" value={companyForm.revenue_share_pct} onChange={e => setCompanyForm({...companyForm, revenue_share_pct: e.target.value})} /></div>
                      <div><Label>Contact Person</Label><Input value={companyForm.contact_person} onChange={e => setCompanyForm({...companyForm, contact_person: e.target.value})} /></div>
                      <div><Label>Contact Email</Label><Input type="email" value={companyForm.contact_email} onChange={e => setCompanyForm({...companyForm, contact_email: e.target.value})} /></div>
                      <div><Label>Contact Phone</Label><Input value={companyForm.contact_phone} onChange={e => setCompanyForm({...companyForm, contact_phone: e.target.value})} /></div>
                      <div><Label>Website</Label><Input value={companyForm.website} onChange={e => setCompanyForm({...companyForm, website: e.target.value})} /></div>
                    </div>
                    <Button className="w-full rounded-xl" onClick={handleAddCompany} disabled={saving}>{saving ? 'Saving...' : 'Add Company'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {(companies || []).length === 0 ? (
              <Card className="border-0 card-shadow"><CardContent className="p-12 text-center text-muted-foreground">No insurance companies added yet.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(companies || []).map((c: any) => (
                  <Card key={c.id} className="border-0 card-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-heading font-bold">{c.name}</p>
                          <Badge variant="secondary" className="text-[10px]">{c.type}</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {c.irdai_number && <p>IRDAI: {c.irdai_number}</p>}
                        {c.contact_email && <p>{c.contact_email}</p>}
                        <p>Revenue Share: {c.revenue_share_pct}%</p>
                      </div>
                      <Badge className={`mt-3 border-0 text-[10px] ${c.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{c.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans">
            <div className="flex justify-end mb-4">
              <Dialog open={showAddPlan} onOpenChange={setShowAddPlan}>
                <DialogTrigger asChild><Button className="rounded-xl"><Plus className="h-4 w-4 mr-1" />Add Insurance Plan</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Add Insurance Plan</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Insurance Company *</Label>
                      <Select value={planForm.company_id} onValueChange={v => setPlanForm({...planForm, company_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                        <SelectContent>{(companies || []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Plan Name *</Label><Input value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} /></div>
                      <div><Label>Plan Type</Label>
                        <Select value={planForm.plan_type} onValueChange={v => setPlanForm({...planForm, plan_type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Critical Illness">Critical Illness</SelectItem>
                            <SelectItem value="Accident">Accident</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Coverage Min (₹)</Label><Input type="number" value={planForm.coverage_min} onChange={e => setPlanForm({...planForm, coverage_min: e.target.value})} /></div>
                      <div><Label>Coverage Max (₹)</Label><Input type="number" value={planForm.coverage_max} onChange={e => setPlanForm({...planForm, coverage_max: e.target.value})} /></div>
                      <div><Label>Premium Min (₹/yr)</Label><Input type="number" value={planForm.premium_min} onChange={e => setPlanForm({...planForm, premium_min: e.target.value})} /></div>
                      <div><Label>Premium Max (₹/yr)</Label><Input type="number" value={planForm.premium_max} onChange={e => setPlanForm({...planForm, premium_max: e.target.value})} /></div>
                      <div><Label>Age Min</Label><Input type="number" value={planForm.age_min} onChange={e => setPlanForm({...planForm, age_min: e.target.value})} /></div>
                      <div><Label>Age Max</Label><Input type="number" value={planForm.age_max} onChange={e => setPlanForm({...planForm, age_max: e.target.value})} /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={planForm.cashless_available} onCheckedChange={c => setPlanForm({...planForm, cashless_available: c})} />
                      <Label>Cashless Available</Label>
                    </div>
                    <Button className="w-full rounded-xl" onClick={handleAddPlan} disabled={saving}>{saving ? 'Saving...' : 'Add Plan'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {(plans || []).length === 0 ? (
              <Card className="border-0 card-shadow"><CardContent className="p-12 text-center text-muted-foreground">No plans added yet. Add a company first, then create plans.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(plans || []).map((p: any) => (
                  <Card key={p.id} className="border-0 card-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <p className="font-heading font-bold text-sm">{p.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{(p as any).insurance_companies?.name || 'Company'}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary" className="text-[10px]">{p.plan_type}</Badge>
                        {p.cashless_available && <Badge variant="outline" className="text-[10px] border-success/30 text-success">Cashless</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Coverage: ₹{(p.coverage_min / 100000).toFixed(1)}L – ₹{(p.coverage_max / 100000).toFixed(1)}L</p>
                        <p>Premium: ₹{p.premium_min?.toLocaleString()} – ₹{p.premium_max?.toLocaleString()}/yr</p>
                        <p>Age: {p.age_min} – {p.age_max} years</p>
                      </div>
                      <Badge className={`mt-3 border-0 text-[10px] ${p.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{p.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminInsurance;
