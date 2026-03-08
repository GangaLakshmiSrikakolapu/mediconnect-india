import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return new Response(JSON.stringify({ error: "appointmentId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: appointment, error: apptErr } = await supabaseAdmin
      .from("appointments").select("*").eq("id", appointmentId).single();

    if (apptErr || !appointment) {
      console.error("Appointment fetch error:", apptErr);
      return new Response(JSON.stringify({ error: "Appointment not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: doctor } = await supabaseAdmin
      .from("doctors").select("*").eq("id", appointment.doctor_id).single();
    const { data: hospital } = await supabaseAdmin
      .from("hospitals").select("*").eq("id", appointment.hospital_id).single();
    const { data: slot } = await supabaseAdmin
      .from("time_slots").select("*").eq("id", appointment.slot_id).single();

    const doctorName = doctor?.name || "Doctor";
    const hospitalName = hospital?.name || "Hospital";
    const hospitalEmail = hospital?.email || "";
    const doctorEmail = doctor?.email || "";
    const patientEmail = appointment.patient_email || "";
    const patientPhone = appointment.patient_phone || "";
    const appointmentDate = slot?.slot_date || "";
    const appointmentTime = slot?.slot_time || "";
    const tokenNumber = appointment.token_number || 0;
    const waitingTime = appointment.waiting_time || 0;

    const notifications: any[] = [];

    // Hospital notification
    if (hospitalEmail) {
      notifications.push({
        appointment_id: appointmentId,
        recipient_type: "hospital",
        recipient_email: hospitalEmail,
        subject: "New Appointment Booked",
        body: `Patient: ${appointment.patient_name}\nDoctor: Dr. ${doctorName}\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nToken: ${tokenNumber}`,
        status: "logged",
      });
    }

    // Doctor notification
    if (doctorEmail) {
      notifications.push({
        appointment_id: appointmentId,
        recipient_type: "doctor",
        recipient_email: doctorEmail,
        subject: "New Patient Appointment",
        body: `Patient: ${appointment.patient_name}\nToken: ${tokenNumber}\nDate: ${appointmentDate}\nTime: ${appointmentTime}`,
        status: "logged",
      });
    }

    // Patient notification
    if (patientEmail || patientPhone) {
      notifications.push({
        appointment_id: appointmentId,
        recipient_type: "patient",
        recipient_email: patientEmail || null,
        recipient_phone: patientPhone || null,
        subject: "Appointment Confirmed",
        body: `Doctor: Dr. ${doctorName}\nHospital: ${hospitalName}\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nToken: ${tokenNumber}\nEstimated Wait: ${waitingTime} minutes`,
        status: "logged",
      });
    }

    if (notifications.length > 0) {
      const { error: notifErr } = await supabaseAdmin.from("notifications").insert(notifications);
      if (notifErr) console.error("Notification save error:", notifErr);
    }

    console.log(`Notifications created for appointment ${appointmentId}: ${notifications.length} recipients`);

    return new Response(JSON.stringify({
      success: true,
      notifications_sent: notifications.length,
      token_number: tokenNumber,
      waiting_time: waitingTime,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Booking notification error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
