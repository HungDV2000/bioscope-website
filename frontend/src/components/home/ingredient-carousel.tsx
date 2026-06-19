"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function IngredientCarousel({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const page = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.95;
    if (dir === 1) {
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
    }
    track.scrollBy({ left: amount * dir, behavior: "smooth" });
  };

  const btn =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-card transition-colors hover:border-primary-border hover:text-primary md:flex";

  return (
    <div className="relative min-w-0">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-[18px] overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="Previous products"
        className={`${btn} -left-3`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label="Next products"
        className={`${btn} -right-3`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
