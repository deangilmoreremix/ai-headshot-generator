"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaKey, FaTrash, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAnonymousId } from "@/hooks/useAnonymousId";

export default function SettingsPage() {
  const anonymousId = useAnonymousId();
  const [key, setKey] = useState("");
  const [storedKey, setStoredKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!anonymousId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings", {
          headers: { "x-anonymous-id": anonymousId },
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setStoredKey(data.muapi_key || null);
        }
      } catch (_) { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [anonymousId]);

  const saveKey = async () => {
    if (!anonymousId) return;
    setStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-anonymous-id": anonymousId,
        },
        body: JSON.stringify({ muapi_key: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setStoredKey(data.muapi_key);
      setKey("");
      setStatus({ type: "success", text: "API key saved." });
    } catch (e) {
      setStatus({ type: "error", text: e.message });
    }
  };

  const deleteKey = async () => {
    if (!anonymousId) return;
    setStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "DELETE",
        headers: { "x-anonymous-id": anonymousId },
      });
      if (!res.ok) throw new Error("Delete failed");
      setStoredKey(null);
      setKey("");
      setStatus({ type: "success", text: "API key removed." });
    } catch (e) {
      setStatus({ type: "error", text: e.message });
    }
  };

  return (
    <div className="flex-1 bg-transparent overflow-y-auto custom-scrollbar p-4 md:p-12">
      <header className="max-w-2xl mx-auto mb-10 space-y-3 pt-4 md:pt-0">
        <div className="flex items-center gap-3 text-primary-500 mb-1">
          <FaKey className="text-sm" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">
            Configuration
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted font-medium text-xs uppercase tracking-widest leading-loose max-w-xl">
          Provide your own muapi.ai API key. All generations are billed to your account directly.
          Your key is stored securely and never shared.
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground">
              muapi.ai API Key
            </label>
            <p className="text-muted text-[10px] uppercase tracking-widest leading-relaxed">
              Get yours at{" "}
              <a
                href="https://muapi.ai/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-primary-500 underline"
              >
                muapi.ai/dashboard
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={storedKey || key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={storedKey ? "••••••••••••••••" : "sk-..."}
                readOnly={!!storedKey}
                className={`w-full bg-glass-bg border border-glass-border rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-primary-500/50 text-foreground ${storedKey ? "opacity-60" : ""}`}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                type="button"
              >
                {showKey ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
              </button>
            </div>
            {storedKey ? (
              <button
                onClick={deleteKey}
                className="px-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all"
              >
                <FaTrash className="text-xs" />
              </button>
            ) : (
              <button
                onClick={saveKey}
                disabled={!key || key.length === 0}
                className="px-6 rounded-xl bg-primary-500 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-600 disabled:opacity-40 transition-all"
              >
                <FaCheck className="text-xs" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  status.type === "success"
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {status.text}
              </motion.div>
            )}
          </AnimatePresence>

          {!storedKey && (
            <div className="p-4 rounded-xl border border-glass-border bg-glass-bg/40 text-[10px] text-muted uppercase tracking-widest leading-relaxed">
              You must save a muapi.ai key before generating headshots. Generations will be billed to your muapi account.
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}