// Stripe / billing is completely removed in this version.
// The pricing -> settings flow handles credit top-ups via the user's own muapi.ai key.
export const stripe = null;

export const BillingServiceLocal = {
  async topUp() {
    throw new Error("Billing is removed");
  },
};