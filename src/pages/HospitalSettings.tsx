import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { Building2, Clock, Stethoscope, Shield, Bell, CreditCard, Users, Save } from 'lucide-react';

const FACILITIES = ['ICU', 'Emergency', 'Blood Bank', 'NICU', 'Ambulance', 'Pharmacy', 'Canteen', 'Parking', 'WiFi', 'Lab', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const INSURERS = ['Star Health', 'ICICI Lombard', 'HDFC Ergo', 'Bajaj Allianz', 'New India Assurance', 'United India', 'Max Bupa', 'Care Health', 'Niva Bupa', 'Aditya Birla'];

const HospitalSettings = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', address: '' });
  const [hours, setHours] = useState<Record<string, { open: boolean; start: string; end: string }>>(
    Object.fromEntries(DAYS.map(d => [d, { open: d !== 'Sunday', start: '08:00', end: '20:00' }]))
  );
  const [facilities, setFacilities] = useState<string[]>([]);
  const [insurers, setInsurers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({ newBooking: true, cancellation: true, review: true, emailEnabled: true, smsEnabled: false });

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/hospital-admin/login'); return; }
    const h = JSON.parse(stored);
    setHospital(h);
    setProfile({ name: h.name || '', phone: '', email: h.email || '', address: '' });
  }, [navigate]);

  if (!hospital) return null;

  const handleSave = () => toast({ title: 'Settings saved successfully!' });

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={0}>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
            <TabsTrigger value="hours" className="text-xs">Operating Hours</TabsTrigger>
            <TabsTrigger value="facilities" className="text-xs">Facilities</TabsTrigger>
            <TabsTrigger value="insurance" className="text-xs">Insurance</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
            <TabsTrigger value="staff" className="text-xs">Staff Access</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">Hospital Profile</CardTitle><CardDescription>Update your hospital's information</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Hospital Name</Label><Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
                  <div><Label>Email</Label><Input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                  <div><Label>Phone</Label><Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+91..." /></div>
                  <div><Label>Address</Label><Input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} /></div>
                </div>
                <Button className="rounded-xl bg-accent hover:bg-accent/90" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">Operating Hours</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                    <Switch checked={hours[day].open} onCheckedChange={c => setHours({...hours, [day]: {...hours[day], open: c}})} />
                    <span className="w-24 text-sm font-medium">{day}</span>
                    {hours[day].open ? (
                      <div className="flex items-center gap-2">
                        <Input type="time" value={hours[day].start} onChange={e => setHours({...hours, [day]: {...hours[day], start: e.target.value}})} className="w-32 h-8 text-xs" />
                        <span className="text-xs text-muted-foreground">to</span>
                        <Input type="time" value={hours[day].end} onChange={e => setHours({...hours, [day]: {...hours[day], end: e.target.value}})} className="w-32 h-8 text-xs" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
                <Button className="rounded-xl bg-accent hover:bg-accent/90" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facilities">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">Facilities</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {FACILITIES.map(f => (
                    <button key={f} onClick={() => setFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                      className={`p-3 rounded-xl border text-sm text-left transition-colors ${facilities.includes(f) ? 'bg-accent/10 border-accent text-accent' : 'border-border hover:bg-muted'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <Button className="mt-4 rounded-xl bg-accent hover:bg-accent/90" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">Insurance Partners</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INSURERS.map(ins => (
                    <button key={ins} onClick={() => setInsurers(prev => prev.includes(ins) ? prev.filter(x => x !== ins) : [...prev, ins])}
                      className={`p-3 rounded-xl border text-sm text-left transition-colors ${insurers.includes(ins) ? 'bg-accent/10 border-accent text-accent' : 'border-border hover:bg-muted'}`}>
                      <Shield className="h-4 w-4 inline mr-2" />{ins}
                    </button>
                  ))}
                </div>
                <Button className="mt-4 rounded-xl bg-accent hover:bg-accent/90" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'newBooking', label: 'New Booking' },
                  { key: 'cancellation', label: 'Cancellation' },
                  { key: 'review', label: 'New Review' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <Switch checked={notifications.emailEnabled} onCheckedChange={c => setNotifications({...notifications, emailEnabled: c})} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">SMS</span>
                        <Switch checked={notifications.smsEnabled} onCheckedChange={c => setNotifications({...notifications, smsEnabled: c})} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="rounded-xl bg-accent hover:bg-accent/90" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="border-0 card-shadow">
              <CardHeader><CardTitle className="text-base">Payment Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>UPI ID</Label><Input placeholder="hospital@upi" /></div>
                  <div><Label>Bank Account Number</Label><Input placeholder="Account number" /></div>
                  <div><Label>IFSC Code</Label><Input placeholder="IFSC" /></div>
                  <div><Label>GST Number</Label><Input placeholder="GST" /></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['UPI', 'Card', 'Cash', 'Insurance'].map(m => (
                    <Badge key={m} variant="outline" className="px-3 py-1.5 cursor-pointer hover:bg-accent/10">{m}</Badge>
                  ))}
                </div>
                <Button className="rounded-xl bg-accent hover:bg-accent/90" onClick={handleSave}><Save className="h-4 w-4 mr-1" />Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle className="text-base">Staff Access</CardTitle>
                <CardDescription>Manage staff who can access this dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input placeholder="Staff email address" className="flex-1" />
                  <Button className="rounded-xl bg-accent hover:bg-accent/90">Invite</Button>
                </div>
                <p className="text-sm text-muted-foreground text-center py-6">No additional staff members added yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalSettings;
