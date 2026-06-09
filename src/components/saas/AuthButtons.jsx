"use client";

// No-op auth buttons - authentication removed
// These components are kept for backward compatibility but do nothing

export function LoginButton({ className }) {
  return (
    <button
      disabled
      className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-950/50 text-white/50 rounded-full font-semibold overflow-hidden transition-all cursor-not-allowed ${className}`}
    >
      Authentication Disabled
    </button>
  );
}

export function SignOutButton({ className }) {
  return (
    <button
      disabled
      className={`text-zinc-400/50 cursor-not-allowed ${className}`}
    >
      —
    </button>
  );
}