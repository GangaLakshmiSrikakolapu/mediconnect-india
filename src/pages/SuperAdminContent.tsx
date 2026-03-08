import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Plus, Edit, Trash2, FileText, Eye } from 'lucide-react';

const SuperAdminContent = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tips');
  const [showAdd, setShowAdd] = useState(false);
  const [tipForm, setTipForm] = useState({ title: '', content: '', category: 'General', status: 'published' });
  const [saving, setSaving] = useState(false);

  const { data: tips } = useQuery({
    queryKey: ['sa-health-tips'],
    queryFn: async () => {
      const { data } = await supabase.from('health_tips').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const handleAddTip = async () => {
    if (!tipForm.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('health_tips').insert(tipForm);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['sa-health-tips'] });
      toast({ title: 'Health tip added!' });
      setShowAdd(false);
      setTipForm({ title: '', content: '', category: 'General', status: 'published' });
    } catch (err: any) {
      toast({ title: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const deleteTip = async (id: string) => {
    await supabase.from('health_tips').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['sa-health-tips'] });
    toast({ title: 'Tip deleted' });
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Content Management</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tips">Health Tips ({(tips || []).length})</TabsTrigger>
            <TabsTrigger value="specialties">Specialties</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="tips">
            <div className="flex justify-end mb-4">
              <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogTrigger asChild><Button className="rounded-xl"><Plus className="h-4 w-4 mr-1" />Add Health Tip</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Health Tip</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Title *</Label><Input value={tipForm.title} onChange={e => setTipForm({...tipForm, title: e.target.value})} /></div>
                    <div><Label>Category</Label>
                      <Select value={tipForm.category} onValueChange={v => setTipForm({...tipForm, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['General', 'Nutrition', 'Fitness', 'Mental Health', 'Preventive Care'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Content</Label><Textarea value={tipForm.content} onChange={e => setTipForm({...tipForm, content: e.target.value})} rows={5} /></div>
                    <Button className="w-full rounded-xl" onClick={handleAddTip} disabled={saving}>{saving ? 'Saving...' : 'Add Tip'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {(tips || []).map((tip: any) => (
                <Card key={tip.id} className="border-0 card-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{tip.title}</p>
                        <Badge variant="secondary" className="text-[10px]">{tip.category}</Badge>
                        <Badge className={`border-0 text-[10px] ${tip.status === 'published' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{tip.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{tip.content || 'No content'}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteTip(tip.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(tips || []).length === 0 && <p className="text-center text-muted-foreground py-8">No health tips yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="specialties">
            <Card className="border-0 card-shadow"><CardContent className="p-8 text-center text-muted-foreground">Specialty management coming soon. Currently managed through hospital registrations.</CardContent></Card>
          </TabsContent>

          <TabsContent value="banners">
            <Card className="border-0 card-shadow"><CardContent className="p-8 text-center text-muted-foreground">Banner management coming soon.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminContent;
