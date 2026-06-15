import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { certifications } from "@/lib/data";
import { pick } from "@/lib/utils";

export function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const p = (path: string) => `/${locale}${path}`;

  const copy =
    locale === "vi"
      ? {
          badge: "Nguyên liệu cao cấp · Công nghệ độc quyền",
          title: "Nâng tầm công thức,",
          titleAccent: "kiến tạo sản phẩm dẫn đầu",
          desc: "Bioscope Việt Nam đồng hành cùng doanh nghiệp Dược phẩm, Thực phẩm chức năng và Mỹ phẩm — từ nguyên liệu nhập khẩu chuẩn hóa đến giải pháp công thức ODM ứng dụng công nghệ nano độc quyền.",
        }
      : {
          badge: "Premium ingredients · Proprietary technology",
          title: "Elevate your formulas,",
          titleAccent: "build market-leading products",
          desc: "Bioscope Vietnam partners with Pharmaceutical, Dietary Supplement and Cosmetic companies — from standardised imported ingredients to ODM formulation solutions powered by proprietary nano technology.",
        };

  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 bg-mesh opacity-70" />
      <div className="absolute -right-24 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full border border-white/10 opacity-40 animate-spin-slow" />
      <div className="absolute -right-10 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-white/10 opacity-30" />

      <div className="container-bs relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div className="text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {copy.badge}
          </span>
          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.1] text-balance sm:text-5xl lg:text-6xl">
            {copy.title}
            <span className="block text-accent">{copy.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {copy.desc}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href={p("/nguyen-lieu")} variant="white" size="lg">
              {t.cta.explore}
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink
              href={p("/lien-he")}
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              {t.cta.contact}
            </ButtonLink>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-white/80">
            <ShieldCheck className="h-5 w-5 text-accent" />
            {locale === "vi"
              ? "Đạt chuẩn GMP · Nguồn gốc minh bạch · Hỗ trợ pháp lý trọn gói"
              : "GMP-certified · Transparent sourcing · Full regulatory support"}
          </div>
        </div>

        {/* Stats card */}
        <div className="relative">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-6">
              {certifications.map((c) => (
                <div key={c.value} className="text-white">
                  <CountUp
                    value={c.value}
                    className="font-heading text-4xl font-extrabold sm:text-5xl"
                  />
                  <div className="mt-1 text-sm text-white/75">
                    {pick(c.suffix, locale)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl bg-accent px-5 py-4 text-white shadow-lg sm:block animate-float">
            <div className="font-heading text-2xl font-bold">ISO · GMP</div>
            <div className="text-xs text-white/85">
              {locale === "vi" ? "Chứng nhận quốc tế" : "International standards"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
