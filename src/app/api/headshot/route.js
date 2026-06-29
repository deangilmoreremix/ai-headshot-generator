import { NextResponse } from "next/server";
import { AIService } from "@/lib/services/ai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { image_url, category, aspect_ratio } = body;

    if (!image_url) {
      return NextResponse.json({ error: "Reference image is required" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Get the anonymous id from the request header. If missing, we still
    // proceed but credit accounting will fail with a clear error.
    const anonymousId = req.headers.get("x-anonymous-id");

    const result = await AIService.generate(anonymousId, {
      image_url,
      category,
      aspect_ratio: aspect_ratio || "1:1",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[HEADSHOT_API_ERROR]", error);
    const status = error.message?.includes("Insufficient credits") ? 402 : 500;
    return NextResponse.json({ error: error.message || "Internal Error" }, { status });
  }
}