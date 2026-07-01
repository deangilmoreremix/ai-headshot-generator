"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaMagic, FaSun, FaMoon } from "react-icons/fa";

const themes = ["light", "dark", "indigo", "emerald", "rose", "amber", "violet"];
const themeIcons = {
  light: FaSun,
  dark: FaMoon,
  indigo: FaMagic,
  emerald: FaMagic,
  rose: FaMagic,
  amber: FaMagic,
  violet: FaMagic,
};

export default function Navbar() {
  const [theme, setTheme] = useState("indigo");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored && themes.includes(stored)) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
      document.documentElement.style.colorScheme = stored === "dark" ? "dark" : "light";
    }
  }, []);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme") || "indigo";
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];

    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next === "dark" ? "dark" : "light";
    localStorage.setItem("theme", next);
  };

  const ThemeIcon = themeIcons[theme] || FaMagic;

  return (
    <nav className="w-full border-b border-glass-border bg-glass-bg backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-foreground font-black tracking-tight uppercase text-sm">
          <FaMagic className="text-primary-500" />
          <span>AI Headshot Studio</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/creations" className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            My Creations
          </Link>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-glass-border bg-glass-bg text-foreground flex items-center justify-center hover:bg-glass-hover transition-all"
            aria-label="Toggle theme"
          >
            <ThemeIcon className="text-xs" />
          </button>
        </div>
      </div>
    </nav>
  );
}
