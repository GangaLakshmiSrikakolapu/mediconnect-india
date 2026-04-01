

## Plan: Fix Duplicate Doctors and Support Multiple Specializations

### Problem
- Doctors can be duplicated within a hospital (same name + email, different specializations creates separate rows)
- No database-level uniqueness constraint prevents this
- The `specialization` column is a single `text` field, forcing duplicate doctor rows for multiple specializations

### Changes

#### 1. Database migration
- Add a unique constraint: `UNIQUE(hospital_id, email)` on the `doctors` table
- Add a unique constraint: `UNIQUE(hospital_id, email)` on the `doctors_request` table  
- Change `specialization` column from `text` to `text[]` (array) on both `doctors` and `doctors_request` tables to support multiple specializations per doctor
- Write a data cleanup query to merge existing duplicates: group by `(hospital_id, email)`, aggregate specializations into an array, keep one record, delete the rest

#### 2. Edge function: `hospital-request/index.ts`
- When building doctor rows, merge doctors that share the same email — combine their specializations into an array
- Insert with the array specialization format
- Remove the "duplicate email" rejection (now we merge instead of reject)

#### 3. Edge function: `admin-hospitals/index.ts`
- When approving and inserting into the `doctors` table, use the array specialization format

#### 4. Frontend: `HospitalRequest.tsx`
- Update the `addDoctor` function: when a doctor with the same email is added again, merge the new specialization into the existing doctor's specialization list instead of rejecting
- Display specializations as comma-separated tags in the doctor list
- Update the `DoctorEntry` type: change `specialization: string` to `specializations: string[]`
- Allow selecting multiple specializations (multi-select checkboxes instead of single select)

#### 5. Frontend: All components using `doctor.specialization`
- Search for all references to `doctor.specialization` or `.specialization` and update to handle `text[]` — display as comma-joined string

### Files to modify

| File | Change |
|------|--------|
| Database migration | Cleanup duplicates, alter column type, add unique constraint |
| `supabase/functions/hospital-request/index.ts` | Merge same-email doctors, use array specialization |
| `supabase/functions/admin-hospitals/index.ts` | Use array specialization when approving |
| `src/pages/HospitalRequest.tsx` | Multi-specialization UI, merge logic, updated types |
| `src/components/find-hospital/DoctorList.tsx` | Handle array specialization display |
| `src/pages/DoctorDashboard.tsx` | Handle array specialization display |

### Execution order
1. Database migration (cleanup + schema change)
2. Edge functions update
3. Frontend updates

