
-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for this simple patient system)
CREATE POLICY "Anyone can insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Anyone can update patients" ON public.patients FOR UPDATE USING (true);

-- Add patient_id column to appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients(id);
