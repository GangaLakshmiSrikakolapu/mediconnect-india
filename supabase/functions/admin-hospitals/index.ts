import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_PRIVATE_KEY = "1234";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const slotTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "15:00", "15:30", "16:00", "16:30",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key, action, hospitalId, status } = await req.json();

    if (!key || key !== ADMIN_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "Invalid key. Try again." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
        // Move doctors from doctors_request to doctors table
        const { data: requestedDoctors } = await supabaseAdmin
          .from("doctors_request").select("*").eq("hospital_id", hospitalId);

        if (requestedDoctors && requestedDoctors.length > 0) {
          const newDoctors = requestedDoctors.map((rd: any) => ({
            name: rd.doctor_name,
            specialization: rd.specialization,
            hospital_id: hospitalId,
            experience: parseInt(rd.experience) || 0,
            education_details: rd.education || '',
            email: rd.email || '',
            phone: rd.phone || '',
            age: parseInt(rd.age) || 0,
            status: "active",
          }));

          const { data: created, error: docErr } = await supabaseAdmin
            .from("doctors").insert(newDoctors).select();

          if (docErr) {
            console.error("Error moving doctors:", docErr);
          } else if (created) {
            // Generate slots for each new doctor
            const allSlots = created.flatMap((doc: any) => generateSlots(doc.id));
            if (allSlots.length > 0) {
              const { error: slotErr } = await supabaseAdmin.from("time_slots").insert(allSlots);
              if (slotErr) console.error("Error creating slots:", slotErr);
            }

            // Generate access codes
            for (const doc of created) {
              const code = `DOC-${doc.id.substring(0, 8).toUpperCase()}`;
              await supabaseAdmin.from("doctor_access_codes").insert({
                doctor_id: doc.id,
                access_code: code,
              });
            }
          }
        }

        // Also activate any existing doctors
        await supabaseAdmin.from("doctors").update({ status: "active" }).eq("hospital_id", hospitalId);

        // Generate slots for existing doctors without slots
        const { data: allDoctors } = await supabaseAdmin
          .from("doctors").select("id").eq("hospital_id", hospitalId).eq("status", "active");

        for (const doc of allDoctors || []) {
          const { data: existingSlots } = await supabaseAdmin
            .from("time_slots").select("id").eq("doctor_id", doc.id).limit(1);
          if (!existingSlots || existingSlots.length === 0) {
            const slots = generateSlots(doc.id);
            await supabaseAdmin.from("time_slots").insert(slots);
          }

          // Ensure access code exists
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

        console.log("Doctors moved and activated for hospital:", hospitalId);
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
