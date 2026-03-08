import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PatientForm from '@/components/find-hospital/PatientForm';
import HospitalList from '@/components/find-hospital/HospitalList';
import DoctorList from '@/components/find-hospital/DoctorList';
import SlotBooking from '@/components/find-hospital/SlotBooking';
import PaymentPage from '@/components/find-hospital/PaymentPage';
import ThankYouPage from '@/components/find-hospital/ThankYouPage';

export type PatientData = {
  name: string;
  age: string;
  state: string;
  district: string;
  healthProblem: string;
  bookingDate: string;
};

const FindHospital = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [hospitalUpiQr, setHospitalUpiQr] = useState<string | null>(null);

  const steps = [t.findHospital.step1, t.findHospital.step2, t.findHospital.step3, t.findHospital.step4, t.findHospital.step5];

  return (
    <div className="container py-8 max-w-4xl animate-fade-in">
      <h1 className="font-heading text-3xl font-bold text-center mb-6">{t.findHospital.title}</h1>

      {/* Step indicator */}
      {step <= 5 && (
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                i + 1 === step ? 'bg-primary text-primary-foreground' :
                i + 1 < step ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-[10px]">{i + 1}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-4 md:w-8 h-0.5 bg-muted mx-1" />}
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <PatientForm onSubmit={(data) => { setPatientData(data); setStep(2); }} />
      )}
      {step === 2 && patientData && (
        <HospitalList
          patientData={patientData}
          onSelectHospital={(id, qr) => { setSelectedHospitalId(id); setHospitalUpiQr(qr); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && selectedHospitalId && patientData && (
        <DoctorList
          hospitalId={selectedHospitalId}
          healthProblem={patientData.healthProblem}
          onSelectDoctor={(id) => { setSelectedDoctorId(id); setStep(4); }}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && selectedDoctorId && patientData && (
        <SlotBooking
          doctorId={selectedDoctorId}
          bookingDate={patientData.bookingDate}
          onSelectSlot={(id) => { setSelectedSlotId(id); setStep(5); }}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && patientData && (
        <PaymentPage
          patientData={patientData}
          hospitalId={selectedHospitalId!}
          doctorId={selectedDoctorId!}
          slotId={selectedSlotId!}
          upiQrUrl={hospitalUpiQr}
          onSuccess={() => setStep(6)}
          onBack={() => setStep(4)}
        />
      )}
      {step === 6 && <ThankYouPage />}
    </div>
  );
};

export default FindHospital;
