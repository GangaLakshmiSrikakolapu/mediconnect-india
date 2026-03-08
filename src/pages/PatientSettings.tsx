import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import PatientLayout from '@/components/PatientLayout';
import { Bell, Lock, Eye, Trash2, Globe, Palette, Loader2 } from 'lucide-react';

const PatientSettings = () => {
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    emailAppointment: true, smsAppointment: true,
    emailReminder: true, smsReminder: false,
    emailReport: true, smsReport: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [newPw, setNewPw] = useState('');

  const handleChangePassword = async () => {
    if (newPw.length < 8) { toast({ title: 'Password must be at least 8 characters', variant: 'destructive' }); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Password updated!' });
    setNewPw('');
  };

  return (
    <PatientLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-[800px] space-y-6">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>

        {/* Notifications */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailAppointment', label: 'Appointment confirmations (Email)' },
              { key: 'smsAppointment', label: 'Appointment confirmations (SMS)' },
              { key: 'emailReminder', label: 'Appointment reminders (Email)' },
              { key: 'smsReminder', label: 'Appointment reminders (SMS)' },
              { key: 'emailReport', label: 'Lab reports ready (Email)' },
              { key: 'smsReport', label: 'Lab reports ready (SMS)' },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between">
                <Label className="text-sm">{n.label}</Label>
                <Switch
                  checked={(notifications as any)[n.key]}
                  onCheckedChange={v => setNotifications(s => ({ ...s, [n.key]: v }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4 text-primary" />Privacy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Allow doctors to view my medical records</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show my profile to hospitals I've visited</Label>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />Change Password</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">New Password</Label>
                <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" className="h-9 text-sm" />
              </div>
              <Button onClick={handleChangePassword} disabled={pwLoading} className="rounded-lg h-9">
                {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-0 card-shadow">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Language & Theme</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                    <SelectItem value="ta">தமிழ்</SelectItem>
                    <SelectItem value="te">తెలుగు</SelectItem>
                    <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-0 border-destructive/20 bg-destructive/[0.02]">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">This action is irreversible. All your data will be permanently deleted.</p>
            </div>
            <Button variant="destructive" size="sm" className="rounded-full" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-1" />Delete
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-destructive">Delete Account?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data. This cannot be undone.</p>
            <Textarea placeholder="Reason for leaving (optional)" rows={2} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { signOut(); setShowDeleteConfirm(false); }}>Delete Forever</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  );
};

export default PatientSettings;
