import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import PatientLayout from '@/components/PatientLayout';
import { Shield, Plus, FileText, CheckCircle, Clock, ArrowRight, IndianRupee } from 'lucide-react';

const INSURERS = ['Star Health', 'HDFC Ergo', 'ICICI Lombard', 'Bajaj Allianz', 'Max Bupa', 'Niva Bupa', 'Care Health', 'Aditya Birla Health', 'New India Assurance', 'United India'];

const MOCK_PLANS = [
  { id: '1', insurer: 'Star Health', plan: 'Family Health Optima', policy: 'SH-2025-847291', coverage: 500000, expiry: '2026-03-15' },
];

const RECOMMENDED = [
  { name: 'Comprehensive Health Plan', insurer: 'HDFC Ergo', premium: '₹12,000/yr', coverage: '₹10 Lakh', highlights: ['Cashless at 10,000+ hospitals', 'No room rent limit', 'Pre & post hospitalization'] },
  { name: 'Family Floater Plan', insurer: 'Star Health', premium: '₹15,000/yr', coverage: '₹15 Lakh', highlights: ['Covers entire family', 'Maternity benefit', 'No co-payment'] },
  { name: 'Critical Illness Plan', insurer: 'ICICI Lombard', premium: '₹8,000/yr', coverage: '₹20 Lakh', highlights: ['Covers 34 illnesses', 'Lump sum payout', 'Worldwide coverage'] },
];

const PatientInsurance = () => {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <PatientLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-[1000px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">Insurance</h1>
          <Button className="rounded-full gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />Add Insurance
          </Button>
        </div>

        {/* My Plans */}
        <div>
          <h3 className="font-heading font-bold text-lg mb-3">My Plans</h3>
          {MOCK_PLANS.length === 0 ? (
            <Card className="border-dashed border-2"><CardContent className="py-12 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No insurance plans added yet</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {MOCK_PLANS.map(plan => (
                <Card key={plan.id} className="border-0 card-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{plan.plan}</p>
                      <p className="text-xs text-muted-foreground">{plan.insurer} · {plan.policy}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs flex items-center gap-1"><IndianRupee className="h-3 w-3" />Coverage: ₹{(plan.coverage / 100000).toFixed(0)} Lakh</span>
                        <span className="text-xs text-muted-foreground">Expires: {plan.expiry}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="text-xs rounded-lg">View Policy</Button>
                      <Button size="sm" className="text-xs rounded-lg">File Claim</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Plans */}
        <div>
          <h3 className="font-heading font-bold text-lg mb-3">Recommended Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RECOMMENDED.map(plan => (
              <Card key={plan.name} className="border-0 card-shadow hover:-translate-y-1 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <Badge variant="secondary" className="text-[10px] mb-3">{plan.insurer}</Badge>
                  <p className="font-semibold text-sm">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-heading font-bold text-primary">{plan.premium}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Coverage: {plan.coverage}</p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.highlights.map(h => (
                      <li key={h} className="text-xs flex items-start gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />{h}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full mt-4 rounded-xl text-xs h-9">Get Quote <ArrowRight className="h-3 w-3 ml-1" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Claims History */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-lg">Claims History</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No claims filed yet</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Insurance Modal */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Insurance Plan</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Insurance Company</Label>
                <Select><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select insurer" /></SelectTrigger>
                  <SelectContent>{INSURERS.map(i => <SelectItem key={i} value={i} className="text-xs">{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Plan Name</Label><Input className="h-9 text-xs" placeholder="e.g. Family Health Optima" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Policy Number</Label><Input className="h-9 text-xs" placeholder="Policy number" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Coverage Amount (₹)</Label><Input type="number" className="h-9 text-xs" placeholder="500000" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Expiry Date</Label><Input type="date" className="h-9 text-xs" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={() => { toast({ title: 'Insurance plan added!' }); setShowAdd(false); }}>Save Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  );
};

export default PatientInsurance;
