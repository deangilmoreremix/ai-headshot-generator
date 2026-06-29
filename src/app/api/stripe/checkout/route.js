import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Billing / Stripe has been removed. Users bring their own muapi.ai key in Settings.
export async function POST(req) {
  return NextResponse.json({ error: "Billing is disabled" }, { status: 410 });
}