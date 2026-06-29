// Stripe is not configured in this deployment. The pricing page
// provides a no-cost credit-top-up option that adds credits directly.
import { UserService } from "./services/user";

export const stripe = null;

export const BillingServiceLocal = {
  async topUp(anonymousId, credits) {
    return await UserService.addCredits(anonymousId, credits);
  },
};