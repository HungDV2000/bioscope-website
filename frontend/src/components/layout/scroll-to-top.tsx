"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ScrollToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={locale === "vi" ? "Lên đầu trang" : "Back to top"}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-primary text-white shadow-[0_4px_20px_rgba(9,143,80,0.35)] transition-all duration-300 hover:bg-primary-dark hover:shadow-[0_6px_24px_rgba(9,143,80,0.45)]",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
