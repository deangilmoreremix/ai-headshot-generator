const config = {
  ai: {
    apiKey: process.env.MUAPI_API_KEY,
    endpoint: "https://api.muapi.ai/api/v1/photo-pack",
    videoEndpoint: "https://api.muapi.ai/api/v1/video-generations",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

const requiredKeys = [
  ["MUAPI_API_KEY", config.ai.apiKey],
  ["NEXT_PUBLIC_SUPABASE_URL", config.supabase.url],
];

if (typeof window === "undefined") {
  requiredKeys.forEach(([name, value]) => {
    if (!value) {
      console.warn(`[CONFIG] Warning: Missing critical environment variable: ${name}`);
    }
  });
}

export default config;
