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
import { CheckCircle, Plus, Trash2, UserPlus, ArrowRight, Loader2 } from 'lucide-react';

type DoctorEntry = {
  name: string;
  age: string;
  email: string;
  phone: string;
  specialization: string;
  education: string;
  experience: string;
};

const emptyDoctor: DoctorEntry = { name: '', age: '', email: '', phone: '', specialization: '', education: '', experience: '' };

const validateDoctor = (d: DoctorEntry): string | null => {
  if (!d.name.trim()) return 'Doctor Name is required';
  if (!d.email.trim()) return 'Doctor Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Please enter a valid email address';
  if (!d.phone.trim()) return 'Phone Number is required';
  if (!/^\d{10}$/.test(d.phone.trim())) return 'Phone number must be 10 digits';
  if (!d.education.trim()) return 'Educational Details are required';
  if (!d.specialization) return 'Specialization is required';
  if (!d.experience.trim()) return 'Experience is required';
  return null;
};

const HospitalRequest = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'hospital' | 'doctors' | 'review' | 'done'>('hospital');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', state: '', district: '', address: '' });
  const [specs, setSpecs] = useState<string[]>([]);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [doctors, setDoctors] = useState<DoctorEntry[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorEntry>({ ...emptyDoctor });
  const [doctorErrors, setDoctorErrors] = useState<string | null>(null);

  const states = Object.keys(indianStatesAndDistricts).sort();
  const districts = form.state ? indianStatesAndDistricts[form.state] || [] : [];

  const toggleSpec = (s: string) => setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleHospitalNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.state || !form.district || !form.address || specs.length === 0) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setStep('doctors');
  };

  const addDoctor = (clearAfter: boolean = false) => {
    const error = validateDoctor(currentDoctor);
    if (error) {
      setDoctorErrors(error);
      toast({ title: error, variant: 'destructive' });
      return false;
    }
    setDoctorErrors(null);
    setDoctors(prev => [...prev, { ...currentDoctor }]);
    if (clearAfter) {
      setCurrentDoctor({ ...emptyDoctor });
    }
    toast({ title: `Dr. ${currentDoctor.name} added successfully` });
    return true;
  };

  const removeDoctor = (index: number) => {
    setDoctors(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (doctors.length === 0) {
      toast({ title: 'Please add at least one doctor', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      let qrUrl: string | null = null;
      if (qrFile) {
        const filePath = `qr/${Date.now()}-${qrFile.name}`;
        const { error: uploadError } = await supabase.storage.from('hospital-assets').upload(filePath, qrFile);
        if (uploadError) {
          console.error('QR upload error:', uploadError);
          toast({ title: 'Failed to upload UPI QR image. Please try again.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const { data: urlData } = supabase.storage.from('hospital-assets').getPublicUrl(filePath);
        qrUrl = urlData.publicUrl;
      }

      const { data: hospital, error: hospError } = await supabase.from('hospitals').insert({
        name: form.name, email: form.email, phone: form.phone,
        state: form.state, district: form.district, address: form.address,
        specializations: specs, upi_qr_url: qrUrl,
      }).select().single();

      if (hospError) {
        console.error('Hospital submission error:', hospError);
        if (hospError.message.includes('duplicate')) {
          toast({ title: 'A hospital with this information already exists.', variant: 'destructive' });
        } else {
          toast({ title: 'Failed to submit hospital request. Please try again.', variant: 'destructive' });
        }
        setLoading(false);
        return;
      }

      // Insert doctors into doctors_request table
      const doctorRows = doctors.map(d => ({
        doctor_name: d.name,
        age: d.age,
        email: d.email,
        phone: d.phone,
        specialization: d.specialization,
        education: d.education,
        experience: d.experience,
        hospital_id: hospital.id,
      }));

      const { error: docError } = await supabase.from('doctors_request' as any).insert(doctorRows as any);
      if (docError) {
        console.error('Doctor submission error:', docError);
        if (docError.message.includes('duplicate')) {
          toast({ title: 'One or more doctor emails already exist.', variant: 'destructive' });
        } else {
          toast({ title: 'Hospital saved but failed to save doctor details. Please contact support.', variant: 'destructive' });
        }
        setLoading(false);
        return;
      }

      // Also insert into doctors table for direct linking
      const doctorTableRows = doctors.map(d => ({
        name: d.name,
        age: parseInt(d.age) || 0,
        email: d.email,
        phone: d.phone,
        specialization: d.specialization,
        education_details: d.education,
        experience: parseInt(d.experience) || 0,
        hospital_id: hospital.id,
        status: 'pending',
      }));

      const { error: docTableError } = await supabase.from('doctors').insert(doctorTableRows);
      if (docTableError) {
        console.error('Doctor table insertion error:', docTableError);
      }

      setStep('done');
    } catch (err) {
      console.error('Submission error:', err);
      toast({ title: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="container py-16 text-center animate-fade-in">
        <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Hospital request submitted successfully.</h2>
        <p className="text-muted-foreground">Your request will be reviewed by Super Admin. {doctors.length} doctor(s) have been submitted for review.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['Hospital Info', 'Add Doctors', 'Review & Submit'].map((label, i) => {
          const currentIdx = ['hospital', 'doctors', 'review'].indexOf(step);
          return (
            <div key={label} className="flex items-center">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                i === currentIdx ? 'bg-primary text-primary-foreground' :
                i < currentIdx ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}. {label}
              </div>
              {i < 2 && <div className="w-6 h-0.5 bg-muted mx-1" />}
            </div>
          );
        })}
      </div>

      {step === 'hospital' && (
        <Card>
          <CardHeader><CardTitle>{t.hospitalRequest.title}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleHospitalNext} className="space-y-4">
              <div><Label>{t.hospitalRequest.hospitalName} *</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t.hospitalRequest.email} *</Label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>{t.hospitalRequest.phone} *</Label><Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>{t.hospitalRequest.state} *</Label>
                <Select value={form.state} onValueChange={v => setForm({ ...form, state: v, district: '' })}>
                  <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
                  <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t.hospitalRequest.district} *</Label>
                <Select value={form.district} onValueChange={v => setForm({ ...form, district: v })} disabled={!form.state}>
                  <SelectTrigger><SelectValue placeholder={t.common.selectOption} /></SelectTrigger>
                  <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t.hospitalRequest.address} *</Label><Textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div>
                <Label>{t.hospitalRequest.specializations} *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {healthProblems.map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={specs.includes(p)} onCheckedChange={() => toggleSpec(p)} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div><Label>{t.hospitalRequest.upiQr}</Label><Input type="file" accept="image/*" onChange={e => setQrFile(e.target.files?.[0] || null)} /></div>
              <Button type="submit" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />ADD DOCTORS <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'doctors' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Doctor Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Doctor Name *</Label><Input value={currentDoctor.name} onChange={e => { setCurrentDoctor({ ...currentDoctor, name: e.target.value }); setDoctorErrors(null); }} placeholder="e.g. Dr. Arjun Kumar" /></div>
                <div><Label>Age</Label><Input type="number" value={currentDoctor.age} onChange={e => setCurrentDoctor({ ...currentDoctor, age: e.target.value })} placeholder="e.g. 35" /></div>
                <div><Label>Email (Gmail) *</Label><Input type="email" value={currentDoctor.email} onChange={e => { setCurrentDoctor({ ...currentDoctor, email: e.target.value }); setDoctorErrors(null); }} placeholder="doctor@gmail.com" /></div>
                <div><Label>Phone Number *</Label><Input value={currentDoctor.phone} onChange={e => { setCurrentDoctor({ ...currentDoctor, phone: e.target.value }); setDoctorErrors(null); }} placeholder="10-digit number" /></div>
                <div><Label>Specialization *</Label>
                  <Select value={currentDoctor.specialization} onValueChange={v => { setCurrentDoctor({ ...currentDoctor, specialization: v }); setDoctorErrors(null); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{specs.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Educational Details *</Label><Input value={currentDoctor.education} onChange={e => { setCurrentDoctor({ ...currentDoctor, education: e.target.value }); setDoctorErrors(null); }} placeholder="e.g. MBBS – AIIMS Delhi" /></div>
                <div><Label>Experience (years) *</Label><Input type="number" value={currentDoctor.experience} onChange={e => { setCurrentDoctor({ ...currentDoctor, experience: e.target.value }); setDoctorErrors(null); }} placeholder="e.g. 5" /></div>
              </div>
              {doctorErrors && (
                <p className="text-sm text-destructive font-medium">{doctorErrors}</p>
              )}
              <div className="flex gap-2">
                <Button type="button" onClick={() => addDoctor(false)}>Submit Doctor</Button>
                <Button type="button" variant="outline" onClick={() => addDoctor(true)}>
                  <Plus className="h-4 w-4 mr-1" />Add Another Doctor
                </Button>
              </div>
            </CardContent>
          </Card>

          {doctors.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Doctors Added ({doctors.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {doctors.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">Dr. {d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.specialization} {d.age && `· Age ${d.age}`} {d.education && `· ${d.education}`} {d.experience && `· ${d.experience} yrs`}</p>
                        <p className="text-xs text-muted-foreground">{d.email} {d.phone && `· ${d.phone}`}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeDoctor(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('hospital')}>Back</Button>
            <Button className="flex-1" onClick={() => {
              if (doctors.length === 0) {
                toast({ title: 'Please add at least one doctor', variant: 'destructive' });
                return;
              }
              setStep('review');
            }}>Review & Submit <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Hospital Details</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Phone:</strong> {form.phone}</p>
              <p><strong>Location:</strong> {form.district}, {form.state}</p>
              <p><strong>Address:</strong> {form.address}</p>
              <p><strong>Specializations:</strong> {specs.join(', ')}</p>
              <p><strong>UPI QR:</strong> {qrFile ? qrFile.name : 'Not uploaded'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Doctors ({doctors.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {doctors.map((d, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">
                    <p className="font-medium">Dr. {d.name}</p>
                    <p className="text-muted-foreground">{d.specialization} {d.age && `· Age ${d.age}`} {d.education && `· ${d.education}`} {d.experience && `· ${d.experience} yrs`}</p>
                    {(d.email || d.phone) && <p className="text-muted-foreground">{d.email} {d.phone && `· ${d.phone}`}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('doctors')}>Back</Button>
            <Button className="flex-1" onClick={handleFinalSubmit} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting request...</>
              ) : (
                'SUBMIT HOSPITAL REQUEST'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default HospitalRequest;
