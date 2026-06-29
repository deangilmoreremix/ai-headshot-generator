import { getServiceClient } from "@/lib/supabase";

/**
 * Service to manage anonymous users and credits in Supabase.
 * There is NO authentication — users are identified by a random
 * anonymous_id stored in the browser's localStorage.
 */

const ANON_KEY = "ahs_anon_id";

export function getAnonymousId(req) {
  if (typeof window !== "undefined") {
    let id = window.localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(ANON_KEY, id);
    }
    return id;
  }
  // Server-side: caller must pass anonymous id explicitly.
  return null;
}

async function ensureUser(supabase, anonymousId) {
  // Try to fetch existing
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, credits, anonymous_id")
    .eq("anonymous_id", anonymousId)
    .maybeSingle();

  if (existing) return existing;

  // Create new
  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ anonymous_id: anonymousId, credits: 60 })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export const UserService = {
  /**
   * Get the credits for an anonymous user. Auto-creates the user if missing.
   */
  async getCredits(anonymousId) {
    if (!anonymousId) return 0;
    const supabase = getServiceClient();
    const user = await ensureUser(supabase, anonymousId);
    return user.credits || 0;
  },

  /**
   * Add credits to an anonymous user.
   */
  async addCredits(anonymousId, amount) {
    if (!anonymousId || !amount) return null;
    const supabase = getServiceClient();
    await ensureUser(supabase, anonymousId);
    const { data, error } = await supabase.rpc("increment_user_credits", {
      anon_id: anonymousId,
      delta: amount,
    });
    if (error) {
      // Fallback to read-then-write if RPC is missing
      const user = await ensureUser(supabase, anonymousId);
      const { data: updated, error: e2 } = await supabase
        .from("profiles")
        .update({ credits: (user.credits || 0) + amount })
        .eq("anonymous_id", anonymousId)
        .select()
        .single();
      if (e2) throw e2;
      return updated;
    }
    return data;
  },

  /**
   * Deduct credits from an anonymous user. Throws on insufficient balance.
   */
  async deductCredits(anonymousId, amount = 1) {
    if (!anonymousId) throw new Error("Missing anonymous id");
    const supabase = getServiceClient();
    const user = await ensureUser(supabase, anonymousId);
    if ((user.credits || 0) < amount) {
      throw new Error("Insufficient credits");
    }
    const { data, error } = await supabase
      .from("profiles")
      .update({ credits: (user.credits || 0) - amount })
      .eq("anonymous_id", anonymousId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Return the user's current state, creating one if missing.
   */
  async getOrCreate(anonymousId) {
    if (!anonymousId) return null;
    const supabase = getServiceClient();
    return await ensureUser(supabase, anonymousId);
  },
};