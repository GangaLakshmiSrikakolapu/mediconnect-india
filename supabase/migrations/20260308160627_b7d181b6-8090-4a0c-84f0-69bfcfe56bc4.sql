
-- Add token/status columns to appointments
ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS token_number integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS waiting_time integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'booked';

-- Create doctor access codes table
CREATE TABLE public.doctor_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  access_code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can verify access codes" ON public.doctor_access_codes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage access codes" ON public.doctor_access_codes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can update access codes" ON public.doctor_access_codes
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete access codes" ON public.doctor_access_codes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create notifications log table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL,
  recipient_type text NOT NULL,
  recipient_email text,
  recipient_phone text,
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert notifications" ON public.notifications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view notifications" ON public.notifications
  FOR SELECT USING (true);
