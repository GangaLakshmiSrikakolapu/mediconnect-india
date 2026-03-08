import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { indianStatesAndDistricts, healthProblems } from '@/data/indianLocations';
import { PatientData } from '@/pages/FindHospital';

const PatientForm = ({ onSubmit }: { onSubmit: (data: PatientData) => void }) => {
  const { t } = useLanguage();
  const [form, setForm] = useState<PatientData>({ name: '', age: '', state: '', district: '', healthProblem: '', bookingDate: '' });
  const states = Object.keys(indianStatesAndDistricts).sort();
  const districts = form.state ? indianStatesAndDistricts[form.state] || [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.age && form.state && form.district && form.healthProblem && form.bookingDate) {
      onSubmit(form);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader><CardTitle>{t.findHospital.step1}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>{t.findHospital.name}</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><Label>{t.findHospital.age}</Label><Input required type="number" min="0" max="120" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
          <div><Label>{t.findHospital.state}</Label>
            <Select value={form.state} onValueChange={v => setForm({...form, state: v, district: ''})}>
              <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
              <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>{t.findHospital.district}</Label>
            <Select value={form.district} onValueChange={v => setForm({...form, district: v})} disabled={!form.state}>
              <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
              <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>{t.findHospital.healthProblem}</Label>
            <Select value={form.healthProblem} onValueChange={v => setForm({...form, healthProblem: v})}>
              <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
              <SelectContent>{healthProblems.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>{t.findHospital.bookingDate}</Label><Input required type="date" value={form.bookingDate} onChange={e => setForm({...form, bookingDate: e.target.value})} /></div>
          <Button type="submit" className="w-full">{t.findHospital.next}</Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default PatientForm;
