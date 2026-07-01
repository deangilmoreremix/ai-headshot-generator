import { getServiceClient } from "@/lib/supabase";
import config from "@/lib/config";

export const AIService = {
  getCreditCost() {
    return 0;
  },

  async generate(sessionId, { image_url, category, aspect_ratio = "1:1", type = "image" }) {
    const supabase = getServiceClient();

    const { data, error } = await supabase.functions.invoke("generate-headshot", {
      body: { image_url, category, aspect_ratio, type, session_id: sessionId },
    });

    if (error) {
      const message = error.message || "Edge function invocation failed";
      throw new Error(message);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return { request_id: data.request_id };
  },

  async checkStatus(requestId) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("creations")
      .select("*")
      .eq("request_id", requestId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return { status: "processing" };

    if (data.status === "completed") {
      let imageUrl = data.image_url;
      try {
        imageUrl = JSON.parse(imageUrl);
      } catch (e) {}
      return { status: "completed", imageUrl };
    }

    if (data.status === "failed") {
      throw new Error(data.error || "Generation failed");
    }

    return { status: "processing" };
  },
};
