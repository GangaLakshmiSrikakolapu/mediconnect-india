import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { hospital_name, email, phone, address, state, district, specializations, upi_qr_url, doctors } = body;

    // Validate hospital fields
    if (!hospital_name || !hospital_name.trim()) {
      return ok({ success: false, message: "Hospital name is required" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ok({ success: false, message: "Valid hospital email is required" });
    }
    if (!phone || phone.trim().length < 10) {
      return ok({ success: false, message: "Valid phone number is required (min 10 digits)" });
    }
    if (!state || !district || !address) {
      return ok({ success: false, message: "State, district and address are required" });
    }
    if (!specializations || specializations.length === 0) {
      return ok({ success: false, message: "At least one specialization is required" });
    }
    if (!doctors || !Array.isArray(doctors) || doctors.length === 0) {
      return ok({ success: false, message: "At least one doctor is required" });
    }

    // Validate each doctor
    for (let i = 0; i < doctors.length; i++) {
      const d = doctors[i];
      if (!d.doctor_name?.trim()) {
        return ok({ success: false, message: `Doctor ${i + 1}: Name is required` });
      }
      if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
        return ok({ success: false, message: `Doctor ${i + 1} (${d.doctor_name}): Valid email is required` });
      }
      if (!d.phone || d.phone.trim().length < 10) {
        return ok({ success: false, message: `Doctor ${i + 1} (${d.doctor_name}): Valid phone number is required` });
      }
      if (!d.specialization?.trim()) {
        return ok({ success: false, message: `Doctor ${i + 1} (${d.doctor_name}): Specialization is required` });
      }
      if (!d.education?.trim()) {
        return ok({ success: false, message: `Doctor ${i + 1} (${d.doctor_name}): Education details are required` });
      }
    }

    // Check for duplicate doctor emails within the submission
    const doctorEmails = doctors.map((d: any) => d.email.trim().toLowerCase());
    const uniqueEmails = new Set(doctorEmails);
    if (uniqueEmails.size !== doctorEmails.length) {
      return ok({ success: false, message: "Duplicate doctor emails found. Each doctor must have a unique email." });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if hospital with this email already exists
    const { data: existingHospital } = await supabaseAdmin
      .from("hospitals")
      .select("id")
      .eq("email", email.trim())
      .maybeSingle();

    let hospitalId: string;
    let isUpdate = false;

    if (existingHospital) {
      isUpdate = true;
      hospitalId = existingHospital.id;
      console.log("Updating existing hospital:", hospitalId);

      const { error: updateError } = await supabaseAdmin.from("hospitals").update({
        name: hospital_name.trim(),
        phone: phone.trim(),
        state, district,
        address: address.trim(),
        specializations,
        upi_qr_url: upi_qr_url || undefined,
        status: "pending",
      }).eq("id", hospitalId);

      if (updateError) {
        console.error("Hospital update error:", updateError);
        return ok({ success: false, message: "Failed to update hospital: " + updateError.message });
      }

      await supabaseAdmin.from("doctors_request").delete().eq("hospital_id", hospitalId);
      await supabaseAdmin.from("doctors").delete().eq("hospital_id", hospitalId);

    } else {
      console.log("Creating new hospital request:", hospital_name);
      const { data: hospital, error: hospError } = await supabaseAdmin.from("hospitals").insert({
        name: hospital_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        state, district,
        address: address.trim(),
        specializations,
        upi_qr_url: upi_qr_url || null,
        status: "pending",
      }).select().single();

      if (hospError) {
        console.error("Hospital insertion error:", hospError);
        const msg = hospError.message?.includes("duplicate")
          ? "A hospital with this email already exists"
          : "Failed to save hospital: " + hospError.message;
        return ok({ success: false, message: msg });
      }

      hospitalId = hospital.id;
    }

    console.log("Hospital ID:", hospitalId, isUpdate ? "(updated)" : "(new)");

    // Save doctors to doctors_request table
    const doctorRequestRows = doctors.map((d: any) => ({
      hospital_id: hospitalId,
      doctor_name: d.doctor_name.trim(),
      email: d.email?.trim() || "",
      phone: d.phone?.trim() || "",
      education: d.education?.trim() || "",
      specialization: d.specialization.trim(),
      experience: d.experience?.toString() || "0",
      age: d.age?.toString() || "",
    }));

    const { error: drError } = await supabaseAdmin.from("doctors_request").insert(doctorRequestRows);
    if (drError) {
      console.error("Doctor request insertion error:", drError);
      return ok({ success: false, message: "Hospital saved but failed to save doctors: " + drError.message });
    }

    // Also save to doctors table with status = pending
    const doctorRows = doctors.map((d: any) => ({
      name: d.doctor_name.trim(),
      age: parseInt(d.age) || 0,
      email: d.email?.trim() || "",
      phone: d.phone?.trim() || "",
      specialization: d.specialization.trim(),
      education_details: d.education?.trim() || "",
      experience: parseInt(d.experience) || 0,
      hospital_id: hospitalId,
      status: "pending",
    }));

    const { error: docError } = await supabaseAdmin.from("doctors").insert(doctorRows);
    if (docError) {
      console.error("Doctor table insertion error:", docError);
    }

    console.log("Hospital request submitted successfully:", hospitalId);
    return ok({
      success: true,
      message: isUpdate
        ? "Hospital request updated successfully. Your changes will be reviewed by Super Admin."
        : "Hospital request submitted successfully. Your request will be reviewed by Super Admin.",
      hospital_id: hospitalId,
      doctors_count: doctors.length,
      is_update: isUpdate,
    });

  } catch (err) {
    console.error("Hospital request error:", err);
    return ok({ success: false, message: "An unexpected error occurred: " + (err as Error).message });
  }
});
