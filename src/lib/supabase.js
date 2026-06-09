export const supabase = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (typeof window === 'undefined') {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return null;
  }
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key, { auth: { persistSession: false } });
})();

export const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key, { auth: { persistSession: false } });
};
