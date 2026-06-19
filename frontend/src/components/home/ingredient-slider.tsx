"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export function IngredientSlider({
  title,
  viewAllHref,
  viewAllLabel,
  filterAside,
  children,
}: {
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
  filterAside: React.ReactNode;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    setCanPrev(t.scrollLeft > 4);
    setCanNext(t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    update();
    t.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      t.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (dir: 1 | -1) => {
    const t = trackRef.current;
    if (!t) return;
    t.scrollBy({ left: t.clientWidth * 0.95 * dir, behavior: "smooth" });
  };

  const navBtn = (enabled: boolean) =>
    `inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
      enabled
        ? "border-primary-border bg-white text-primary hover:bg-primary-50"
        : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300"
    }`;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-heading text-[25px] font-extrabold text-primary">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => page(-1)}
              disabled={!canPrev}
              aria-label="Previous products"
              className={navBtn(canPrev)}
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              disabled={!canNext}
              aria-label="Next products"
              className={navBtn(canNext)}
            >
              <ChevronRight className="h-[18px] w-[18px]" />
            </button>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
          >
            {viewAllLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid items-stretch gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        {filterAside}
        <div className="min-w-0">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-[18px] overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
