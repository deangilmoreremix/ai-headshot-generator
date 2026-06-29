"use client";

import { useState } from "react";

const KEY = "ahs_anon_id";

function readOrCreateAnonymousId() {
  if (typeof window === "undefined") return null;
  let stored = window.localStorage.getItem(KEY);
  if (!stored) {
    stored =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(KEY, stored);
  }
  return stored;
}

export function useAnonymousId() {
  // Lazy initializer runs only on the client during hydration; on SSR it
  // returns null and components that need it simply no-op until hydrated.
  const [id] = useState(readOrCreateAnonymousId);
  return id;
}