
-- Step 1: Delete duplicate doctors, keeping earliest by created_at
DELETE FROM public.doctors d1
USING public.doctors d2
WHERE d1.hospital_id = d2.hospital_id
  AND d1.email = d2.email
  AND d1.email IS NOT NULL AND d1.email != ''
  AND d1.created_at > d2.created_at;

-- Step 2: Delete duplicate doctors_request, keeping earliest
DELETE FROM public.doctors_request d1
USING public.doctors_request d2
WHERE d1.hospital_id = d2.hospital_id
  AND d1.email = d2.email
  AND d1.email IS NOT NULL AND d1.email != ''
  AND d1.created_at > d2.created_at;

-- Step 3: Change specialization column from text to text[] on doctors
ALTER TABLE public.doctors 
  ALTER COLUMN specialization TYPE text[] 
  USING ARRAY[specialization];

-- Step 4: Change specialization column from text to text[] on doctors_request
ALTER TABLE public.doctors_request 
  ALTER COLUMN specialization TYPE text[] 
  USING ARRAY[specialization];

-- Step 5: Add unique constraint on doctors
CREATE UNIQUE INDEX unique_doctor_per_hospital ON public.doctors (hospital_id, email) WHERE email IS NOT NULL AND email != '';

-- Step 6: Add unique constraint on doctors_request
CREATE UNIQUE INDEX unique_doctor_request_per_hospital ON public.doctors_request (hospital_id, email) WHERE email IS NOT NULL AND email != '';
