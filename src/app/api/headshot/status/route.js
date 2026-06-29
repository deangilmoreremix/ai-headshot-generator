import { NextResponse } from "next/server";
import { AIService } from "@/lib/services/ai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { requestId } = body;
    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    const anonymousId = req.headers.get("x-anonymous-id");
    const result = await AIService.checkStatus(requestId, anonymousId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[HEADSHOT_STATUS_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}