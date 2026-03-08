import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { toast } from '@/hooks/use-toast';
import { Save, Percent, Zap, Lock, Shield } from 'lucide-react';

const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [platformName, setPlatformName] = useState('MediConnect India');
  const [contactEmail, setContactEmail] = useState('support@mediconnect.in');
  const [commissionPct, setCommissionPct] = useState('5');
  const [features, setFeatures] = useState({ teleconsult: false, labTests: false, pharmacy: false, aiRecommendations: true });
  const [maintenance, setMaintenance] = useState(false);

  const handleSave = () => toast({ title: 'Settings saved!' });

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Platform Settings</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="commission" className="text-xs">Commission</TabsTrigger>
            <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Platform Name</Label><Input value={platformName} onChange={e => setPlatformName(e.target.value)} /></div>
                  <div><Label>Contact Email</Label><Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} /></div>
                </div>
                <Button className="rounded-xl" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commission">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Percent className="h-4 w-4" />Commission & Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-xs">
                  <Label>Commission per Appointment (%)</Label>
                  <Input type="number" value={commissionPct} onChange={e => setCommissionPct(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">Applied to all hospital bookings. Override per hospital in hospital settings.</p>
                <Button className="rounded-xl" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" />Feature Toggles</CardTitle><CardDescription>Enable/disable platform features for gradual rollout</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'teleconsult', label: 'Teleconsult', desc: 'Video consultations with doctors' },
                  { key: 'labTests', label: 'Lab Tests', desc: 'Lab test booking and results' },
                  { key: 'pharmacy', label: 'Pharmacy', desc: 'Medicine ordering and delivery' },
                  { key: 'aiRecommendations', label: 'AI Recommendations', desc: 'AI-powered health recommendations' },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div><p className="text-sm font-medium">{f.label}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
                    <Switch checked={features[f.key as keyof typeof features]} onCheckedChange={c => setFeatures({...features, [f.key]: c})} />
                  </div>
                ))}
                <Button className="rounded-xl" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Security</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-success" />
                    <p className="text-sm font-medium">Authentication</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Super Admin access is secured via role-based JWT authentication. No static keys are used.</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium">Session Timeout</p>
                  <p className="text-xs text-muted-foreground">Sessions expire after 1 hour of inactivity. Users must re-authenticate.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">Maintenance Mode</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">Enable Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Shows maintenance page to all users</p>
                  </div>
                  <Switch checked={maintenance} onCheckedChange={setMaintenance} />
                </div>
                {maintenance && <div className="bg-warning/10 text-warning rounded-xl p-3 text-sm">⚠️ Maintenance mode is ON. All users will see a maintenance page.</div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSettings;
