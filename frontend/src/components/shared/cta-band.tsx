import { ArrowRight, Phone } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export function CtaBand({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="container-bs">
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient px-8 py-14 text-center sm:px-16 sm:py-20">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="relative mx-auto max-w-2xl text-white">
          <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">
            {locale === "vi"
              ? "Sẵn sàng phát triển sản phẩm tiếp theo của bạn?"
              : "Ready to develop your next product?"}
          </h2>
          <p className="mt-4 text-base text-white/85 sm:text-lg">
            {locale === "vi"
              ? "Đội ngũ chuyên gia Bioscope sẵn sàng tư vấn nguyên liệu và giải pháp công thức phù hợp nhất cho doanh nghiệp của bạn."
              : "Bioscope experts are ready to advise on the best ingredients and formulation solutions for your business."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href={`/${locale}/lien-he`} variant="white" size="lg">
              {t.cta.contact}
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink
              href="tel:+842839999999"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              <Phone className="h-5 w-5" />
              +84 28 3999 9999
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
