import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock, Sun, CloudSun, Coffee } from 'lucide-react';

const formatTime12 = (time24: string) => {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const SlotBooking = ({ doctorId, bookingDate, onSelectSlot, onBack }: { doctorId: string; bookingDate: string; onSelectSlot: (id: string, time?: string) => void; onBack: () => void }) => {
  const { t } = useLanguage();
  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', doctorId, bookingDate],
    queryFn: async () => {
      const { data, error } = await supabase.from('time_slots').select('*').eq('doctor_id', doctorId).eq('slot_date', bookingDate);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-center text-muted-foreground">{t.common.loading}</p>;

  const morningSlots = slots?.filter(s => {
    const hour = parseInt(s.slot_time.split(':')[0]);
    return hour >= 9 && hour < 12;
  }).sort((a, b) => a.slot_time.localeCompare(b.slot_time)) || [];

  const afternoonSlots = slots?.filter(s => {
    const hour = parseInt(s.slot_time.split(':')[0]);
    return hour >= 14 && hour < 16;
  }).sort((a, b) => a.slot_time.localeCompare(b.slot_time)) || [];

  const renderSlotGroup = (title: string, icon: React.ReactNode, groupSlots: typeof slots) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {(!groupSlots || groupSlots.length === 0) ? (
        <p className="text-xs text-muted-foreground italic pl-7">No slots available</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {groupSlots.map(s => (
            <Card
              key={s.id}
              className={`transition-all ${s.is_booked ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer hover:border-primary hover:shadow-md'}`}
              onClick={() => !s.is_booked && onSelectSlot(s.id, s.slot_time)}
            >
              <CardContent className="p-4 text-center">
                <Clock className={`h-5 w-5 mx-auto mb-1 ${s.is_booked ? 'text-muted-foreground' : 'text-primary'}`} />
                <p className={`font-medium text-sm ${s.is_booked ? 'line-through text-muted-foreground' : ''}`}>{formatTime12(s.slot_time)}</p>
                {s.is_booked && <p className="text-[10px] text-destructive mt-1">Booked</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-semibold text-center">{t.findHospital.availableSlots}</h2>
      {(!slots || slots.length === 0) ? (
        <p className="text-center text-muted-foreground py-8">{t.findHospital.noSlots}</p>
      ) : (
        <>
          {renderSlotGroup('Morning Slots (9 AM – 12 PM)', <Sun className="h-4 w-4 text-amber-500" />, morningSlots)}

          <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-muted/50 border border-border">
            <Coffee className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-muted-foreground">Lunch Break (12 PM – 2 PM)</span>
          </div>

          {renderSlotGroup('Afternoon Slots (2 PM – 4 PM)', <CloudSun className="h-4 w-4 text-orange-500" />, afternoonSlots)}
        </>
      )}
      <Button variant="outline" onClick={onBack}>{t.findHospital.back}</Button>
    </div>
  );
};
export default SlotBooking;
