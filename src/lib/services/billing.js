// Billing is unused. Stripe is intentionally not wired up.
// This stub exists to satisfy imports if any.
export const BillingService = {
  async createCheckoutSession() {
    throw new Error("Billing is disabled");
  },
  async handleWebhook() {
    return { success: false };
  },
};