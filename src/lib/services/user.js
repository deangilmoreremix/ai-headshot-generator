import { getServiceClient } from "@/lib/supabase";

const ANON_KEY = "ahs_anon_id";

export function getAnonymousId() {
  if (typeof window === "undefined") return null;
  let id = window.localStorage.getItem(ANON_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

async function ensureProfile(supabase, anonymousId) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("anonymous_id", anonymousId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ anonymous_id: anonymousId })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function getProfile(anonymousId) {
  if (!anonymousId) return null;
  const supabase = getServiceClient();
  return await ensureProfile(supabase, anonymousId);
}

export async function setMuApiKey(anonymousId, muapiKey) {
  if (!anonymousId) return null;
  const supabase = getServiceClient();
  await ensureProfile(supabase, anonymousId);
  const { data, error } = await supabase
    .from("profiles")
    .update({ muapi_key: muapiKey })
    .eq("anonymous_id", anonymousId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMuApiKey(anonymousId) {
  if (!anonymousId) return null;
  const supabase = getServiceClient();
  const profile = await getProfile(anonymousId);
  return profile?.muapi_key || null;
}

export async function deleteProfile(anonymousId) {
  if (!anonymousId) return;
  const supabase = getServiceClient();
  await supabase.from("profiles").delete().eq("anonymous_id", anonymousId);
}