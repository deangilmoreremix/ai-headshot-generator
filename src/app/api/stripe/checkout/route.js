import { NextResponse } from "next/server";
import { BillingService } from "@/lib/services/billing";

export async function POST(req) {
  try {
    // No auth required - public endpoint
    const { price, credits } = await req.json();
    
    // Use a default/guest user for unauthenticated requests
    const guestUserId = "guest";
    const checkoutUrl = await BillingService.createCheckoutSession(
      guestUserId, 
      price, 
      credits
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}