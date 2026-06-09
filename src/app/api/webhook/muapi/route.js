import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req) {
  const supabase = getServiceClient();
  try {
    const data = await req.json();
    const requestId = data.id;

    if (!requestId) {
      console.error("[MUAPI_WEBHOOK_ERROR] Missing request id in payload", data);
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const { data: creation, error: fetchError } = await supabase
      .from('creations')
      .select()
      .eq('request_id', requestId)
      .single();

    if (fetchError) {
      // Check if it's a "not found" error
      if (fetchError.code !== 'PGRST116') {
        console.error("[MUAPI_WEBHOOK_ERROR]", fetchError);
      }
      console.warn(`[MUAPI_WEBHOOK] Creation with requestId ${requestId} not found.`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (!creation) {
      console.warn(`[MUAPI_WEBHOOK] Creation with requestId ${requestId} not found.`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (data.error && data.error !== "") {
      const { error: updateError } = await supabase
        .from('creations')
        .update({
          status: "failed",
          error: data.error
        })
        .eq('id', creation.id);
      
      if (updateError) console.error("[MUAPI_WEBHOOK_ERROR]", updateError);
      // Credits refund logic could go here if implemented
    } else {
      const outputs = data.outputs || [];
      const imageUrl = JSON.stringify(outputs);

      const { error: updateError } = await supabase
        .from('creations')
        .update({
          status: "completed",
          image_url: imageUrl,
          is_pack: true,
        })
        .eq('id', creation.id);
      
      if (updateError) console.error("[MUAPI_WEBHOOK_ERROR]", updateError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[MUAPI_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
