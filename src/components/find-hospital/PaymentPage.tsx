import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PatientData, BookingConfirmation } from '@/pages/FindHospital';
import { toast } from '@/hooks/use-toast';
import { QrCode, Loader2 } from 'lucide-react';

const PaymentPage = ({ patientData, hospitalId, doctorId, slotId, upiQrUrl, doctorName, hospitalName, slotTime, onSuccess, onBack }: {
  patientData: PatientData; hospitalId: string; doctorId: string; slotId: string; upiQrUrl: string | null;
  doctorName: string; hospitalName: string; slotTime: string;
  onSuccess: (confirmation: BookingConfirmation) => void; onBack: () => void;
}) => {
  const { t } = useLanguage();
  const { patient } = usePatient();
  const [phone, setPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setPhone(patient.phone || '');
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !transactionId) {
      toast({ title: 'Invalid patient data', description: 'Phone number and Transaction ID are required.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: slotData } = await supabase.from('time_slots').select('slot_date, slot_time').eq('id', slotId).single();
      if (!slotData) throw new Error('Slot not found');
      const bookingDate = slotData.slot_date;

      let tokenNumber = 1;
      let waitingTime = 0;

      const { data: existingSlots } = await supabase
        .from('time_slots')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('slot_date', bookingDate)
        .eq('is_booked', true);

      tokenNumber = (existingSlots?.length || 0) + 1;
      waitingTime = (tokenNumber - 1) * 15;

      await supabase.from('time_slots').update({ is_booked: true }).eq('id', slotId);

      const { data: appointment, error: insertErr } = await supabase.from('appointments').insert({
        patient_name: patientData.name,
        patient_age: parseInt(patientData.age),
        patient_phone: phone,
        patient_email: patient?.email || null,
        doctor_id: doctorId,
        slot_id: slotId,
        hospital_id: hospitalId,
        health_problem: patientData.healthProblem,
        payment_status: 'completed',
        transaction_id: transactionId,
        token_number: tokenNumber,
        waiting_time: waitingTime,
        status: 'booked',
        patient_id: patient?.id || null,
      } as any).select().single();

      if (insertErr) throw new Error('Appointment save failed: ' + insertErr.message);

      if (appointment) {
        await supabase.functions.invoke('booking-notification', {
          body: { appointmentId: (appointment as any).id },
        }).catch(err => console.error('Notification error:', err));
      }

      toast({
        title: '✅ Appointment Confirmed!',
        description: `Token Number: ${tokenNumber} | Estimated Wait: ${waitingTime} minutes`,
      });

      onSuccess({
        tokenNumber,
        doctorName,
        hospitalName,
        appointmentTime: slotData.slot_time,
        bookingDate,
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      toast({ title: 'Appointment save failed', description: err?.message || 'Database insert error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader><CardTitle>{t.payment.title}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>{t.payment.transactionId} *</Label><Input required value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Enter transaction ID" /></div>
            <div><Label>{t.payment.phone} *</Label><Input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" /></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Booking...</> : 'Confirm Appointment'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onBack}>{t.findHospital.back}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t.payment.scanQR}</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center min-h-[250px]">
          {upiQrUrl ? (
            <img src={upiQrUrl} alt="UPI QR Code" className="max-w-[200px] rounded-lg" />
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="h-24 w-24 mx-auto mb-2 opacity-20" />
              <p className="text-sm">QR Code not available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default PaymentPage;
