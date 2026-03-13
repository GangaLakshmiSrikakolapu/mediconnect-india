import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';

const SlotBooking = ({ doctorId, bookingDate, onSelectSlot, onBack }: { doctorId: string; bookingDate: string; onSelectSlot: (id: string, time?: string) => void; onBack: () => void }) => {
  const { t } = useLanguage();
  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', doctorId, bookingDate],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').eq('doctor_id', doctorId).eq('slot_date', bookingDate).eq('is_booked', false);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center text-muted-foreground">{t.common.loading}</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-semibold text-center">{t.findHospital.availableSlots}</h2>
      {(!slots || slots.length === 0) ? (
        <p className="text-center text-muted-foreground py-8">{t.findHospital.noSlots}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slots.map(s => (
            <Card key={s.id} className="cursor-pointer hover:border-primary hover:shadow-md transition-all" onClick={() => onSelectSlot(s.id)}>
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="font-medium text-sm">{s.slot_time}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Button variant="outline" onClick={onBack}>{t.findHospital.back}</Button>
    </div>
  );
};
export default SlotBooking;
