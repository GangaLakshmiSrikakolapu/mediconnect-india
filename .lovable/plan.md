

## Problem

The `supabase.functions.invoke()` call treats any non-2xx HTTP status as an error. The edge function returns `status: 400` or `status: 500` for validation/server errors. When this happens, `invoke()` puts the response in `error` (not `data`), so the frontend always hits the generic "Failed to submit hospital request" message on line 197 — never reaching line 202 where it would display the actual error from the backend.

## Plan

### 1. Fix error handling in `handleFinalSubmit` (`src/pages/HospitalRequest.tsx`)

Replace the current error handling block (lines 194-206) to:
- Extract the actual error message from the `error.context` or parse the error body when `supabase.functions.invoke` returns a non-2xx
- Add `console.log("Submitting hospital request:", payload)` before the call
- Add `console.log("Response:", data, error)` after the call
- Show network-specific message for fetch/network errors
- Show the backend's specific error message for validation failures

### 2. Update edge function to return 200 for all responses (`supabase/functions/hospital-request/index.ts`)

Change all validation error responses from `status: 400/500` to `status: 200` with `{ success: false, message: "..." }` in the body. Change the success response to include `{ success: true, message: "..." }`. This ensures `supabase.functions.invoke()` always puts the response in `data`, making error handling straightforward on the frontend.

### 3. Fix the `time_slots` RLS issue (bonus — from console logs)

The `time_slots` INSERT policy requires admin role, but the slot booking flow tries to insert synthetic slots as an anonymous user. Add a new RLS policy allowing anonymous/authenticated users to insert into `time_slots`, or move the slot creation to an edge function. A simpler fix: add a permissive INSERT policy for `anon` and `authenticated` roles on `time_slots`.

### Files to modify

| File | Change |
|------|--------|
| `supabase/functions/hospital-request/index.ts` | Return `status: 200` with `{ success: false/true, message }` for all responses |
| `src/pages/HospitalRequest.tsx` | Improve error handling, add console logging, show specific error messages |
| Database migration | Add RLS policy: allow anon/authenticated INSERT on `time_slots` |

