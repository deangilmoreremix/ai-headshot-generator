"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRocket, FaBars, FaTimes } from "react-icons/fa";
import { SiVercel } from "react-icons/si";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "AI Headshot", href: "/" },
    { name: "My Creations", href: "/creations" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="h-20 border-b border-glass-border bg-glass-bg backdrop-blur-3xl sticky top-0 z-[100] px-4 md:px-12 flex items-center justify-between">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
          <FaRocket className="text-white text-lg" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-black text-xl tracking-tighter uppercase text-foreground">
            AI HeadShot
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-semibold tracking-tight transition-all relative py-2 ${
                isActive ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {link.name}
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Deploy button */}
      <div className="flex items-center gap-4">
        <a
          href="https://vercel.com/new/clone?repository-url=https://github.com/SamurAIGPT/ai-headshot-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-all font-bold text-[10px] tracking-widest uppercase shadow-lg shadow-slate-900/10"
        >
          <SiVercel className="text-xs" />
          Deploy
        </a>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden ml-2 p-2 text-muted hover:text-foreground transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 right-0 bg-[var(--solid-bg)]/90 backdrop-blur-2xl border-b border-glass-border rounded-b-lg shadow-2xl flex flex-col md:hidden z-50 p-4 gap-2"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-4 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-muted hover:bg-glass-bg"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}