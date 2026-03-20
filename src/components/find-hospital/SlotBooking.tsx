import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock, Sun, CloudSun, Coffee, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DEFAULT_MORNING = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const DEFAULT_AFTERNOON = ['14:00', '14:30', '15:00', '15:30'];

const formatTime12 = (time24: string) => {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

type SlotItem = {
  id: string;
  doctor_id: string;
  slot_date: string;
  slot_time: string;
  is_booked: boolean;
  is_synthetic?: boolean;
};

const SlotBooking = ({ doctorId, bookingDate, onSelectSlot, onBack }: {
  doctorId: string; bookingDate: string;
  onSelectSlot: (id: string, time?: string) => void; onBack: () => void;
}) => {
  const { t } = useLanguage();
  const [inserting, setInserting] = useState<string | null>(null);

  const { data: dbSlots, isLoading } = useQuery({
    queryKey: ['slots', doctorId, bookingDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('slot_date', bookingDate);
      if (error) throw error;
      return data;
    },
  });

  // Build effective slots: use DB data if available, otherwise generate defaults
  const slots: SlotItem[] = (() => {
    if (dbSlots && dbSlots.length > 0) {
      return dbSlots.map(s => ({ ...s, is_synthetic: false }));
    }
    // Generate fallback slots
    return [...DEFAULT_MORNING, ...DEFAULT_AFTERNOON].map(time => ({
      id: `temp-${time}`,
      doctor_id: doctorId,
      slot_date: bookingDate,
      slot_time: time,
      is_booked: false,
      is_synthetic: true,
    }));
  })();

  const handleSlotClick = async (slot: SlotItem) => {
    if (slot.is_booked) return;

    if (slot.is_synthetic) {
      // Insert into DB first to get a real ID
      setInserting(slot.id);
      try {
        const { data, error } = await supabase
          .from('time_slots')
          .insert({
            doctor_id: doctorId,
            slot_date: bookingDate,
            slot_time: slot.slot_time,
            is_booked: false,
          } as any)
          .select()
          .single();

        if (error) throw error;
        onSelectSlot(data.id, slot.slot_time);
      } catch (err: any) {
        console.error('Slot insert error:', err);
        toast({ title: 'Error', description: 'Could not reserve slot. Please try again.', variant: 'destructive' });
      } finally {
        setInserting(null);
      }
    } else {
      onSelectSlot(slot.id, slot.slot_time);
    }
  };

  if (isLoading) return <p className="text-center text-muted-foreground">{t.common.loading}</p>;

  const morningSlots = slots.filter(s => {
    const hour = parseInt(s.slot_time.split(':')[0]);
    return hour >= 9 && hour < 12;
  }).sort((a, b) => a.slot_time.localeCompare(b.slot_time));

  const afternoonSlots = slots.filter(s => {
    const hour = parseInt(s.slot_time.split(':')[0]);
    return hour >= 14 && hour < 16;
  }).sort((a, b) => a.slot_time.localeCompare(b.slot_time));

  const renderSlotGroup = (title: string, icon: React.ReactNode, groupSlots: SlotItem[]) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {groupSlots.length === 0 ? (
        <p className="text-xs text-muted-foreground italic pl-7">No slots available</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {groupSlots.map(s => (
            <Card
              key={s.id}
              className={`transition-all ${s.is_booked ? 'opacity-50 cursor-not-allowed bg-muted' : 'cursor-pointer hover:border-primary hover:shadow-md'} ${inserting === s.id ? 'opacity-70 pointer-events-none' : ''}`}
              onClick={() => handleSlotClick(s)}
            >
              <CardContent className="p-4 text-center">
                {inserting === s.id ? (
                  <Loader2 className="h-5 w-5 mx-auto mb-1 animate-spin text-primary" />
                ) : (
                  <Clock className={`h-5 w-5 mx-auto mb-1 ${s.is_booked ? 'text-muted-foreground' : 'text-primary'}`} />
                )}
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

      {renderSlotGroup('Morning Slots (9 AM – 12 PM)', <Sun className="h-4 w-4 text-amber-500" />, morningSlots)}

      <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-muted/50 border border-border">
        <Coffee className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-medium text-muted-foreground">Lunch Break (12 PM – 2 PM)</span>
      </div>

      {renderSlotGroup('Afternoon Slots (2 PM – 4 PM)', <CloudSun className="h-4 w-4 text-orange-500" />, afternoonSlots)}

      <Button variant="outline" onClick={onBack}>{t.findHospital.back}</Button>
    </div>
  );
};
export default SlotBooking;
