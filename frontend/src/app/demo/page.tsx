import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, ShoppingBag, Menu, Star } from "lucide-react";

/* Voerbon — palette tông đất ấm (theo atmosphere của design md + ảnh thật) */
const C = {
  ink: "#2C1A11",
  cream: "#F7ECE4",
  creamSoft: "#FBF5F0",
  rust: "#A8482A",
  burgundy: "#6E2F1C",
  brown: "#4A2314",
  orange: "#D9712B",
};

const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const nav = ["Candles", "Crystals", "Botanicals", "Sale", "Bestsellers"];

const categories = [
  { name: "Candles", img: "photo-1572726729207-a78d6feb18d7" },
  { name: "Aroma Jars", img: "photo-1603006905003-be475563bc59" },
  { name: "Crystals", img: "photo-1518972559570-7cc1309f3229" },
];

const bestSellers = [
  { name: "Amber Ritual Candle", price: "$42.00", img: "photo-1602874801007-bd458bb1b8b6", badge: false },
  { name: "Sculpted Sage Candle", price: "$38.00", img: "photo-1572726729207-a78d6feb18d7", badge: false },
  { name: "Citrine Cluster", price: "$64.00", img: "photo-1518972559570-7cc1309f3229", badge: true },
  { name: "Smoky Quartz Stone", price: "$29.00", img: "photo-1599751449128-eb7249c3d6b1", badge: false },
];

export default function VoerbonHome() {
  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{ backgroundColor: C.cream, color: C.ink }}
    >
      <Nav />
      <Hero />
      <NewArrival />
      <ShopByCategory />
      <SaleBand />
      <BestSellers />
      <PartnerBand />
      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
function Nav() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ backgroundColor: "rgba(247,236,228,0.85)", borderColor: "rgba(74,35,20,0.12)" }}
    >
      <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 lg:px-8">
        <Link href="/demo" className="font-voerbon text-[26px] font-semibold tracking-tight" style={{ color: C.ink }}>
          vo<span style={{ fontStyle: "italic" }}>ē</span>rbon
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <a
              key={n}
              href="#"
              className="rounded-full px-4 py-2 text-sm uppercase tracking-wide transition-colors"
              style={{ color: C.ink }}
            >
              {n}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Tìm kiếm"
            className="hidden h-10 items-center gap-2 rounded-full border px-4 text-sm sm:inline-flex"
            style={{ borderColor: "rgba(74,35,20,0.25)", color: C.ink }}
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          <button
            aria-label="Giỏ hàng"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            style={{ color: C.ink }}
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
          <a
            href="#"
            className="hidden rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:inline-flex"
            style={{ backgroundColor: C.rust }}
          >
            Log in
          </a>
          <button aria-label="Menu" className="inline-flex h-10 w-10 items-center justify-center lg:hidden" style={{ color: C.ink }}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={img("photo-1441974231531-c6227db76b6e", 2000)} alt="" fill priority className="object-cover" sizes="100vw" />
        {/* phủ ấm để ra tông terracotta */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(74,35,20,0.78) 0%, rgba(168,72,42,0.45) 45%, rgba(217,113,43,0.25) 100%)" }} />
      </div>

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-32">
        <div className="text-white">
          <h1 className="font-voerbon text-[64px] font-medium leading-[0.95] tracking-tight sm:text-[88px] lg:text-[120px]">
            vo<span className="italic">ē</span>rbon
          </h1>
          <p className="mt-4 max-w-md font-voerbon text-2xl leading-snug sm:text-[28px]">
            Nurture your <span className="italic">mind</span>, <span className="italic">body</span>, and <span className="italic">soul</span>.
          </p>
        </div>

        <div className="relative flex flex-col items-start gap-6 lg:items-end lg:text-right">
          {/* Khối tạo hình hữu cơ 3D (thay ảnh blob) */}
          <div
            className="h-44 w-44 animate-float sm:h-56 sm:w-56"
            style={{
              background: "radial-gradient(circle at 32% 28%, #F6A45A 0%, #E07E3C 38%, #B85320 78%, #8A3A18 100%)",
              borderRadius: "62% 38% 55% 45% / 48% 56% 44% 52%",
              boxShadow: "0 30px 60px rgba(74,35,20,0.45)",
            }}
            aria-hidden
          />
          <div className="max-w-xs text-white">
            <p className="text-sm leading-relaxed text-white/90">
              Handpicked well-being products, made for every aspect of your life.
            </p>
            <a
              href="#shop"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
              style={{ color: C.burgundy }}
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function NewArrival() {
  return (
    <section id="shop" style={{ backgroundColor: C.creamSoft }}>
      <div className="mx-auto max-w-[1440px] px-5 py-20 lg:px-8 lg:py-28">
        <h2 className="text-center font-voerbon text-4xl font-medium sm:text-5xl">
          New <span className="italic">Arrival</span>
        </h2>
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <div className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-lg">
            <Image src={img("photo-1512290923902-8a9f81dc236c")} alt="New arrival product" fill className="object-cover" sizes="(max-width:1024px) 100vw, 40vw" />
          </div>
          <div className="max-w-md">
            <p className="font-voerbon text-2xl leading-snug sm:text-3xl" style={{ color: C.ink }}>
              Premium wellness products for every aspect of your life.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(44,26,17,0.7)" }}>
              Thoughtfully sourced candles, crystals and botanicals — crafted to bring calm,
              intention and warmth into your everyday rituals.
            </p>
            <a
              href="#"
              className="mt-7 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors"
              style={{ borderColor: C.rust, color: C.rust }}
            >
              Shop all
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function ShopByCategory() {
  return (
    <section style={{ backgroundColor: C.rust }}>
      <div className="mx-auto max-w-[1440px] px-5 py-20 lg:px-8 lg:py-28">
        <h2 className="text-center font-voerbon text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
          Shop By <span className="italic">Category</span>
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <a key={cat.name} href="#" className="group block">
              <span className="mb-3 block text-center text-xs uppercase tracking-[0.2em] text-white/75">
                {cat.name}
              </span>
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <Image
                  src={img(cat.img)}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function SaleBand() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={img("photo-1507371341162-763b5e419408", 2000)} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(40,20,11,0.72)" }} />
      </div>
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center text-white lg:py-32">
        <p className="font-voerbon text-3xl leading-snug sm:text-4xl lg:text-5xl">
          Don&rsquo;t miss out!
          <span className="mt-2 block italic">Our biggest sale of the year ends soon.</span>
        </p>
        <a
          href="#"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium"
          style={{ color: C.burgundy }}
        >
          Shop the sale
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function BestSellers() {
  return (
    <section style={{ backgroundColor: C.creamSoft }}>
      <div className="mx-auto max-w-[1440px] px-5 py-20 lg:px-8 lg:py-28">
        <h2 className="text-center font-voerbon text-4xl font-medium sm:text-5xl">
          Best <span className="italic">Sellers</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[15px]" style={{ color: "rgba(44,26,17,0.65)" }}>
          Top products chosen by our health-conscious community.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((p) => (
            <a key={p.name} href="#" className="group block rounded-lg p-3 transition-colors hover:bg-white">
              <div className="relative aspect-square overflow-hidden rounded-md">
                <Image src={img(p.img)} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width:1024px) 50vw, 22vw" />
                {p.badge && (
                  <span
                    className="absolute left-3 top-3 inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                    style={{ backgroundColor: C.orange }}
                  >
                    <Star className="h-3 w-3" /> Best seller
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-voerbon text-lg" style={{ color: C.ink }}>{p.name}</h3>
              <p className="mt-1 text-sm font-medium" style={{ color: C.rust }}>{p.price}</p>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.rust }}
          >
            Shop now
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function PartnerBand() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={img("photo-1497436072909-60f360e1d4b1", 2000)} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(40,20,11,0.62)" }} />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 py-24 text-center text-white lg:px-8 lg:py-28">
        <p className="font-voerbon text-3xl sm:text-4xl lg:text-[44px]">
          vo<span className="italic">ē</span>rbon{" "}
          <span className="italic opacity-90">your partner in wellness</span>
        </p>

        {/* Chân dung + khối nhấn màu sau lưng */}
        <div className="relative mx-auto mt-12 w-full max-w-sm">
          <div className="absolute -right-4 -top-4 h-full w-full rounded-lg" style={{ backgroundColor: "#3F6F7A" }} aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image src={img("photo-1556228578-0d85b1a4d571")} alt="Wellness portrait" fill className="object-cover" sizes="(max-width:768px) 100vw, 384px" />
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-md text-sm leading-relaxed text-white/85">
          Committed to enhancing your healthy lifestyle with quality, intentional products.
        </p>
        <a href="#" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium" style={{ color: C.burgundy }}>
          Read more
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function Footer() {
  const cols = [
    { h: "Shop", links: ["Candles", "Crystals", "Botanicals", "Gift sets"] },
    { h: "Company", links: ["About", "Sustainability", "Journal", "Contact"] },
    { h: "Support", links: ["Shipping & FAQ", "Returns", "Privacy", "Terms"] },
  ];
  return (
    <footer style={{ backgroundColor: C.brown, color: "rgba(247,236,228,0.85)" }}>
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8">
        <div className="text-center">
          <span className="font-voerbon text-4xl text-white">
            vo<span className="italic">ē</span>rbon
          </span>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-3 lg:mx-auto lg:max-w-3xl">
          {cols.map((c) => (
            <div key={c.h} className="text-center">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">{c.h}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition-colors hover:text-white">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-6 text-center text-xs text-white/55" style={{ borderColor: "rgba(247,236,228,0.15)" }}>
          © {new Date().getFullYear()} Voērbon — Demo wellness store. Bản dựng minh hoạ phong cách.
        </div>
      </div>
    </footer>
  );
}
