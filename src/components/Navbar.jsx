"use client";
import Link from "next/link";
import { FaMagic } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-glass-border bg-glass-bg backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground font-black tracking-tight uppercase text-sm">
          <FaMagic className="text-primary-500" />
          <span>AI Headshot Studio</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/creations" className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            My Creations
          </Link>
        </div>
      </div>
    </nav>
  );
}
