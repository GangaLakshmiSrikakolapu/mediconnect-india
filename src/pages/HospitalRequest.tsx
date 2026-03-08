import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { indianStatesAndDistricts, healthProblems } from '@/data/indianLocations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const HospitalRequest = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', state: '', district: '', address: '', doctors: '' });
  const [specs, setSpecs] = useState<string[]>([]);
  const [qrFile, setQrFile] = useState<File | null>(null);

  const states = Object.keys(indianStatesAndDistricts).sort();
  const districts = form.state ? indianStatesAndDistricts[form.state] || [] : [];

  const toggleSpec = (s: string) => setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.state || !form.district || !form.address || specs.length === 0) return;
    setLoading(true);
    try {
      let qrUrl: string | null = null;
      if (qrFile) {
        const filePath = `qr/${Date.now()}-${qrFile.name}`;
        const { error: uploadError } = await supabase.storage.from('hospital-assets').upload(filePath, qrFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('hospital-assets').getPublicUrl(filePath);
          qrUrl = urlData.publicUrl;
        }
      }
      await supabase.from('hospitals').insert({
        name: form.name, email: form.email, phone: form.phone,
        state: form.state, district: form.district, address: form.address,
        specializations: specs, upi_qr_url: qrUrl,
      });
      setSubmitted(true);
    } catch {
      toast({ title: t.common.error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-16 text-center animate-fade-in">
        <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">{t.hospitalRequest.success}</h2>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl animate-fade-in">
      <Card>
        <CardHeader><CardTitle>{t.hospitalRequest.title}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>{t.hospitalRequest.hospitalName}</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>{t.hospitalRequest.email}</Label><Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><Label>{t.hospitalRequest.phone}</Label><Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><Label>{t.hospitalRequest.state}</Label>
              <Select value={form.state} onValueChange={v => setForm({...form, state: v, district: ''})}>
                <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
                <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t.hospitalRequest.district}</Label>
              <Select value={form.district} onValueChange={v => setForm({...form, district: v})} disabled={!form.state}>
                <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
                <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t.hospitalRequest.address}</Label><Textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div>
              <Label>{t.hospitalRequest.specializations}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {healthProblems.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={specs.includes(p)} onCheckedChange={() => toggleSpec(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div><Label>{t.hospitalRequest.doctors}</Label><Textarea value={form.doctors} onChange={e => setForm({...form, doctors: e.target.value})} placeholder="Dr. Name - Specialization - Experience" /></div>
            <div><Label>{t.hospitalRequest.upiQr}</Label><Input type="file" accept="image/*" onChange={e => setQrFile(e.target.files?.[0] || null)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? t.common.loading : t.hospitalRequest.submit}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default HospitalRequest;
