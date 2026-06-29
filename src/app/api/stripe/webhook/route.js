import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Stripe is not configured. This endpoint just acknowledges receipts.
export async function POST() {
  return NextResponse.json({ received: true });
}