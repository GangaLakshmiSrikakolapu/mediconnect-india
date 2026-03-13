import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PatientData } from '@/pages/FindHospital';
import { MapPin, Stethoscope } from 'lucide-react';

const HospitalList = ({ patientData, onSelectHospital, onBack }: { patientData: PatientData; onSelectHospital: (id: string, qr: string | null, name?: string) => void; onBack: () => void }) => {
  const { t } = useLanguage();
  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['hospitals', patientData.state, patientData.district, patientData.healthProblem],
    queryFn: async () => {
      const { data, error } = await supabase.from('hospitals').select('*')
        .eq('state', patientData.state).eq('district', patientData.district)
        .eq('status', 'approved').contains('specializations', [patientData.healthProblem]);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center text-muted-foreground">{t.common.loading}</p>;

  return (
    <div className="space-y-4">
      {(!hospitals || hospitals.length === 0) ? (
        <p className="text-center text-muted-foreground py-8">{t.findHospital.noHospitals}</p>
      ) : hospitals.map(h => (
        <Card key={h.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{h.name}</CardTitle>
            <CardDescription className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{h.address}, {h.district}, {h.state}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {h.specializations?.map((s: string) => (
                <span key={s} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  <Stethoscope className="h-3 w-3" />{s}
                </span>
              ))}
            </div>
            <Button size="sm" onClick={() => onSelectHospital(h.id, h.upi_qr_url)}>{t.findHospital.viewDoctors}</Button>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={onBack}>{t.findHospital.back}</Button>
    </div>
  );
};
export default HospitalList;
