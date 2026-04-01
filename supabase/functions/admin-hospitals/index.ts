import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_PRIVATE_KEY = Deno.env.get("ADMIN_PRIVATE_KEY") ?? "1234";
const UPSTREAM_UNAVAILABLE_MESSAGE = "Backend temporarily unavailable. Please retry in a minute.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const slotTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

const isRetriableStatus = (status: number) => status === 521 || status === 520 || status === 522 || status === 523 || status === 524 || status >= 500;

const hasCloudflare521Error = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("Error code 521") || message.includes("Web server is down");
};

function createResilientFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const maxAttempts = 3;
    let lastResponse: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(input, init);

        if (!isRetriableStatus(response.status) || attempt === maxAttempts) {
          return response;
        }

        lastResponse = response;
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) {
          throw error;
        }
      }

      await sleep(250 * attempt);
    }

    if (lastResponse) return lastResponse;
    throw lastError ?? new Error("Unknown upstream error");
  };
}

function createAdminClient() {
  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/+$/, "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing backend configuration for admin operations.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    global: {
      fetch: createResilientFetch(),
    },
  });
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

    const supabaseAdmin = createAdminClient();

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("hospitals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ hospitals: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_doctors_request" && hospitalId) {
      const { data, error } = await supabaseAdmin
        .from("doctors_request")
        .select("*")
        .eq("hospital_id", hospitalId);

      if (error) throw error;

      return new Response(JSON.stringify({ doctors: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_status" && hospitalId && status) {
      const { error } = await supabaseAdmin.from("hospitals").update({ status }).eq("id", hospitalId);
      if (error) throw error;

      if (status === "approved") {
        const { data: requestedDoctors, error: requestedDoctorsError } = await supabaseAdmin
          .from("doctors_request")
          .select("*")
          .eq("hospital_id", hospitalId);

        if (requestedDoctorsError) throw requestedDoctorsError;

        if (requestedDoctors && requestedDoctors.length > 0) {
          const newDoctors = requestedDoctors.map((rd: any) => ({
            name: rd.doctor_name,
            specialization: Array.isArray(rd.specialization) ? rd.specialization : [rd.specialization],
            hospital_id: hospitalId,
            experience: parseInt(rd.experience) || 0,
            education_details: rd.education || "",
            email: rd.email || "",
            phone: rd.phone || "",
            age: parseInt(rd.age) || 0,
            status: "active",
          }));

          const { data: created, error: docErr } = await supabaseAdmin.from("doctors").insert(newDoctors).select();

          if (docErr) {
            console.error("Error moving doctors:", docErr);
          } else if (created) {
            const allSlots = created.flatMap((doc: any) => generateSlots(doc.id));
            if (allSlots.length > 0) {
              const { error: slotErr } = await supabaseAdmin.from("time_slots").insert(allSlots);
              if (slotErr) console.error("Error creating slots:", slotErr);
            }

            for (const doc of created) {
              const code = `DOC-${doc.id.substring(0, 8).toUpperCase()}`;
              await supabaseAdmin.from("doctor_access_codes").insert({
                doctor_id: doc.id,
                access_code: code,
              });
            }
          }
        }

        await supabaseAdmin.from("doctors").update({ status: "active" }).eq("hospital_id", hospitalId);

        const { data: allDoctors, error: allDoctorsError } = await supabaseAdmin
          .from("doctors")
          .select("id")
          .eq("hospital_id", hospitalId)
          .eq("status", "active");

        if (allDoctorsError) throw allDoctorsError;

        for (const doc of allDoctors || []) {
          const { data: existingSlots } = await supabaseAdmin
            .from("time_slots")
            .select("id")
            .eq("doctor_id", doc.id)
            .limit(1);

          if (!existingSlots || existingSlots.length === 0) {
            const slots = generateSlots(doc.id);
            await supabaseAdmin.from("time_slots").insert(slots);
          }

          const { data: existingCode } = await supabaseAdmin
            .from("doctor_access_codes")
            .select("id")
            .eq("doctor_id", doc.id)
            .limit(1);

          if (!existingCode || existingCode.length === 0) {
            const code = `DOC-${doc.id.substring(0, 8).toUpperCase()}`;
            await supabaseAdmin.from("doctor_access_codes").insert({
              doctor_id: doc.id,
              access_code: code,
            });
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
  } catch (error) {
    const isUpstreamUnavailable = hasCloudflare521Error(error);
    const message = isUpstreamUnavailable
      ? UPSTREAM_UNAVAILABLE_MESSAGE
      : (error instanceof Error ? error.message : "Unexpected error");

    console.error("Admin hospitals error:", error);

    return new Response(JSON.stringify({ error: message }), {
      status: isUpstreamUnavailable ? 503 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
