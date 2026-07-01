"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }) {
  const themes = ["light", "dark", "indigo", "emerald", "rose", "amber", "violet"];

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const theme = themes.includes(stored) ? stored : "indigo";

    if (theme === "dark") {
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.style.colorScheme = "light";
    }

    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return children;
}
