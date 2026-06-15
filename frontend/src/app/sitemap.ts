import type { MetadataRoute } from "next";
import { ingredients, technologies, posts } from "@/lib/data";
import { locales } from "@/lib/i18n";

const BASE = "https://bioscope.vn";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/gioi-thieu",
    "/nguyen-lieu",
    "/cong-nghe",
    "/dich-vu-odm",
    "/blog",
    "/lien-he",
    "/tuyen-dung",
    "/cau-hoi-thuong-gap",
    "/chinh-sach-bao-mat",
  ];

  const dynamicPaths = [
    ...ingredients.map((i) => `/nguyen-lieu/${i.slug}`),
    ...technologies.map((t) => `/cong-nghe/${t.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ];

  const all = [...staticPaths, ...dynamicPaths];

  return locales.flatMap((locale) =>
    all.map((path) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }))
  );
}
