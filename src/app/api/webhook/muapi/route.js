import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

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