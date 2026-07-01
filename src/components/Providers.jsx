"use client";

import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
