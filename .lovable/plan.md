

## Plan: Hospital Re-submission, Doctor Uniqueness, and Full India Language Support

This is a large feature set with three main areas. Here is the implementation plan.

---

### 1. Hospital Re-submission (Edit Existing Request)

**Edge function change** (`supabase/functions/hospital-request/index.ts`):
- Before inserting a new hospital, query for an existing hospital with matching `email` (the most reliable unique identifier).
- If found: UPDATE the existing hospital record (name, phone, state, district, address, specializations, upi_qr_url) and set `status = 'pending'`. Delete old `doctors_request` and `doctors` entries for that hospital_id, then insert the new doctors. Return the existing hospital_id.
- If not found: proceed with current INSERT flow.

**Frontend change** (`src/pages/HospitalRequest.tsx`):
- Add an "email lookup" step: after entering hospital email, check if a hospital with that email already exists via a direct Supabase query.
- If found, pre-fill all form fields (name, phone, state, district, address, specializations) and fetch existing doctors from `doctors_request` table to pre-populate the doctors list.
- Change submit button text to "Submit Changes" when editing an existing hospital.
- Show an info banner: "Editing existing hospital request" when in edit mode.

### 2. Doctor Duplicate Control

**Frontend validation** (`src/pages/HospitalRequest.tsx`):
- In the `addDoctor` function, before adding a doctor to the local list, check if a doctor with the same `email` already exists in the `doctors` array.
- If duplicate found, show toast error: "Doctor already exists for this hospital".

**Edge function validation** (`supabase/functions/hospital-request/index.ts`):
- Before inserting doctors, check for duplicate emails within the submitted doctors array.
- Return error if duplicates found.

**Multiple specializations**: This would require a significant schema change (new junction table). Given the current `doctors` table has a single `specialization` text column, and this is used throughout the app, I recommend deferring this to avoid breaking the booking flow. Instead, allow comma-separated specializations in the existing field for now.

### 3. Full India Language Support (7 New Languages)

**Update `src/i18n/translations.ts`**:
- Add Language type: `'mr' | 'gu' | 'bn' | 'pa' | 'or' | 'ur' | 'as'`
- Add `languageNames` entries for: Marathi, Gujarati, Bengali, Punjabi, Odia, Urdu, Assamese
- Add full translation objects for all 7 new languages, matching the existing structure (nav, home, insurance, findHospital, payment, thankYou, hospitalMenu, hospitalRequest, admin, common)

**Update `src/contexts/LanguageContext.tsx`**:
- Language type automatically extends since it imports from translations.

**No other changes needed** — the Header language dropdown already iterates over `languageNames` dynamically.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/i18n/translations.ts` | Add 7 new languages to type, languageNames, and translations object |
| `src/pages/HospitalRequest.tsx` | Add email lookup for edit mode, pre-fill form, doctor duplicate check |
| `supabase/functions/hospital-request/index.ts` | Add upsert logic for existing hospitals, doctor duplicate validation |

### Execution Order

1. Add 7 new languages to translations (largest file change)
2. Update HospitalRequest.tsx with edit mode and doctor duplicate check
3. Update hospital-request edge function with upsert logic

