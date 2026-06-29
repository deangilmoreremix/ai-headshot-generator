import { getServiceClient } from "@/lib/supabase";
import config from "@/lib/config";

export const AIService = {
  async generate(anonymousId, { image_url, category, aspect_ratio = "1:1" }) {
    if (!anonymousId) throw new Error("Missing anonymous id");

    const supabase = getServiceClient();

    // Look up the user's muapi key
    const { data: profile } = await supabase
      .from("profiles")
      .select("muapi_key")
      .eq("anonymous_id", anonymousId)
      .maybeSingle();

    const apiKey = profile?.muapi_key || config.ai.headshot.apiKey;
    if (!apiKey) {
      throw new Error(
        "No muapi.ai key found. Add yours in Settings, or set HEADSHOT_API_KEY in the server config."
      );
    }

    if (!image_url) throw new Error("image_url is required");
    if (!category) throw new Error("category is required");

    const webhookUrl = `${config.app.webhookUrl}/api/webhook/muapi`;
    const submitUrl = `${config.ai.headshot.endpoint}?webhook_url=${encodeURIComponent(webhookUrl)}`;

    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ image_url, category, aspect_ratio }),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const submitData = await submitRes.json();
    const requestId = submitData.request_id || submitData.id;
    if (!requestId) throw new Error("No request_id received from API");

    await supabase.from("creations").insert({
      user_id: anonymousId,
      category,
      aspect_ratio,
      request_id: requestId,
      status: "processing",
      is_pack: true,
    });

    return { request_id: requestId };
  },

  async checkStatus(requestId, anonymousId) {
    if (!requestId) return { status: "processing" };

    const supabase = getServiceClient();
    const { data: creation } = anonymousId
      ? await supabase
          .from("creations")
          .select("*")
          .eq("request_id", requestId)
          .eq("user_id", anonymousId)
          .maybeSingle()
      : { data: null };

    if (creation?.status === "completed") {
      try {
        const parsed = JSON.parse(creation.image_url || "[]");
        return { status: "completed", imageUrl: Array.isArray(parsed) ? parsed : [creation.image_url] };
      } catch (_) {
        return { status: "completed", imageUrl: creation.image_url };
      }
    }
    if (creation?.status === "failed") {
      throw new Error(creation.error || "Generation failed.");
    }
    return { status: "processing" };
  },
};