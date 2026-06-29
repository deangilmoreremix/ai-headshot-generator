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

    // Optional URL input (passthrough)
    const url = formData.get("url");
    if (url && typeof url === "string" && url.length > 0) {
      return NextResponse.json({ url });
    }

    const apiKey = config.ai.headshot.apiKey;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
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

    // Log the upload in Supabase (best effort)
    try {
      const supabase = getServiceClient();
      await supabase.from("uploads").insert({
        file_url: fileUrl,
        metadata: { size: file.size, type: file.type },
      });
    } catch (e) {
      console.warn("[UPLOAD_LOG] could not log to supabase", e.message);
    }

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}