import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req) {
  const supabase = getServiceClient();
  try {
    const anonymousId = req.headers.get("x-anonymous-id");
    let query = supabase
      .from("creations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (anonymousId) {
      query = query.eq("user_id", anonymousId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Fetch creations error:", error);
    return NextResponse.json({ error: "Failed to fetch creations" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const supabase = getServiceClient();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const { error } = await supabase.from("creations").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete creation error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}