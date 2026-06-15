import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { company } from "@/lib/company";
import { ButtonLink } from "@/components/ui/button";

const CTA_BG =
  "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=80";

export function CtaBand({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const isVi = locale === "vi";

  return (
    <section className="container-bs">
      <div className="relative min-h-[280px] overflow-hidden rounded-2xl sm:min-h-[300px]">
        <Image
          src={CTA_BG}
          alt=""
          fill
          sizes="(max-width: 1320px) 100vw, 1320px"
          className="object-cover"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary-deep/95 via-primary-deep/88 to-primary-dark/75"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,rgba(15,174,115,0.2),transparent)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-grid [background-size:40px_40px] opacity-[0.06]"
          aria-hidden
        />

        <div className="relative flex h-full items-center px-6 py-12 sm:px-12 sm:py-14 lg:px-16">
          <div className="max-w-xl">
            <span className="lab-label lab-label--invert">
              {isVi ? "Bắt đầu hợp tác" : "Start a partnership"}
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold leading-tight text-white text-balance sm:text-[1.75rem]">
              {isVi
                ? "Sẵn sàng phát triển sản phẩm tiếp theo của bạn?"
                : "Ready to develop your next product?"}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-[15px]">
              {isVi
                ? "Đội ngũ chuyên gia Bioscope tư vấn nguyên liệu và giải pháp công thức phù hợp nhất cho doanh nghiệp của bạn."
                : "Bioscope experts advise on the best ingredients and formulation solutions for your business."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={`/${locale}/lien-he`} variant="white" size="md">
                {t.cta.contact}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href={company.hotlineHref}
                variant="outline"
                size="md"
                className="border-white/30 text-white hover:border-white/50 hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                {company.hotline}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
