import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import PatientLayout from '@/components/PatientLayout';
import { User, Mail, Phone, Calendar, MapPin, Droplets, Heart, Activity, Shield, Edit2, Save, Camera } from 'lucide-react';

const PatientProfile = () => {
  const { user } = useAuth();
  const meta = user?.user_metadata || {};
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: meta.full_name || '',
    phone: meta.phone || '',
    dob: meta.dob || '',
    gender: meta.gender || '',
    bloodGroup: meta.blood_group || '',
    state: meta.state || '',
    city: meta.city || '',
    emergencyName: '',
    emergencyPhone: '',
  });

  const [conditions, setConditions] = useState<string[]>(meta.conditions || []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <PatientLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-[800px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">My Profile</h1>
          <Button variant={editing ? 'default' : 'outline'} className="rounded-full gap-2" onClick={() => {
            if (editing) toast({ title: 'Profile saved!' });
            setEditing(!editing);
          }}>
            {editing ? <><Save className="h-4 w-4" />Save</> : <><Edit2 className="h-4 w-4" />Edit</>}
          </Button>
        </div>

        {/* Avatar */}
        <Card className="border-0 card-shadow">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">{form.name || 'Patient'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-2 text-xs">Patient Account</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><User className="h-3 w-3" />Full Name</Label>
                {editing ? <Input value={form.name} onChange={e => set('name', e.target.value)} className="h-9 text-sm" /> : <p className="text-sm font-medium">{form.name || '—'}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />Email</Label>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />Phone</Label>
                {editing ? <Input value={form.phone} onChange={e => set('phone', e.target.value)} className="h-9 text-sm" /> : <p className="text-sm font-medium">{form.phone || '—'}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />Date of Birth</Label>
                {editing ? <Input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="h-9 text-sm" /> : <p className="text-sm font-medium">{form.dob || '—'}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Gender</Label>
                {editing ? (
                  <Select value={form.gender} onValueChange={v => set('gender', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                ) : <p className="text-sm font-medium capitalize">{form.gender || '—'}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><Droplets className="h-3 w-3" />Blood Group</Label>
                {editing ? (
                  <Select value={form.bloodGroup} onValueChange={v => set('bloodGroup', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                  </Select>
                ) : <p className="text-sm font-medium">{form.bloodGroup || '—'}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Profile */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Health Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Existing Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {conditions.length > 0 ? conditions.map(c => (
                  <Badge key={c} className="bg-primary/10 text-primary border-0">{c}</Badge>
                )) : <p className="text-sm text-muted-foreground">No conditions listed</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-destructive" />Emergency Contact</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Contact Name</Label>
                {editing ? <Input value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} className="h-9 text-sm" /> : <p className="text-sm font-medium">{form.emergencyName || '—'}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Contact Phone</Label>
                {editing ? <Input value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} className="h-9 text-sm" /> : <p className="text-sm font-medium">{form.emergencyPhone || '—'}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientProfile;
