import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { hospital_name, email, phone, address, state, district, specializations, upi_qr_url, doctors, admin_user_id } = body;

    if (!hospital_name || !hospital_name.trim()) {
      return new Response(JSON.stringify({ error: "Hospital name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Valid hospital email is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!phone || phone.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Valid phone number is required (min 10 digits)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!state || !district || !address) {
      return new Response(JSON.stringify({ error: "State, district and address are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!specializations || specializations.length === 0) {
      return new Response(JSON.stringify({ error: "At least one specialization is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!doctors || !Array.isArray(doctors) || doctors.length === 0) {
      return new Response(JSON.stringify({ error: "At least one doctor is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (let i = 0; i < doctors.length; i++) {
      const d = doctors[i];
      if (!d.doctor_name?.trim()) {
        return new Response(JSON.stringify({ error: `Doctor ${i + 1}: Name is required` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!d.specialization?.trim()) {
        return new Response(JSON.stringify({ error: `Doctor ${i + 1} (${d.doctor_name}): Specialization is required` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Save hospital with status = pending and link admin_user_id
    console.log("Creating hospital request:", hospital_name);
    const { data: hospital, error: hospError } = await supabaseAdmin.from("hospitals").insert({
      name: hospital_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      state, district,
      address: address.trim(),
      specializations,
      upi_qr_url: upi_qr_url || null,
      admin_user_id: admin_user_id || null,
      status: "pending",
    }).select().single();

    if (hospError) {
      console.error("Hospital insertion error:", hospError);
      if (hospError.message?.includes("duplicate")) {
        return new Response(JSON.stringify({ error: "A hospital with this email already exists" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to save hospital: " + hospError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hospitalId = hospital.id;
    console.log("Hospital created with ID:", hospitalId);

    // 2. Assign hospital_admin role to the user
    if (admin_user_id) {
      const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
        { user_id: admin_user_id, role: "hospital_admin" },
        { onConflict: "user_id,role" }
      );
      if (roleError) {
        console.error("Role assignment error:", roleError);
      } else {
        console.log("hospital_admin role assigned to user:", admin_user_id);
      }
    }

    // 3. Save doctors to doctors_request table
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
    }

    // 4. Also save to doctors table with status = pending
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
    return new Response(JSON.stringify({
      success: true,
      message: "Hospital request submitted successfully.",
      hospital_id: hospitalId,
      doctors_count: doctors.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Hospital request error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred: " + (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
