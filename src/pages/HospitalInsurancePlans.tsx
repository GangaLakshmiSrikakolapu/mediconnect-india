import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { Shield, CheckCircle } from 'lucide-react';

const HospitalInsurancePlans = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hospital, setHospital] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/auth'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const { data: plans } = useQuery({
    queryKey: ['insurance-plans-all'],
    queryFn: async () => {
      const { data } = await supabase.from('insurance_plans').select('*, insurance_companies(name, logo_url)').eq('status', 'active');
      return data || [];
    },
  });

  const { data: acceptedPlans } = useQuery({
    queryKey: ['hospital-accepted-plans', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('hospital_insurance_plans').select('*').eq('hospital_id', hospital!.id);
      return data || [];
    },
  });

  const isAccepted = (planId: string) => (acceptedPlans || []).some((ap: any) => ap.plan_id === planId);

  const togglePlan = async (planId: string) => {
    if (!hospital?.id) return;
    const accepted = isAccepted(planId);
    if (accepted) {
      await supabase.from('hospital_insurance_plans').delete().eq('hospital_id', hospital.id).eq('plan_id', planId);
    } else {
      await supabase.from('hospital_insurance_plans').insert({ hospital_id: hospital.id, plan_id: planId });
    }
    queryClient.invalidateQueries({ queryKey: ['hospital-accepted-plans'] });
    toast({ title: accepted ? 'Plan removed' : 'Plan accepted' });
  };

  if (!hospital) return null;

  // Group by company
  const byCompany: Record<string, any[]> = {};
  (plans || []).forEach((p: any) => {
    const name = (p as any).insurance_companies?.name || 'Other';
    if (!byCompany[name]) byCompany[name] = [];
    byCompany[name].push(p);
  });

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={0}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-heading font-bold">Insurance Plans</h1>
          <p className="text-sm text-muted-foreground">Toggle plans your hospital accepts. Plans are managed by the platform admin.</p>
        </div>

        {Object.keys(byCompany).length === 0 ? (
          <Card className="border-0 card-shadow">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No insurance plans available yet. Platform admin will add plans soon.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(byCompany).map(([company, companyPlans]) => (
            <Card key={company} className="border-0 card-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{company}</CardTitle>
                    <CardDescription className="text-xs">{companyPlans.length} plans available</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyPlans.map((plan: any) => {
                    const accepted = isAccepted(plan.id);
                    return (
                      <div key={plan.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${accepted ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{plan.name}</p>
                            <Badge variant="secondary" className="text-[10px]">{plan.plan_type}</Badge>
                            {plan.cashless_available && <Badge variant="outline" className="text-[10px] border-success/30 text-success">Cashless</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Coverage: ₹{(plan.coverage_min / 100000).toFixed(1)}L – ₹{(plan.coverage_max / 100000).toFixed(1)}L · Ages {plan.age_min}–{plan.age_max}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {accepted && <CheckCircle className="h-4 w-4 text-accent" />}
                          <Switch checked={accepted} onCheckedChange={() => togglePlan(plan.id)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalInsurancePlans;
