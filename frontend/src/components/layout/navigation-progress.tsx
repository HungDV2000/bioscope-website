"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Thanh tiến trình khi chuyển trang — phản hồi ngay lúc click */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [complete, setComplete] = useState(true);

  useEffect(() => {
    setVisible(false);
    setComplete(true);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor?.href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      setVisible(true);
      setComplete(false);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!visible && complete) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 bg-primary/15"
      aria-hidden
    >
      <div
        className={cn(
          "h-full bg-primary transition-all duration-500 ease-out",
          complete ? "w-full opacity-0" : "w-[70%] opacity-100",
        )}
      />
    </div>
  );
}
