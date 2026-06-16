import type { Locale } from "./utils";
import { pick } from "./utils";

export type SearchItem = {
  label: string;
  sub: string;
  href: string;
  kind: "ingredient" | "tech" | "post";
};

/** Tải lazy — tránh kéo toàn bộ data.ts vào bundle header */
export async function buildSearchIndex(locale: Locale): Promise<SearchItem[]> {
  const { ingredients, technologies, posts } = await import("./data");
  const p = (path: string) => `/${locale}${path}`;

  return [
    ...technologies.map((x) => ({
      label: pick(x.name, locale),
      sub: locale === "vi" ? "Công nghệ" : "Technology",
      href: p(`/cong-nghe/${x.slug}`),
      kind: "tech" as const,
    })),
    ...ingredients.map((x) => ({
      label: pick(x.name, locale),
      sub: `${x.brandName} · ${x.originCountry}`,
      href: p(`/nguyen-lieu/${x.slug}`),
      kind: "ingredient" as const,
    })),
    ...posts.map((x) => ({
      label: pick(x.title, locale),
      sub: "Bioneer's Blog",
      href: p(`/blog/${x.slug}`),
      kind: "post" as const,
    })),
  ];
}
