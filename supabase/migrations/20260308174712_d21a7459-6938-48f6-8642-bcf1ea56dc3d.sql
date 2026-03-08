
-- Add hospital_admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hospital_admin';

-- Insurance companies managed by Super Admin
CREATE TABLE public.insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  type TEXT NOT NULL DEFAULT 'Health',
  irdai_number TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  revenue_share_pct NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view insurance companies" ON public.insurance_companies FOR SELECT USING (true);
CREATE POLICY "Admins can manage insurance companies" ON public.insurance_companies FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Insurance plans managed by Super Admin
CREATE TABLE public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.insurance_companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'Health',
  coverage_min NUMERIC DEFAULT 0,
  coverage_max NUMERIC DEFAULT 0,
  premium_min NUMERIC DEFAULT 0,
  premium_max NUMERIC DEFAULT 0,
  age_min INTEGER DEFAULT 0,
  age_max INTEGER DEFAULT 100,
  features TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  cashless_available BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view insurance plans" ON public.insurance_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage insurance plans" ON public.insurance_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Hospital accepted insurance plans (toggle by hospital admin)
CREATE TABLE public.hospital_insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,
  plan_id UUID REFERENCES public.insurance_plans(id) ON DELETE CASCADE NOT NULL,
  cashless_available BOOLEAN DEFAULT true,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, plan_id)
);
ALTER TABLE public.hospital_insurance_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hospital insurance" ON public.hospital_insurance_plans FOR SELECT USING (true);
CREATE POLICY "Anyone can manage hospital insurance" ON public.hospital_insurance_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update hospital insurance" ON public.hospital_insurance_plans FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete hospital insurance" ON public.hospital_insurance_plans FOR DELETE USING (true);

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏥',
  head_doctor_id UUID,
  bed_count INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Anyone can manage departments" ON public.departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update departments" ON public.departments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete departments" ON public.departments FOR DELETE USING (true);

-- Medical records
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL DEFAULT 'Other',
  record_name TEXT NOT NULL,
  file_url TEXT,
  record_date DATE DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  hospital_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own records" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON public.medical_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON public.medical_records FOR DELETE USING (auth.uid() = user_id);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,
  doctor_id UUID,
  patient_name TEXT NOT NULL DEFAULT 'Anonymous',
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT DEFAULT '',
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can create reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reviews" ON public.reviews FOR UPDATE USING (true);

-- Audit logs (immutable, only super admin can view)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Health tips / CMS content
CREATE TABLE public.health_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published tips" ON public.health_tips FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage tips" ON public.health_tips FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add admin_user_id to hospitals to link hospital to its admin account
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS admin_user_id UUID;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS hospital_type TEXT DEFAULT 'Private';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS bed_count INTEGER DEFAULT 0;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS year_established INTEGER;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS emergency_phone TEXT DEFAULT '';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS facilities TEXT[] DEFAULT '{}';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS setup_complete BOOLEAN DEFAULT false;

-- Update hospitals RLS to allow hospital admins to view their own hospital (even if pending)
DROP POLICY IF EXISTS "Anyone can view approved hospitals" ON public.hospitals;
CREATE POLICY "View hospitals" ON public.hospitals FOR SELECT USING (
  status = 'approved'::hospital_status 
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR admin_user_id = auth.uid()
);

-- Allow hospital admins to update their own hospital
CREATE POLICY "Hospital admins can update own hospital" ON public.hospitals FOR UPDATE USING (admin_user_id = auth.uid());
