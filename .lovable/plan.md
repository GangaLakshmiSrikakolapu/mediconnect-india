

# MEDICONNECT – Implementation Plan

## Overview
A full-featured healthcare platform for India with hospital discovery, appointment booking, insurance info, hospital onboarding, and super admin management — all backed by Supabase.

---

## 1. Database Setup (Supabase)
- **hospitals** table: name, email, phone, state, district, address, specializations, upi_qr_url, status (pending/approved/rejected)
- **doctors** table: name, specialization, experience, hospital_id
- **time_slots** table: doctor_id, date, time, is_booked
- **appointments** table: patient details, doctor_id, slot_id, payment_status
- **user_roles** table: for super admin role management (secure, separate from profiles)
- **profiles** table: basic user info
- RLS policies for all tables with `has_role()` security definer function

## 2. Multi-Language System
- Language dropdown in header (English, Hindi, Telugu, Tamil, Kannada, Malayalam)
- Global context storing language preference
- Translation JSON files for all UI text, dynamically switching on selection

## 3. Layout & Navigation
- Fixed top header with: **Users** | **Hospitals** | **Info** | **Language Selector**
- Healthcare color theme: white background, teal/light blue accents, soft green highlights
- Fully responsive with mobile-friendly navigation

## 4. Home Page
- Centered hero: "MEDICONNECT" title + subtitle
- Two action cards: **Insurance** and **Find Hospital**

## 5. Insurance Page
- Informational sections: Types, Coverage, Benefits, Eligibility, Claim Process, FAQs
- Clean card-based layout with accordion for FAQs

## 6. Find Hospital Flow (5 Steps)
- **Step 1**: Patient form – name, age, state → district (dependent dropdown with all Indian states/UTs), health problem (13+ categories), booking date
- **Step 2**: Hospital listing – filtered by state/district/problem, showing only approved hospitals
- **Step 3**: Doctor list for selected hospital, filtered by specialization
- **Step 4**: Slot booking – display available time slots, book button
- **Step 5**: Simulated payment – phone, email, transaction ID form + QR code display → success/failure result
- **Final**: Thank you page with quote

## 7. Hospitals Menu
- Landing page with two options: **Hospital Request** and **Super Admin**

### Hospital Request Form
- Fields: name, email, phone, state, district, address, specializations, doctors, UPI QR upload
- Submits to `hospitals` table with `pending` status

### Super Admin Flow
- **Login page**: Email + password authentication via Supabase Auth
- **Dashboard**: List all hospital requests with Accept/Deny actions
- Approved hospitals appear in Find Hospital flow; denied ones are hidden

## 8. Authentication
- Supabase Auth for super admin login (email + password)
- Role stored in `user_roles` table, checked via `has_role()` function
- Protected admin routes

