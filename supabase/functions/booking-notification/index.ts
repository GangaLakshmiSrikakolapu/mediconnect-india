import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return new Response(JSON.stringify({ error: "Missing appointmentId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch appointment with doctor and hospital info
    const { data: appointment } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (!appointment) {
      return new Response(JSON.stringify({ error: "Appointment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: doctor } = await supabaseAdmin
      .from("doctors")
      .select("*")
      .eq("id", appointment.doctor_id)
      .single();

    const { data: hospital } = await supabaseAdmin
      .from("hospitals")
      .select("name")
      .eq("id", appointment.hospital_id)
      .single();

    const { data: slot } = await supabaseAdmin
      .from("time_slots")
      .select("slot_date, slot_time")
      .eq("id", appointment.slot_id)
      .single();

    // Log the notification (in production, integrate SMTP/SendGrid here)
    const emailPayload = {
      to: doctor?.email || "doctor@hospital.com",
      subject: "New Appointment Booked",
      body: `
        Doctor: Dr. ${doctor?.name || "Unknown"}
        Patient: ${appointment.patient_name}
        Date: ${slot?.slot_date || "N/A"}
        Time: ${slot?.slot_time || "N/A"}
        Hospital: ${hospital?.name || "N/A"}
        Health Problem: ${appointment.health_problem}
      `.trim(),
    };

    console.log("Email notification payload:", JSON.stringify(emailPayload));

    return new Response(JSON.stringify({ success: true, emailPayload }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
