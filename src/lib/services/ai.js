import { getServiceClient } from "@/lib/supabase";
import { UserService } from "./user";
import config from "@/lib/config";

/**
 * Service to manage AI Headshot Studio generations using muapi.ai.
 * All generations persist to Supabase and credit deductions are
 * tracked per anonymous user.
 */
export const AIService = {
  getCreditCost() {
    return config.credits.headshotCost;
  },

  /**
   * Submit a headshot generation request to muapi.ai and persist
   * the creation record to Supabase.
   */
  async generate(anonymousId, { image_url, category, aspect_ratio = "1:1" }) {
    if (!anonymousId) throw new Error("Missing anonymous id");
    if (!image_url) throw new Error("image_url is required");
    if (!category) throw new Error("category is required");

    const cost = this.getCreditCost();
    await UserService.deductCredits(anonymousId, cost);

    const apiKey = config.ai.headshot.apiKey;
    if (!apiKey) throw new Error("HEADSHOT_API_KEY is not configured");

    const webhookUrl = `${config.app.webhookUrl}/api/webhook/muapi`;
    const submitUrl = `${config.ai.headshot.endpoint}?webhook_url=${encodeURIComponent(webhookUrl)}`;

    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        image_url,
        category,
        aspect_ratio,
      }),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      // Refund credits on failure
      try { await UserService.addCredits(anonymousId, cost); } catch (_) {}
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const submitData = await submitRes.json();
    const requestId = submitData.request_id || submitData.id;
    if (!requestId) {
      try { await UserService.addCredits(anonymousId, cost); } catch (_) {}
      throw new Error("No request_id received from API");
    }

    const supabase = getServiceClient();
    const { error: insertErr } = await supabase.from("creations").insert({
      user_id: anonymousId,
      category,
      aspect_ratio,
      request_id: requestId,
      status: "processing",
      is_pack: true,
    });
    if (insertErr) {
      console.error("[AI_SERVICE] insert error", insertErr);
    }

    return { request_id: requestId };
  },

  /**
   * Poll muapi.ai for the status of a generation request and update
   * the corresponding Supabase record. Falls back to the DB if the
   * upstream call fails so the UI can render whatever state exists.
   */
  async checkStatus(requestId, anonymousId) {
    if (!requestId) return { status: "processing" };

    const apiKey = config.ai.headshot.apiKey;
    const supabase = getServiceClient();

    let statusData = null;
    if (apiKey) {
      try {
        const statusUrl = `${config.ai.headshot.resultEndpoint}/${requestId}/result`;
        const statusRes = await fetch(statusUrl, { headers: { "x-api-key": apiKey } });
        if (statusRes.ok) {
          statusData = await statusRes.json();
        }
      } catch (e) {
        console.warn("[AI_SERVICE] upstream status failed", e.message);
      }
    }

    let creation = null;
    if (anonymousId) {
      const { data } = await supabase
        .from("creations")
        .select("*")
        .eq("request_id", requestId)
        .eq("user_id", anonymousId)
        .maybeSingle();
      creation = data;
    } else {
      const { data } = await supabase
        .from("creations")
        .select("*")
        .eq("request_id", requestId)
        .maybeSingle();
      creation = data;
    }

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

    if (statusData) {
      const status = (statusData.status || "").toLowerCase();
      if (status === "completed" || status === "succeeded" || status === "success") {
        const imageUrl = statusData.outputs?.[0] || statusData.url || statusData.output?.url;
        if (imageUrl) {
          await supabase
            .from("creations")
            .update({ status: "completed", image_url: imageUrl })
            .eq("request_id", requestId);
          return { status: "completed", imageUrl };
        }
      } else if (status === "failed" || status === "error") {
        const errorMsg = statusData.error || "Generation failed";
        await supabase
          .from("creations")
          .update({ status: "failed", error: errorMsg })
          .eq("request_id", requestId);
        throw new Error(errorMsg);
      }
    }

    return { status: "processing" };
  },
};