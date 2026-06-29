"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaKey, FaBolt } from "react-icons/fa";

export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/settings"), 0);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex-1 bg-transparent overflow-y-auto custom-scrollbar p-4 md:p-12 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-10 rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-3xl shadow-sm text-center space-y-6"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
          <FaKey className="text-2xl" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">
          Add Your API Key
        </h2>
        <p className="text-muted text-xs font-medium uppercase tracking-widest leading-loose">
          Generations are billed to your own muapi.ai account.
          Add your key in Settings to start creating.
        </p>
        <button
          onClick={() => router.push("/settings")}
          className="px-8 py-3 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg"
        >
          <FaBolt className="text-xs mr-2" />
          Go to Settings
        </button>
      </motion.div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}