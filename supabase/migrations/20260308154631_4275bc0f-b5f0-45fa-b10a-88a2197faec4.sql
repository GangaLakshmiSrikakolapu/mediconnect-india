
CREATE TABLE public.doctors_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL,
  doctor_name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  education text DEFAULT '',
  specialization text NOT NULL,
  experience text DEFAULT '',
  age text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors_request ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert doctor requests" ON public.doctors_request
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view doctor requests" ON public.doctors_request
  FOR SELECT USING (true);

CREATE POLICY "Admins can delete doctor requests" ON public.doctors_request
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update doctor requests" ON public.doctors_request
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
