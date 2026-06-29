import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

// muapi.ai webhook handler. Accepts payloads of either shape:
//   { id, status, outputs: [...] } or { request_id, status, outputs: [...] }
export async function POST(req) {
  const supabase = getServiceClient();
  try {
    const data = await req.json();
    const requestId = data.id || data.request_id;

    if (!requestId) {
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const { data: creation } = await supabase
      .from("creations")
      .select("*")
      .eq("request_id", requestId)
      .maybeSingle();

    if (!creation) {
      console.warn(`[MUAPI_WEBHOOK] Creation with requestId ${requestId} not found.`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    const status = (data.status || "").toLowerCase();
    const hasError = data.error && data.error !== "";

    if (hasError || status === "failed" || status === "error") {
      const errorMsg = data.error || "Generation failed";
      await supabase
        .from("creations")
        .update({ status: "failed", error: errorMsg })
        .eq("id", creation.id);

      // Refund credits if the user has any.
      if (creation.user_id) {
        try {
          await supabase.rpc("increment_user_credits", {
            anon_id: creation.user_id,
            delta: 60,
          });
        } catch (_) {
          const { data: u } = await supabase
            .from("profiles")
            .select("credits")
            .eq("anonymous_id", creation.user_id)
            .maybeSingle();
          if (u) {
            await supabase
              .from("profiles")
              .update({ credits: (u.credits || 0) + 60 })
              .eq("anonymous_id", creation.user_id);
          }
        }
      }
    } else if (status === "completed" || status === "succeeded" || status === "success") {
      const outputs = data.outputs || data.output || [];
      const urls = Array.isArray(outputs) ? outputs : [outputs];
      const imageUrl = JSON.stringify(urls);
      await supabase
        .from("creations")
        .update({
          status: "completed",
          image_url: imageUrl,
          is_pack: urls.length > 1,
        })
        .eq("id", creation.id);
    } else {
      // Keep status as processing but refresh updated_at
      await supabase
        .from("creations")
        .update({ status: "processing" })
        .eq("id", creation.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MUAPI_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}