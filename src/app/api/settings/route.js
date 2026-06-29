import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req) {
  const supabase = getServiceClient();
  const anonymousId = req.headers.get("x-anonymous-id");
  if (!anonymousId) {
    return NextResponse.json({ muapi_key: null });
  }
  const { data } = await supabase
    .from("profiles")
    .select("muapi_key")
    .eq("anonymous_id", anonymousId)
    .maybeSingle();

  return NextResponse.json({ muapi_key: data?.muapi_key || null });
}

export async function POST(req) {
  const supabase = getServiceClient();
  try {
    const body = await req.json();
    const { muapi_key } = body;
    const anonymousId = req.headers.get("x-anonymous-id");
    if (!anonymousId) {
      return NextResponse.json({ error: "Missing anonymous id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ anonymous_id: anonymousId, muapi_key: muapi_key || null }, { onConflict: "anonymous_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, muapi_key: data.muapi_key });
  } catch (error) {
    console.error("[SETTINGS_API]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const supabase = getServiceClient();
  const anonymousId = req.headers.get("x-anonymous-id");
  if (!anonymousId) {
    return NextResponse.json({ error: "Missing anonymous id" }, { status: 400 });
  }
  await supabase
    .from("profiles")
    .update({ muapi_key: null })
    .eq("anonymous_id", anonymousId);
  return NextResponse.json({ success: true });
}