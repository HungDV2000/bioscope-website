import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/vi/b2b/portal", "/en/b2b/portal"],
    },
    sitemap: "https://bioscope.vn/sitemap.xml",
  };
}
