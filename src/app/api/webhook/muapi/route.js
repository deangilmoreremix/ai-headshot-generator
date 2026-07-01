import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req) {
  const supabase = getServiceClient();
  try {
    const data = await req.json();
    const requestId = data.id;

    if (!requestId) {
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const { data: creation, error: fetchError } = await supabase
      .from("creations")
      .select()
      .eq("request_id", requestId)
      .single();

    if (fetchError || !creation) {
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("[MUAPI_WEBHOOK_ERROR]", fetchError);
      }
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (data.error && data.error !== "") {
      await supabase
        .from("creations")
        .update({ status: "failed", error: data.error })
        .eq("id", creation.id);
      return NextResponse.json({ success: true });
    }

    const outputs = data.outputs || [];
    const storedUrls = [];

    for (const url of outputs) {
      if (!url || typeof url !== "string") continue;

      try {
        const imageRes = await fetch(url);
        if (!imageRes.ok) {
          console.warn(`[MUAPI_WEBHOOK] Skipping unreachable image: ${url} (status ${imageRes.status})`);
          continue;
        }

        const blob = await imageRes.blob();
        const ext = url.split(".").pop()?.split("?")[0] || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(path, blob, {
            contentType: blob.type || `image/${ext}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("uploads")
          .getPublicUrl(path);

        storedUrls.push(publicData.publicUrl);
      } catch (err) {
        console.error("[MUAPI_WEBHOOK_IMAGE_UPLOAD_ERROR]", err);
      }
    }

    if (storedUrls.length === 0) {
      await supabase
        .from("creations")
        .update({ status: "failed", error: "No images could be retrieved from generation service" })
        .eq("id", creation.id);
      return NextResponse.json({ success: true, fallback: true });
    }

    await supabase
      .from("creations")
      .update({
        status: "completed",
        image_url: storedUrls,
        video_url: creation.type === "video" ? storedUrls : null,
        is_pack: true,
      })
      .eq("id", creation.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MUAPI_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
