import { NextResponse } from "next/server";
import { UserService } from "@/lib/services/user";

export const runtime = "nodejs";

// Returns the current anonymous user's credit balance (creating the
// user record on first call).
export async function GET(req) {
  try {
    const anonymousId = req.headers.get("x-anonymous-id");
    if (!anonymousId) {
      return NextResponse.json({ credits: 0, anonymousId: null });
    }
    const user = await UserService.getOrCreate(anonymousId);
    return NextResponse.json({ credits: user.credits || 0, anonymousId });
  } catch (error) {
    console.error("[CREDITS_GET]", error);
    return NextResponse.json({ error: "Failed to load credits" }, { status: 500 });
  }
}