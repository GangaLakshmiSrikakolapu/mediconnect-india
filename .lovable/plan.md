

## Problem

Slots in Step 4 don't appear because they only exist if the admin-hospitals edge function previously generated them during hospital approval. If no DB records exist for a doctor+date combination, the UI shows "No slots available."

Additionally, the edge function generates afternoon slots at 15:00-16:30 but the frontend filters for 14:00-16:00, causing a mismatch.

## Plan

### 1. Update SlotBooking.tsx — Client-side fallback slot generation

When the DB query returns zero slots for a doctor+date, generate default slots client-side with synthetic IDs so the UI always shows clickable slots.

**Default slots to generate:**
- Morning: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
- Afternoon: 14:00, 14:30, 15:00, 15:30

Each synthetic slot gets a generated ID (e.g. `temp-{time}`), `is_booked: false`, and the correct doctor_id/date.

When a user clicks a synthetic slot, **insert it into the DB** first (to create a real record), then pass that real ID to the next step. This ensures PaymentPage has a valid slot_id.

Also fix the afternoon filter to include hour 14 and 15 (already correct in current code, `>= 14 && < 16`).

### 2. Update admin-hospitals edge function — Fix slot times

Change `slotTimes` array from `["15:00", "15:30", "16:00", "16:30"]` to `["14:00", "14:30", "15:00", "15:30"]` to match the 2 PM – 4 PM requirement.

### 3. Keep existing UI structure

The current Morning/Lunch Break/Afternoon section layout with icons is already correct. No UI changes needed beyond the data generation fix.

### Technical Details

- In `SlotBooking.tsx`: after the query, if `slots.length === 0`, build a local array of default slot objects. Use `useMutation` or inline insert to create the DB record on click before advancing.
- In `admin-hospitals/index.ts`: update line 14 from `"15:00", "15:30", "16:00", "16:30"` to `"14:00", "14:30", "15:00", "15:30"`.
- The `onSelectSlot` callback will receive the real DB slot ID after insert, keeping PaymentPage's `slotId` valid.

