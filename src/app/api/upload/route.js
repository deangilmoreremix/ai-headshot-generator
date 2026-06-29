import { NextResponse } from "next/server";
import config from "@/lib/config";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Passthrough URL input (optional)
    const url = formData.get("url");
    if (url && typeof url === "string" && url.length > 0) {
      return NextResponse.json({ url });
    }

    // Try per-user key first (from header -> profiles), then env fallback
    const anonymousId = req.headers.get("x-anonymous-id");
    let apiKey = config.ai.headshot.apiKey;
    if (anonymousId) {
      const supabase = getServiceClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("muapi_key")
        .eq("anonymous_id", anonymousId)
        .maybeSingle();
      if (profile?.muapi_key) apiKey = profile.muapi_key;
    }

    if (!apiKey) {
      return NextResponse.json({ error: "No muapi.ai API key configured" }, { status: 500 });
    }

    const muapiForm = new FormData();
    muapiForm.append("file", file);

    const response = await fetch(config.ai.headshot.uploadEndpoint, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: muapiForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MuAPI Upload Failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const fileUrl = data.url || data.file_url || data.image_url;
    if (!fileUrl) {
      throw new Error("Upload succeeded but no URL returned");
    }

    try {
      await getServiceClient().from("uploads").insert({
        file_url: fileUrl,
        metadata: { size: file.size, type: file.type },
      });
    } catch (_) { /* non-fatal */ }

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}