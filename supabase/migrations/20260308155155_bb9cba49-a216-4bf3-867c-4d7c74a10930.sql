
-- Fix hospitals INSERT policy: make it PERMISSIVE so anonymous users can submit requests
DROP POLICY IF EXISTS "Anyone can request hospital" ON public.hospitals;
CREATE POLICY "Anyone can request hospital" ON public.hospitals
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Fix doctors INSERT policy for anonymous submissions
DROP POLICY IF EXISTS "Admins can manage doctors" ON public.doctors;
CREATE POLICY "Anyone can insert pending doctors" ON public.doctors
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Fix doctors_request INSERT policy
DROP POLICY IF EXISTS "Anyone can insert doctor requests" ON public.doctors_request;
CREATE POLICY "Anyone can insert doctor requests" ON public.doctors_request
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
