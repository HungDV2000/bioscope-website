"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sprout,
  Sparkles,
  Leaf,
  FlaskConical,
  HeartPulse,
  Pill,
  Baby,
  Dumbbell,
  Coffee,
  Bone,
} from "lucide-react";

const CATEGORIES = [
  { icon: Sprout, label: "Thực phẩm chức năng" },
  { icon: Sparkles, label: "Mỹ phẩm" },
  { icon: Leaf, label: "Dinh dưỡng" },
  { icon: FlaskConical, label: "Dược phẩm" },
  { icon: HeartPulse, label: "Tim mạch" },
  { icon: Pill, label: "Vitamin & Khoáng" },
  { icon: Baby, label: "Mẹ & Bé" },
  { icon: Dumbbell, label: "Thể thao" },
  { icon: Coffee, label: "Đồ uống" },
  { icon: Bone, label: "Xương khớp" },
];

const BRANDS = [
  "Healthy Care",
  "DHG PHARMA",
  "NUTRI home",
  "VINH GIA",
  "Traphaco",
  "Imexpharm",
  "Mediplantex",
  "Nature's Way",
  "Blackmores",
  "Pharmacity",
];

const CARD_H = "h-[116px]";
const track =
  "flex gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function useSlider() {
  const ref = useRef<HTMLDivElement>(null);
  const page = (dir: 1 | -1) => {
    const t = ref.current;
    if (!t) return;
    const first = t.firstElementChild as HTMLElement | null;
    if (!first) return;
    const gap = Number.parseFloat(getComputedStyle(t).gap || "0");
    t.scrollBy({ left: (first.offsetWidth + gap) * dir, behavior: "smooth" });
  };
  return { ref, page };
}

const navBtn =
  "flex shrink-0 items-center justify-center p-0.5 text-neutral-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

function Carousel({
  children,
  onPrev,
  onNext,
  trackRef,
  viewportClassName,
}: {
  children: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  trackRef: RefObject<HTMLDivElement>;
  viewportClassName?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <button type="button" onClick={onPrev} aria-label="Trước" className={navBtn}>
        <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      </button>

      <div
        className={`min-w-0 flex-1 overflow-hidden [container-type:inline-size] ${viewportClassName ?? ""}`}
      >
        <div ref={trackRef} className={track}>
          {children}
        </div>
      </div>

      <button type="button" onClick={onNext} aria-label="Sau" className={navBtn}>
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}

export function BrandsBand() {
  const cat = useSlider();
  const brand = useSlider();

  return (
    <section className="border-y border-neutral-100 bg-white py-8 lg:py-10">
      <div className="container-bs">
        <p className="text-center text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
          Đã đồng hành cùng hơn 50 thương hiệu
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-x-8">
          <Carousel
            trackRef={cat.ref}
            onPrev={() => cat.page(-1)}
            onNext={() => cat.page(1)}
            viewportClassName="rounded-[18px] border border-neutral-200 bg-white"
          >
            <div className="flex w-max shrink-0">
              {CATEGORIES.map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className={`flex ${CARD_H} w-[calc(100cqw/4)] shrink-0 flex-col items-center justify-center gap-2 px-2 text-center sm:px-3 ${
                    i > 0 ? "border-l border-neutral-200" : ""
                  }`}
                >
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.6} />
                  <span className="text-[12.5px] font-medium leading-snug text-neutral-700">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Carousel>

          <div
            className={`hidden ${CARD_H} w-px shrink-0 bg-neutral-200 lg:block`}
            aria-hidden
          />

          <Carousel
            trackRef={brand.ref}
            onPrev={() => brand.page(-1)}
            onNext={() => brand.page(1)}
          >
            {BRANDS.map((b) => (
              <div
                key={b}
                className={`flex ${CARD_H} w-[calc((100cqw-2.25rem)/4)] shrink-0 items-center justify-center rounded-[18px] border border-neutral-200 bg-white px-3 text-center font-heading text-[15px] font-bold text-neutral-600 sm:px-4`}
              >
                {b}
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
