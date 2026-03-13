import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { User, Clock, GraduationCap, Phone, Mail } from 'lucide-react';

const DoctorList = ({ hospitalId, healthProblem, onSelectDoctor, onBack }: { hospitalId: string; healthProblem: string; onSelectDoctor: (id: string) => void; onBack: () => void }) => {
  const { t } = useLanguage();
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors', hospitalId, healthProblem],
    queryFn: async () => {
      const { data, error } = await supabase.from('doctors').select('*').eq('hospital_id', hospitalId).eq('specialization', healthProblem).eq('status', 'active');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center text-muted-foreground">{t.common.loading}</p>;

  return (
    <div className="space-y-4">
      {(!doctors || doctors.length === 0) ? (
        <p className="text-center text-muted-foreground py-8">Doctors not available for this hospital yet.</p>
      ) : doctors.map(d => (
        <Card key={d.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex-row items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2.5"><User className="h-5 w-5 text-primary" /></div>
            <div>
              <CardTitle className="text-base">Dr. {d.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{d.specialization}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />{d.experience} {t.findHospital.years} {t.findHospital.experience}
              </span>
              {d.education_details && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />{d.education_details}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {d.phone && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />{d.phone}
                </span>
              )}
              {d.email && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />{d.email}
                </span>
              )}
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => onSelectDoctor(d.id)}>{t.findHospital.bookAppointment}</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={onBack}>{t.findHospital.back}</Button>
    </div>
  );
};
export default DoctorList;
