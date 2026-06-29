"use client";

import { useEffect, useState, useCallback } from "react";
import { useAnonymousId } from "@/hooks/useAnonymousId";

export function useCredits() {
  const anonymousId = useAnonymousId();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!anonymousId) return;
    try {
      setLoading(true);
      const res = await fetch("/api/credits", {
        headers: { "x-anonymous-id": anonymousId },
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) setCredits(data.credits || 0);
    } catch (e) {
      console.warn("useCredits refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, [anonymousId]);

  useEffect(() => {
    if (!anonymousId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/credits", {
          headers: { "x-anonymous-id": anonymousId },
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && res.ok) setCredits(data.credits || 0);
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [anonymousId]);

  return { credits, loading, refresh, anonymousId };
}