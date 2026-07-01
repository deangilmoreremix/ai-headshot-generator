import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return new NextResponse("No file provided", { status: 400 });

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const supabase = getServiceClient();
    const { data, error } = await supabase.storage.from("uploads").upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
