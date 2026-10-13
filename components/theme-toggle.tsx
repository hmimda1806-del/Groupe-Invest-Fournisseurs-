"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("pdf-insight-theme") as
      | "dark"
      | "light"
      | null;
    const nextTheme = stored ?? "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  function toggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("pdf-insight-theme", nextTheme);
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-foreground/76 transition hover:scale-[1.03] hover:bg-white/12"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
    </button>
  );
}
