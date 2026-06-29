import { NextResponse } from "next/server";
import { UserService } from "@/lib/services/user";

export const runtime = "nodejs";

// Pricing tiers in the UI map to free credit top-ups (no Stripe wired up).
// Body: { credits: number }
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const credits = parseInt(body.credits || "0", 10);
    if (!credits || credits <= 0) {
      return NextResponse.json({ error: "Invalid credits amount" }, { status: 400 });
    }
    const anonymousId = req.headers.get("x-anonymous-id");
    if (!anonymousId) {
      return NextResponse.json({ error: "Missing anonymous id" }, { status: 400 });
    }
    const user = await UserService.addCredits(anonymousId, credits);
    return NextResponse.json({ success: true, credits: user?.credits ?? null });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_STUB]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}