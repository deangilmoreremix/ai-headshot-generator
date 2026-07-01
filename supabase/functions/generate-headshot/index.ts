import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_url, category, aspect_ratio = "1:1", type = "image", session_id } = await req.json();

    if (!image_url || !category) {
      return new Response(JSON.stringify({ error: "image_url and category are required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = Deno.env.get("MUAPI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "MUAPI_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/webhook/muapi`;

    const endpoint = type === "video"
      ? "https://api.muapi.ai/api/v1/video-generations"
      : "https://api.muapi.ai/api/v1/photo-pack";

    const body =
      type === "video"
        ? { image_url, category, prompt: category, webhook: webhookUrl }
        : { image_url, category, aspect_ratio, webhook: webhookUrl };

    const muapiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(body),
    });

    if (!muapiRes.ok) {
      const errorText = await muapiRes.text();
      throw new Error(`MUAPI error ${muapiRes.status}: ${errorText}`);
    }

    const muapiData = await muapiRes.json();
    const request_id = muapiData.request_id || muapiData.id;
    if (!request_id) {
      throw new Error("No request_id received from MUAPI");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userId = session_id || "default";

    const { error } = await supabase.from("creations").insert({
      user_id: userId,
      category,
      aspect_ratio,
      request_id,
      status: "processing",
      type,
      image_url: null,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ request_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
