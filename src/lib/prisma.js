// Re-export Supabase client as 'prisma' for backward compatibility
// This allows gradual migration without breaking existing imports
import { supabase as supabaseClient, getServiceClient } from "./supabase";

export const prisma = getServiceClient();

export const getClient = () => prisma;

// Also export supabase-specific clients for new code
export { supabaseClient, getServiceClient };