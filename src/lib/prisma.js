// Backwards-compatible export.
// Most code uses getServiceClient() directly from "./supabase".
// This module re-exports the same clients for legacy import paths.
import { getServiceClient, supabase as supabaseClient } from "./supabase";

export const prisma = getServiceClient();
export const getClient = () => getServiceClient();
export { supabaseClient, getServiceClient };