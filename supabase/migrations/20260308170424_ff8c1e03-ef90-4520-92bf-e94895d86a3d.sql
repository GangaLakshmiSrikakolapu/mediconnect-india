
-- Allow anyone to update appointments (for doctor status changes)
CREATE POLICY "Anyone can update appointments" ON public.appointments
FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anyone to delete appointments
CREATE POLICY "Anyone can delete appointments" ON public.appointments
FOR DELETE USING (true);

-- Allow updating notifications
CREATE POLICY "Anyone can update notifications" ON public.notifications
FOR UPDATE USING (true) WITH CHECK (true);
