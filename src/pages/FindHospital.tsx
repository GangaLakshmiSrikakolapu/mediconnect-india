import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { indianStatesAndDistricts, healthProblems } from '@/data/indianLocations';
import {
  Search, MapPin, Stethoscope, Building2, Star, Clock, User,
  ArrowLeft, CheckCircle, Loader2, Calendar, Phone, Mail, QrCode,
  Filter, X, Heart
} from 'lucide-react';

type BookingStep = 'browse' | 'doctors' | 'slots' | 'payment' | 'done';

const FindHospital = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Filters
  const [state, setState] = useState(searchParams.get('state') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Booking flow
  const [step, setStep] = useState<BookingStep>('browse');
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [healthProblem, setHealthProblem] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const states = Object.keys(indianStatesAndDistricts).sort();
  const districts = state ? indianStatesAndDistricts[state] || [] : [];

  // Fetch hospitals
  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ['find-hospitals', state, district, specialty],
    queryFn: async () => {
      let query = supabase.from('hospitals').select('*').eq('status', 'approved');
      if (state) query = query.eq('state', state);
      if (district) query = query.eq('district', district);
      if (specialty) query = query.contains('specializations', [specialty]);
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch doctors for selected hospital
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['hospital-doctors-list', selectedHospital?.id],
    enabled: !!selectedHospital?.id && step === 'doctors',
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('*').eq('hospital_id', selectedHospital!.id).eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch slots for selected doctor
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['doctor-slots-list', selectedDoctor?.id, bookingDate],
    enabled: !!selectedDoctor?.id && step === 'slots',
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').eq('doctor_id', selectedDoctor!.id).eq('slot_date', bookingDate).eq('is_booked', false).order('slot_time');
      if (error) throw error;
      return data || [];
    },
  });

  const filteredHospitals = hospitals?.filter(h =>
    !searchText || h.name.toLowerCase().includes(searchText.toLowerCase()) || h.address.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  const selectHospital = (hospital: any) => {
    setSelectedHospital(hospital);
    setStep('doctors');
  };

  const selectDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setStep('slots');
  };

  const selectSlot = (slot: any) => {
    setSelectedSlot(slot);
    setStep('payment');
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientAge || !patientPhone || !healthProblem || !transactionId) return;
    setLoading(true);
    try {
      const { data: existingSlots } = await supabase.from('time_slots').select('id').eq('doctor_id', selectedDoctor!.id).eq('slot_date', bookingDate).eq('is_booked', true);
      const tokenNumber = (existingSlots?.length || 0) + 1;
      const waitingTime = (tokenNumber - 1) * 15;

      await supabase.from('time_slots').update({ is_booked: true }).eq('id', selectedSlot!.id);

      await supabase.from('appointments').insert({
        patient_name: patientName,
        patient_age: parseInt(patientAge),
        patient_phone: patientPhone,
        patient_email: patientEmail || null,
        doctor_id: selectedDoctor!.id,
        slot_id: selectedSlot!.id,
        hospital_id: selectedHospital!.id,
        health_problem: healthProblem,
        payment_status: 'completed',
        transaction_id: transactionId,
        token_number: tokenNumber,
        waiting_time: waitingTime,
        status: 'booked',
      } as any);

      toast({ title: `✅ Booked! Token #${tokenNumber} · Wait ~${waitingTime} min` });
      setStep('done');
    } catch (err) {
      console.error(err);
      toast({ title: 'Booking failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep('browse');
    setSelectedHospital(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setPatientEmail('');
    setHealthProblem('');
    setTransactionId('');
  };

  // BROWSE - Hospital Search & Discovery
  if (step === 'browse') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
        <div className="container py-8 max-w-6xl">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Find Hospitals</h1>
            <p className="text-muted-foreground">Search from {hospitals?.length || 0} approved hospitals across India</p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search by hospital name or location..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-10 h-12 rounded-xl" />
            </div>
            <Button variant="outline" className="h-12 rounded-xl gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />{showFilters ? 'Hide Filters' : 'Filters'}
              {(state || district || specialty) && <Badge className="bg-primary text-primary-foreground ml-1">{[state, district, specialty].filter(Boolean).length}</Badge>}
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="border-0 card-shadow mb-6 animate-fade-in">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">State</label>
                    <Select value={state} onValueChange={v => { setState(v); setDistrict(''); }}>
                      <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
                      <SelectContent>{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">District</label>
                    <Select value={district} onValueChange={setDistrict} disabled={!state}>
                      <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                      <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Specialty</label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger><SelectValue placeholder="All Specialties" /></SelectTrigger>
                      <SelectContent>{healthProblems.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                {(state || district || specialty) && (
                  <Button variant="ghost" size="sm" className="mt-3 text-destructive" onClick={() => { setState(''); setDistrict(''); setSpecialty(''); }}>
                    <X className="h-4 w-4 mr-1" />Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {hospitalsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">No hospitals found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHospitals.map(h => (
                <Card key={h.id} className="border-0 card-shadow hover:card-shadow-lg transition-all cursor-pointer group" onClick={() => selectHospital(h)}>
                  <CardContent className="p-0">
                    <div className="h-32 gradient-hero rounded-t-lg flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-primary-foreground/50" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading font-bold text-sm group-hover:text-primary transition-colors">{h.name}</h3>
                        <Badge className="bg-success/10 text-success border-0 text-[10px] shrink-0">Verified ✓</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3 shrink-0" />{h.district}, {h.state}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {h.specializations?.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {h.specializations?.length > 3 && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{h.specializations.length - 3}</span>
                        )}
                      </div>
                      <Button size="sm" className="w-full rounded-xl group-hover:bg-primary transition-colors">
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DOCTORS
  if (step === 'doctors') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
        <div className="container py-8 max-w-4xl">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => setStep('browse')}>
            <ArrowLeft className="h-4 w-4" />Back to Hospitals
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold">{selectedHospital?.name}</h1>
              <p className="text-sm text-muted-foreground">{selectedHospital?.district}, {selectedHospital?.state}</p>
            </div>
          </div>

          <h2 className="font-heading text-lg font-semibold mb-4">Select a Doctor</h2>

          {doctorsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !doctors || doctors.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No doctors available at this hospital</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc: any) => (
                <Card key={doc.id} className="border-0 card-shadow hover:card-shadow-lg transition-all cursor-pointer" onClick={() => selectDoctor(doc)}>
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold">Dr. {doc.name}</h3>
                      <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{doc.experience} yrs</span>
                        {doc.education_details && <span>{doc.education_details}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // SLOTS
  if (step === 'slots') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
        <div className="container py-8 max-w-3xl">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => setStep('doctors')}>
            <ArrowLeft className="h-4 w-4" />Back to Doctors
          </Button>

          <Card className="border-0 card-shadow mb-6">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold">Dr. {selectedDoctor?.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedDoctor?.specialization} · {selectedHospital?.name}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Select Date:</label>
            <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-auto rounded-xl" min={new Date().toISOString().split('T')[0]} />
          </div>

          <h2 className="font-heading text-lg font-semibold mb-4">Available Slots</h2>

          {slotsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !slots || slots.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No available slots for this date</p>
              <p className="text-xs text-muted-foreground mt-1">Try selecting a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slots.map((s: any) => (
                <Card key={s.id} className="border-0 card-shadow cursor-pointer hover:border-primary hover:card-shadow-lg transition-all" onClick={() => selectSlot(s)}>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="font-heading font-bold text-sm">{s.slot_time}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // PAYMENT
  if (step === 'payment') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
        <div className="container py-8 max-w-4xl">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => setStep('slots')}>
            <ArrowLeft className="h-4 w-4" />Back to Slots
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Summary */}
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{selectedHospital?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedHospital?.district}, {selectedHospital?.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <User className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Dr. {selectedDoctor?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDoctor?.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <Calendar className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{bookingDate}</p>
                    <p className="text-xs text-muted-foreground">Time: {selectedSlot?.slot_time}</p>
                  </div>
                </div>
                {selectedHospital?.upi_qr_url ? (
                  <div className="text-center pt-4">
                    <p className="text-sm font-medium mb-2">Scan to Pay</p>
                    <img src={selectedHospital.upi_qr_url} alt="UPI QR" className="max-w-[160px] mx-auto rounded-lg border" />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <QrCode className="h-16 w-16 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">UPI QR not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient Details & Payment */}
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Patient Details & Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                    <Input required value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient name" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Age *</label>
                      <Input required type="number" min="0" max="120" value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="Age" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Phone *</label>
                      <Input required value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="10-digit" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <Input type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} placeholder="patient@email.com" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Health Problem *</label>
                    <Select value={healthProblem} onValueChange={setHealthProblem}>
                      <SelectTrigger><SelectValue placeholder="Select problem" /></SelectTrigger>
                      <SelectContent>{healthProblems.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Transaction ID *</label>
                    <Input required value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Payment transaction ID" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl" size="lg" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Booking...</> : 'Confirm & Book Appointment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // DONE
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30 flex items-center justify-center">
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h2 className="font-heading text-3xl font-bold mb-3">Appointment Booked!</h2>
        <p className="text-muted-foreground mb-2">Your appointment has been confirmed successfully.</p>
        <p className="text-sm text-muted-foreground mb-8">You will receive a confirmation notification shortly.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="rounded-xl" onClick={resetBooking}>Book Another</Button>
          <Button className="rounded-xl" onClick={() => window.location.href = '/patient/dashboard'}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
};

export default FindHospital;
