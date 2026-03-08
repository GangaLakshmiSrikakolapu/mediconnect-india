ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS email text DEFAULT '';
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';