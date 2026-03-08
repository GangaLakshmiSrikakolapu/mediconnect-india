import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const doctorNames = [
  "Arjun Kumar", "Priya Sharma", "Rahul Mehta", "Sneha Reddy",
  "Vikram Singh", "Anjali Patel", "Deepak Nair", "Swathi Rao",
  "Arun Joshi", "Kavitha Iyer", "Suresh Menon", "Divya Krishnan",
  "Manoj Tiwari", "Neha Gupta", "Ravi Shankar", "Pooja Deshmukh",
  "Sanjay Verma", "Lakshmi Narayan", "Amit Saxena", "Meera Kulkarni",
  "Kiran Bhat", "Anita Mishra", "Rajesh Pillai", "Sunita Choudhary",
  "Harish Babu", "Rekha Yadav", "Venkat Raman", "Padma Sundaram",
  "Ashok Pandey", "Geeta Mahajan", "Naveen Prasad", "Smitha Thomas",
  "Ganesh Hegde", "Bhavana Shetty", "Pranav Kapoor", "Isha Malhotra",
  "Tarun Bose", "Nandini Sen", "Siddharth Das", "Ritu Agarwal",
];

const educationOptions = [
  "MBBS – AIIMS Delhi", "MD (Cardiology) – PGIMER Chandigarh",
  "MS (ENT) – JIPMER Puducherry", "MBBS – Osmania Medical College",
  "MD – Apollo Institute of Medical Sciences", "MBBS – CMC Vellore",
  "MD (Pediatrics) – KGMU Lucknow", "MS (Orthopedics) – MAMC Delhi",
  "MBBS – Grant Medical College Mumbai", "MD (Dermatology) – NIMHANS Bangalore",
  "MBBS – Madras Medical College", "MD (Neurology) – SGPGI Lucknow",
  "MS (Ophthalmology) – Sankara Nethralaya", "MBBS – KMC Manipal",
  "MD (Pulmonology) – VPCI Delhi", "MBBS – BHU Varanasi",
  "MD (Psychiatry) – NIMHANS Bangalore", "MS (General Surgery) – AIIMS Delhi",
  "MBBS – Armed Forces Medical College Pune", "MD (Gastroenterology) – Asian Institute Hyderabad",
];

const slotTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00",
  "14:00", "14:30", "15:00", "15:30", "16:00",
  "18:00", "18:30", "19:00",
];

function generateSlots(doctorId: string): any[] {
  const slots = [];
  const today = new Date();
  for (let day = 1; day <= 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];
    for (const time of slotTimes) {
      slots.push({ doctor_id: doctorId, slot_date: dateStr, slot_time: time, is_booked: false });
    }
  }
  return slots;
}

let nameIndex = 0;
function getUniqueName(usedNames: Set<string>): string {
  for (let i = 0; i < doctorNames.length; i++) {
    const idx = (nameIndex + i) % doctorNames.length;
    if (!usedNames.has(doctorNames[idx])) {
      nameIndex = idx + 1;
      usedNames.add(doctorNames[idx]);
      return doctorNames[idx];
    }
  }
  const fallback = `Doctor ${Date.now()}`;
  usedNames.add(fallback);
  return fallback;
}

function getEducation(): string {
  return educationOptions[Math.floor(Math.random() * educationOptions.length)];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is an admin via JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Access denied. Admin role required." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, hospitalId, status } = await req.json();

    if (action === "list") {
      const { data, error } = await supabaseAdmin.from("hospitals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ hospitals: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_doctors_request" && hospitalId) {
      const { data, error } = await supabaseAdmin.from("doctors_request").select("*").eq("hospital_id", hospitalId);
      if (error) throw error;
      return new Response(JSON.stringify({ doctors: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_status" && hospitalId && status) {
      const { error } = await supabaseAdmin.from("hospitals").update({ status }).eq("id", hospitalId);
      if (error) throw error;

      if (status === "approved") {
        const { data: hospital } = await supabaseAdmin
          .from("hospitals").select("*").eq("id", hospitalId).single();

        if (hospital) {
          // Activate existing doctors
          await supabaseAdmin.from("doctors").update({ status: "active" }).eq("hospital_id", hospitalId);

          const { data: existingDoctors } = await supabaseAdmin
            .from("doctors").select("id, name, specialization").eq("hospital_id", hospitalId);

          const usedNames = new Set((existingDoctors || []).map((d: any) => d.name));
          const specCounts: Record<string, number> = {};
          for (const d of existingDoctors || []) {
            specCounts[d.specialization] = (specCounts[d.specialization] || 0) + 1;
          }

          // Generate slots for existing doctors without slots
          for (const doc of existingDoctors || []) {
            const { data: existingSlots } = await supabaseAdmin
              .from("time_slots").select("id").eq("doctor_id", doc.id).limit(1);
            if (!existingSlots || existingSlots.length === 0) {
              const slots = generateSlots(doc.id);
              await supabaseAdmin.from("time_slots").insert(slots);
            }
          }

          // Auto-fill: ensure at least 2 doctors per specialization
          const newDoctors: any[] = [];
          const specs = hospital.specializations || [];
          const allSpecs = specs.includes("General Medicine") ? specs : ["General Medicine", ...specs];

          for (const spec of allSpecs) {
            const existing = specCounts[spec] || 0;
            const target = spec === "General Medicine" ? 3 : 2;
            const needed = Math.max(0, target - existing);

            for (let i = 0; i < needed; i++) {
              newDoctors.push({
                name: getUniqueName(usedNames),
                specialization: spec,
                hospital_id: hospitalId,
                experience: Math.floor(Math.random() * 8) + 3,
                education_details: getEducation(),
                status: "active",
              });
            }
          }

          if (newDoctors.length > 0) {
            const { data: created, error: docErr } = await supabaseAdmin
              .from("doctors").insert(newDoctors).select();

            if (docErr) {
              console.error("Error creating auto-fill doctors:", docErr);
            } else if (created) {
              const allSlots = created.flatMap((doc: any) => generateSlots(doc.id));
              if (allSlots.length > 0) {
                const { error: slotErr } = await supabaseAdmin.from("time_slots").insert(allSlots);
                if (slotErr) console.error("Error creating slots:", slotErr);
              }
            }
          }

          // Generate access codes for all active doctors
          const { data: allDoctors } = await supabaseAdmin
            .from("doctors").select("id").eq("hospital_id", hospitalId).eq("status", "active");

          for (const doc of allDoctors || []) {
            const { data: existingCode } = await supabaseAdmin
              .from("doctor_access_codes").select("id").eq("doctor_id", doc.id).limit(1);
            if (!existingCode || existingCode.length === 0) {
              const code = `DOC-${doc.id.substring(0, 8).toUpperCase()}`;
              await supabaseAdmin.from("doctor_access_codes").insert({
                doctor_id: doc.id,
                access_code: code,
              });
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Admin hospitals error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
