import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_PRIVATE_KEY = "1234";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const specializationDoctorNames: Record<string, string> = {
  "General Medicine": "Dr. General Physician",
  "Cardiology": "Dr. Cardio Specialist",
  "Neurology": "Dr. Neuro Specialist",
  "Orthopedic": "Dr. Ortho Specialist",
  "Gynecology": "Dr. Gynec Specialist",
  "Pediatrics": "Dr. Pediatric Specialist",
  "Dermatology": "Dr. Derma Specialist",
  "ENT": "Dr. ENT Specialist",
  "Eye Care": "Dr. Eye Care Specialist",
  "Gastroenterology": "Dr. Gastro Specialist",
  "Pulmonology": "Dr. Pulmo Specialist",
  "Mental Health": "Dr. Mental Health Specialist",
  "Emergency": "Dr. Emergency Specialist",
};

function generateSampleSlots(doctorId: string): any[] {
  const slots = [];
  const today = new Date();
  // Generate slots for the next 7 days
  for (let day = 1; day <= 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];
    // 6 slots per day: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00
    for (const time of ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]) {
      slots.push({
        doctor_id: doctorId,
        slot_date: dateStr,
        slot_time: time,
        is_booked: false,
      });
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

    if (action === "update_status" && hospitalId && status) {
      // Update hospital status
      const { error } = await supabaseAdmin.from("hospitals").update({ status }).eq("id", hospitalId);
      if (error) throw error;

      // If approved, auto-create doctors and time slots
      if (status === "approved") {
        // Fetch hospital details
        const { data: hospital } = await supabaseAdmin
          .from("hospitals")
          .select("*")
          .eq("id", hospitalId)
          .single();

      if (hospital) {
          // Check if doctors already exist for this hospital
          const { data: existingDoctors } = await supabaseAdmin
            .from("doctors")
            .select("specialization, name")
            .eq("hospital_id", hospitalId);

          const existingNames = new Set((existingDoctors || []).map((d: any) => d.name));
          const existingSpecs = new Set((existingDoctors || []).map((d: any) => d.specialization));

          // Always ensure 2 default General Medicine doctors exist
          const defaultDoctors = [
            { name: "Arjun Kumar", specialization: "General Medicine", experience: 5 },
            { name: "Priya Sharma", specialization: "General Medicine", experience: 7 },
          ].filter(d => !existingNames.has(d.name));

          // Create doctors for each specialization that doesn't have one yet
          const specDoctors = (hospital.specializations || [])
            .filter((spec: string) => !existingSpecs.has(spec) && spec !== "General Medicine")
            .map((spec: string) => ({
              name: specializationDoctorNames[spec] || `Dr. ${spec} Specialist`,
              specialization: spec,
              experience: Math.floor(Math.random() * 15) + 3,
            }));

          const newDoctors = [...defaultDoctors, ...specDoctors].map(d => ({
            ...d,
            hospital_id: hospitalId,
          }));

          if (newDoctors.length > 0) {
            const { data: createdDoctors, error: doctorError } = await supabaseAdmin
              .from("doctors")
              .insert(newDoctors)
              .select();

            if (doctorError) {
              console.error("Error creating doctors:", doctorError);
            } else if (createdDoctors) {
              // Create time slots for each new doctor
              const allSlots = createdDoctors.flatMap((doc: any) => generateSampleSlots(doc.id));
              
              if (allSlots.length > 0) {
                const { error: slotError } = await supabaseAdmin
                  .from("time_slots")
                  .insert(allSlots);

                if (slotError) {
                  console.error("Error creating slots:", slotError);
                }
              }
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
