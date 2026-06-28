import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  FlaskConical,
  Lightbulb,
  ShieldCheck,
  Rocket,
  Fish,
  Sprout,
  Hexagon,
  Wheat,
  Sparkles,
  Award,
  Building2,
  Home,
  FileBadge,
  Beaker,
  UserRound,
  CheckCircle2,
  Users,
  Share2,
} from "lucide-react";
import type { Locale } from "@/lib/utils";
import { BrandsBand } from "@/components/home/brands-band";

const img = (n: string) => `/images/home/${n}`;

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const p = (path: string) => `/${locale}${path}`;
  return (
    <>
      <Hero p={p} />
      <BrandsBand />
      <Process />
      <IngredientCategories p={p} />
      <CaseStudies p={p} />
      <Certifications />
      <ExpertTeam p={p} />
      <CtaBand p={p} />
    </>
  );
}

type P = { p: (path: string) => string };

/* ========================================================================== */
/*  HERO                                                                        */
/* ========================================================================== */
const HERO_TRUST = [
  { icon: Leaf, label: "Nguyên liệu chất lượng cao" },
  { icon: Sparkles, label: "Khoa học & sáng tạo" },
  { icon: Hexagon, label: "Đồng hành dài hạn" },
];

const HERO_GALLERY = [
  {
    src: "microencapsulation.jpg",
    alt: "Viên nang và dạng bào chế",
    className: "h-[172px] w-[118px] sm:h-[178px] sm:w-[122px]",
  },
  {
    src: "spray-drying.jpg",
    alt: "Công nghệ sấy phun",
    className: "h-[196px] w-[128px] sm:h-[210px] sm:w-[134px]",
  },
  {
    src: "hero-leaf.jpg",
    alt: "Mầm xanh từ thiên nhiên",
    className: "h-[172px] w-[118px] sm:h-[178px] sm:w-[122px]",
  },
] as const;

const HERO_MINT = "#F7FBF9";
const HERO_MINT_SOFT = "#EEF6F1";

function Hero({ p }: P) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: HERO_MINT }}>
      {/* Full-bleed background image */}
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={img("hero-team.jpg")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Xanh mạ rất nhạt trái → trong suốt phải */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              `linear-gradient(to top right, ${HERO_MINT_SOFT} 0%, rgba(238,246,241,.4) 24%, rgba(238,246,241,.08) 42%, transparent 58%)`,
              `linear-gradient(90deg, ${HERO_MINT} 0%, ${HERO_MINT} 14%, rgba(247,251,249,.96) 28%, rgba(247,251,249,.55) 44%, rgba(247,251,249,.12) 58%, transparent 72%)`,
            ].join(", "),
          }}
        />
        {/* Đường cong đáy — theo sketch đỏ: trái phẳng, cung thoải dài xuống phải */}
        <svg
          className="absolute inset-x-0 bottom-0 h-[min(32vw,220px)] w-full sm:h-[min(28vw,190px)]"
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,32 L460,32 C620,32 780,108 960,168 C1120,210 1300,232 1440,240 L0,240 Z"
            fill={HERO_MINT}
          />
        </svg>
      </div>

      {/* Content + gallery share the same container */}
      <div className="container-bs relative z-10">
        {/* 3 ảnh inset — hàng ngang căn đáy, ảnh giữa nổi bật */}
        <div
          className="absolute bottom-10 right-4 z-[4] hidden items-end gap-2.5 lg:flex xl:bottom-12 xl:right-6 xl:gap-3.5"
          aria-hidden
        >
          {HERO_GALLERY.map(({ src, alt, className }) => (
            <div
              key={src}
              className={`relative shrink-0 overflow-hidden rounded-[38px] border-[5px] border-white shadow-card sm:rounded-[42px] sm:border-[6px] ${className}`}
            >
              <Image src={img(src)} alt={alt} fill sizes="134px" className="object-cover" />
            </div>
          ))}
        </div>

        {/* Text content */}
        <div className="max-w-[620px] py-16 lg:max-w-[700px] lg:py-[96px]">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary-deeper">
            Từ ý tưởng đến sản phẩm thành công
          </p>
          <h1 className="mt-4 font-heading text-[42px] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[54px]">
            Đồng hành cùng bạn{" "}
            <span className="text-primary">tạo nên sản phẩm khác biệt</span>
          </h1>
          <p className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-neutral-600">
            Nguyên liệu chất lượng, nghiên cứu ứng dụng và giải pháp phát triển sản
            phẩm trọn gói.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Link
              href={p("/lien-he")}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              Nhận tư vấn miễn phí
              <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href={p("/nguyen-lieu")}
              className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-primary-border bg-white px-7 py-3.5 text-[15px] font-semibold text-primary-dark transition-colors hover:border-primary hover:bg-primary-tint"
            >
              Khám phá nguyên liệu
              <Beaker className="h-[18px] w-[18px]" />
            </Link>
          </div>

          <div className="mt-10 flex flex-nowrap items-center gap-x-3 overflow-x-auto sm:gap-x-5 lg:gap-x-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {HERO_TRUST.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-neutral-700 sm:gap-2 sm:text-[13px]"
              >
                <Icon className="h-[17px] w-[17px] text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  PROCESS                                                                     */
/* ========================================================================== */
const STEPS = [
  { n: "01", icon: Lightbulb, title: "Ý tưởng", desc: "Hiểu nhu cầu và xu hướng thị trường." },
  { n: "02", icon: FlaskConical, title: "Phát triển", desc: "Nghiên cứu công thức, lựa chọn nguyên liệu tối ưu." },
  { n: "03", icon: ShieldCheck, title: "Kiểm chứng", desc: "Đánh giá hiệu quả, độ an toàn và tính ổn định." },
  { n: "04", icon: Rocket, title: "Ra thị trường", desc: "Hỗ trợ sản xuất và đưa sản phẩm tới người tiêu dùng." },
];

/** Mũi tên: từ mép phải icon tròn → mép trái thân card kế tiếp */
function ProcessConnectorForward() {
  return (
    <div
      className="pointer-events-none absolute z-20 hidden lg:block"
      style={{
        left: "calc(50% + 2.6875rem)",
        top: "1px",
        width: "calc(50% + 2rem - 1.9375rem)",
        height: "4rem",
        transform: "translateY(-50%)",
      }}
      aria-hidden
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 52"
        preserveAspectRatio="none"
      >
        <path
          d="M5,26 C 36,4 40,4 94,45"
          fill="none"
          stroke="#5E9C80"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          strokeDasharray="2.5 4"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute left-0 top-1/2 block h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-primary ring-2 ring-[#F7FBF9]" />
      <span
        className="absolute right-0 text-primary"
        style={{ top: "86.5%", transform: "translate(40%, -50%) rotate(32deg)" }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
          <path
            d="M1.2 1.6 L5.8 4 L1.2 6.4"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

function ProcessStepCard({
  n,
  icon: Icon,
  title,
  desc,
}: (typeof STEPS)[number]) {
  return (
    <div className="relative z-10 flex h-full flex-col rounded-[22px] border border-neutral-100 bg-white px-6 pb-7 pt-14 shadow-card">
      <span className="absolute -top-9 left-1/2 z-30 flex h-[74px] w-[74px] -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary-border bg-white text-primary">
        <Icon className="h-8 w-8" strokeWidth={1.6} />
      </span>
      <div className="text-[14px] font-bold text-primary">{n}</div>
      <h3 className="mt-1 font-heading text-[19px] font-extrabold text-ink">{title}</h3>
      <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-neutral-600">{desc}</p>
    </div>
  );
}

function Process() {
  return (
    <section className="py-10 lg:py-14" style={{ backgroundColor: HERO_MINT }}>
      <div className="container-bs">
        <div className="text-center">
          <h2 className="font-heading text-[22px] font-extrabold uppercase tracking-tight text-ink sm:text-[28px] lg:text-[32px]">
            Chúng tôi đồng hành như thế nào?
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-16 bg-primary-border sm:w-20" />
            <Leaf className="h-5 w-5 -rotate-45 text-primary" />
            <span className="h-px w-16 bg-primary-border sm:w-20" />
          </div>
        </div>

        <div className="mt-10 overflow-visible lg:mt-12">
          {/* Mobile / tablet */}
          <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:hidden">
            {STEPS.map((step) => (
              <ProcessStepCard key={step.n} {...step} />
            ))}
          </div>

          {/* Desktop — grid, mũi tên từ icon tròn → card kế */}
          <div className="hidden items-stretch overflow-visible lg:grid lg:grid-cols-4 lg:gap-x-8">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex min-w-0 flex-col">
                {i < STEPS.length - 1 && <ProcessConnectorForward />}
                <ProcessStepCard {...step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  INGREDIENT CATEGORIES                                                       */
/* ========================================================================== */
const ING_CARDS = [
  { icon: Fish, image: "omega3.jpg", title: "Omega & dầu cá", desc: "Hỗ trợ tim mạch, não bộ, lựa sức khỏe toàn diện" },
  { icon: Sprout, image: "spray-drying.jpg", title: "Nấm dược liệu", desc: "Tăng cường miễn dịch, bảo vệ và phục hồi cơ thể" },
  { icon: Hexagon, image: "liposome.jpg", title: "Hoạt chất công nghệ cao", desc: "Hiệu quả vượt trội · Ứng dụng đa dạng" },
  { icon: Wheat, image: "collagen.jpg", title: "Axit amin & vitamin", desc: "Nền tảng cho sức khỏe và hiệu suất tối ưu" },
];

function IngredientCategories({ p }: P) {
  return (
    <section className="bg-white py-10 lg:py-14">
      <div className="container-bs">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-[20px] font-extrabold uppercase tracking-tight text-ink sm:text-[24px]">
            Danh mục nguyên liệu
          </h2>
          <Link
            href={p("/nguyen-lieu")}
            className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-primary hover:gap-2.5"
          >
            Xem tất cả nguyên liệu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 1 thẻ lớn + 4 thẻ nhỏ — một hàng ngang (mockup) */}
        <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-[minmax(0,1.22fr)_repeat(4,minmax(0,1fr))] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          <Link
            href={p("/nguyen-lieu")}
            className="group relative flex h-[300px] w-[min(88vw,320px)] shrink-0 flex-col justify-center overflow-hidden rounded-[18px] px-6 py-7 text-white sm:w-[300px] lg:h-[320px] lg:w-auto lg:min-w-0"
          >
            <Image
              src={img("hero-leaf.jpg")}
              alt=""
              fill
              sizes="(max-width:1024px) 300px, 320px"
              className="object-cover object-right transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deeper/92 to-primary/25" />
            <div className="relative z-10 max-w-[210px]">
              <h3 className="font-heading text-[22px] font-semibold leading-tight !text-[rgba(255,255,255,0.92)] sm:text-[24px]">
                Chiết xuất thực vật
              </h3>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/88 sm:text-[13px]">
                Nguồn gốc tự nhiên · Hiệu quả đã được khoa học chứng minh
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-primary-dark transition-transform group-hover:gap-2.5">
                Khám phá ngay <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {ING_CARDS.map(({ icon: Icon, image, title, desc }) => (
            <Link
              key={title}
              href={p("/nguyen-lieu")}
              className="group flex h-[300px] w-[168px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-neutral-100 bg-white shadow-card transition-all hover:-translate-y-[2px] hover:shadow-card-hover lg:h-[320px] lg:w-auto lg:min-w-0"
            >
              <div className="relative h-[148px] shrink-0 overflow-hidden sm:h-[156px]">
                <Image
                  src={img(image)}
                  alt={title}
                  fill
                  sizes="180px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h4 className="font-heading text-[15px] font-bold leading-snug text-ink">{title}</h4>
                <p className="mt-1.5 flex-1 text-[11.5px] leading-relaxed text-neutral-500 sm:text-[12px]">
                  {desc}
                </p>
                <Icon className="mt-2 h-[18px] w-[18px] text-primary" strokeWidth={1.6} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  CASE STUDIES                                                                */
/* ========================================================================== */
type CaseStudyCard = {
  brand: string;
  sub: string;
  image: string;
  metric: string;
  metricLabel: string;
  desc: string;
  brandClass: string;
  subClass: string;
  metricClass?: string;
  headlineClass?: string;
  imageClass: string;
};

const CASES: CaseStudyCard[] = [
  {
    brand: "vivomega®",
    sub: "GC Rieber Oils",
    image: "omega3.jpg",
    metric: "300%",
    metricLabel: "Tăng trưởng doanh số",
    desc: "Danh mục omega-3 từ vi tảo sạch tại Việt Nam.",
    brandClass: "text-primary",
    subClass: "text-neutral-500",
    metricClass: "text-primary",
    imageClass: "object-cover object-[68%_center]",
  },
  {
    brand: "GastroHeal",
    sub: "",
    image: "brain-health.jpg",
    metric: "70%+",
    metricLabel: "Tỷ lệ khách hàng giới thiệu lại",
    desc: "Hỗ trợ giảm đau dạ dày và phục hồi niêm mạc dạ dày.",
    brandClass: "text-ink",
    subClass: "text-neutral-500",
    metricClass: "text-primary",
    imageClass: "object-cover object-right",
  },
  {
    brand: "PEA",
    sub: "PolymerSolution",
    image: "collagen.jpg",
    metric: "",
    metricLabel: "Tiên phong polymer sinh học tại Việt Nam",
    desc: "Giải pháp chống viêm thế hệ mới.",
    brandClass: "text-[#1E5FA8]",
    subClass: "text-[#3B7FD4]",
    headlineClass: "text-[#1E3A5F]",
    imageClass: "object-cover object-[82%_center]",
  },
];

function CaseStudies({ p }: P) {
  return (
    <section className="bg-white py-10 lg:py-14">
      <div className="container-bs">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <h2 className="font-heading text-[18px] font-extrabold uppercase leading-snug tracking-tight text-ink sm:text-[22px] lg:text-[24px]">
            Những thương hiệu đã tăng trưởng cùng Bioscope
          </h2>
          <Link
            href={p("/blog")}
            className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-primary transition-[gap] hover:gap-2.5"
          >
            Xem tất cả câu chuyện <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {CASES.map((c) => (
            <article
              key={c.brand}
              className="group relative min-h-[212px] overflow-hidden rounded-[20px] border border-neutral-100 bg-white shadow-[0_2px_14px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
            >
              <Image
                src={img(c.image)}
                alt=""
                fill
                sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 380px"
                className={`transition-transform duration-700 group-hover:scale-[1.03] ${c.imageClass}`}
                aria-hidden
              />

              <div className="relative z-10 flex min-h-[212px] max-w-[62%] flex-col justify-between p-6 lg:p-7">
                <div>
                  <h3
                    className={`font-heading text-[17px] font-extrabold leading-tight lg:text-[18px] ${c.brandClass}`}
                  >
                    {c.brand}
                  </h3>
                  {c.sub ? (
                    <p className={`mt-0.5 text-[12px] font-medium ${c.subClass}`}>{c.sub}</p>
                  ) : null}

                  {c.metric ? (
                    <div className="mt-4">
                      <p className="text-[12px] leading-snug text-neutral-600">{c.metricLabel}</p>
                      <p
                        className={`mt-1 font-heading text-[34px] font-extrabold leading-none tracking-tight lg:text-[38px] ${
                          c.metricClass ?? "text-primary"
                        }`}
                      >
                        {c.metric}
                      </p>
                    </div>
                  ) : (
                    <p
                      className={`mt-4 text-[13px] font-extrabold leading-snug lg:text-[14px] ${
                        c.headlineClass ?? c.brandClass
                      }`}
                    >
                      {c.metricLabel}
                    </p>
                  )}
                </div>

                <p className="mt-4 text-[11.5px] leading-relaxed text-neutral-600 lg:text-[12px]">
                  {c.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  CERTIFICATIONS                                                              */
/* ========================================================================== */
const CERTS = [
  { icon: Building2, title: "GMP", sub: "Nhà máy đạt chuẩn" },
  { icon: Home, title: "ISO 22000", sub: "Quản lý an toàn thực phẩm" },
  { icon: Award, title: "HACCP", sub: "Hệ thống quản lý an toàn thực phẩm" },
  { icon: CheckCircle2, title: "Halal", sub: "Đạt chứng nhận" },
  { icon: CheckCircle2, title: "Kosher", sub: "Đạt chứng nhận" },
  { icon: UserRound, title: "50+", sub: "Quốc gia phân phối" },
];

function Certifications() {
  return (
    <section className="bg-white py-10 lg:py-12">
      <div className="container-bs">
        <h2 className="font-heading text-[18px] font-extrabold uppercase tracking-tight text-primary-deeper sm:text-[22px] lg:text-[24px]">
          Chất lượng được bảo chứng
        </h2>

        <div className="mt-4 rounded-[20px] bg-primary-tint px-5 py-6 sm:px-7 lg:rounded-[22px] lg:px-8 lg:py-7 xl:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4 xl:gap-3">
            {CERTS.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary text-primary lg:h-11 lg:w-11">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <div className="font-heading text-[13px] font-extrabold leading-tight text-primary-deeper lg:text-[14px]">
                    {title}
                  </div>
                  <div className="mt-0.5 text-[10.5px] leading-snug text-neutral-600 lg:text-[11px]">
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  EXPERT TEAM                                                                 */
/* ========================================================================== */
const STATS = [
  { icon: FlaskConical, num: "15+ năm", label: "kinh nghiệm" },
  { icon: Leaf, num: "100+ dự án", label: "nghiên cứu" },
  { icon: FileBadge, num: "14 bằng sáng chế", label: "& giải pháp" },
  { icon: Users, num: "Đồng hành", label: "lâu dài" },
];

function ExpertTeam({ p }: P) {
  return (
    <section className="bg-white py-10 lg:py-14">
      <div className="container-bs">
        <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-neutral-50 lg:flex lg:items-stretch">
          <div className="relative aspect-[5/4] w-full shrink-0 sm:aspect-[16/11] lg:aspect-auto lg:w-[38%] lg:min-h-[300px]">
            <Image
              src={img("hero-team.jpg")}
              alt="Đội ngũ chuyên gia Bioscope"
              fill
              sizes="(max-width:1024px) 100vw, 420px"
              className="object-cover"
              priority={false}
            />
          </div>

          <div className="flex flex-1 flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-8 lg:p-9 xl:gap-10 xl:p-10">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-primary">
                Đội ngũ chuyên gia
              </p>
              <h2 className="mt-3 font-heading text-[26px] font-extrabold leading-[1.15] text-ink sm:text-[30px] lg:text-[32px]">
                Khoa học là nền tảng
                <br />
                con người là giá trị cốt lõi
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">
                Đội ngũ chuyên gia giàu kinh nghiệm, tâm huyết và luôn tiên phong trong
                nghiên cứu ứng dụng.
              </p>
              <Link
                href={p("/gioi-thieu")}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary-border bg-white px-5 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-primary hover:bg-white"
              >
                Tìm hiểu về chúng tôi
                <ArrowRight className="h-4 w-4 text-primary" />
              </Link>
            </div>

            <div className="grid w-full shrink-0 grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-6 lg:w-[44%] xl:w-[42%]">
              {STATS.map(({ icon: Icon, num, label }) => (
                <div key={num} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary text-primary">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <div className="font-heading text-[14px] font-extrabold text-ink sm:text-[15px]">
                      {num}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-neutral-600 sm:text-[12px]">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  CTA BAND                                                                    */
/* ========================================================================== */
function CtaBand({ p }: P) {
  return (
    <section className="bg-white py-8 lg:py-10">
      <div className="container-bs">
        <div className="relative overflow-hidden rounded-[20px] lg:rounded-[24px]">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-deeper via-primary to-[#2d9a62]" aria-hidden />
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <Image
              src={img("hero-leaf.jpg")}
              alt=""
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-cover object-[center_42%] opacity-55 mix-blend-soft-light"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-deeper/92 via-primary/72 to-primary/58" />
          </div>

          <div className="relative flex flex-col gap-6 px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-9">
            <div className="flex min-w-0 items-start gap-4">
              <Leaf
                className="mt-1 hidden h-9 w-9 shrink-0 text-white/35 sm:block"
                strokeWidth={1.25}
                aria-hidden
              />
              <div>
                <h2 className="font-heading text-[24px] font-extrabold leading-tight text-white sm:text-[28px] lg:text-[30px]">
                  Sẵn sàng bắt đầu dự án của bạn?
                </h2>
                <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/90 sm:text-[14.5px]">
                  Chia sẻ ý tưởng hoặc thách thức của bạn.
                  <br />
                  Bioscope sẵn sàng đồng hành cùng bạn từ hôm nay.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                href={p("/lien-he")}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Nhận tư vấn miễn phí
                <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href={p("/lien-he")}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14.5px] font-semibold text-primary-dark transition-colors hover:bg-white/95"
              >
                Yêu cầu mẫu thử
                <Share2 className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  SHARED                                                                      */
/* ========================================================================== */
function SectionHeading({ eyebrow, title, center }: { eyebrow?: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow && (
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      )}
      <h2 className={`mt-2 font-heading text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px] ${center ? "mx-auto max-w-2xl" : ""}`}>
        {title}
      </h2>
    </div>
  );
}
