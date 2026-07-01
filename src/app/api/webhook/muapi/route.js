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

    if (fetchError) {
      if (fetchError.code !== "PGRST116") {
        console.error("[MUAPI_WEBHOOK_ERROR]", fetchError);
      }
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (!creation) {
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
      try {
        const imageRes = await fetch(url);
        if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`);

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
        storedUrls.push(url);
      }
    }

    const imageUrl = JSON.stringify(storedUrls);

    await supabase
      .from("creations")
      .update({
        status: "completed",
        image_url: imageUrl,
        video_url: creation.type === "video" ? imageUrl : null,
        is_pack: true,
      })
      .eq("id", creation.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MUAPI_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
