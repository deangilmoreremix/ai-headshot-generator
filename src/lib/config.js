/**
 * Centralized configuration.
 * No authentication. Credits/billing removed.
 */

const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    webhookUrl:
      process.env.WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  ai: {
    headshot: {
      apiKey: process.env.HEADSHOT_API_KEY,
      endpoint: "https://api.muapi.ai/api/v1/photo-pack",
      uploadEndpoint: "https://api.muapi.ai/api/v1/upload",
      resultEndpoint: "https://api.muapi.ai/api/v1/predictions",
    },
  },
};

export default config;