import type { Metadata } from "next";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { posts } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { BlogCatalog } from "@/components/blog/blog-catalog";

export const metadata: Metadata = {
  title: "Bioneer's Blog",
  description:
    "Kiến thức chuyên ngành về nguyên liệu, công nghệ bào chế và xu hướng ngành Dược, TPCN, Mỹ phẩm.",
};

export default function BlogPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = getDictionary(locale);

  return (
    <>
      <PageHeader
        locale={locale}
        title={locale === "vi" ? "Góc nhìn & kiến thức" : "Insights & industry"}
        titleAccent={locale === "vi" ? "chuyên ngành" : "knowledge"}
        description={
          locale === "vi"
            ? "Cập nhật xu hướng nguyên liệu, công nghệ bào chế và quy định mới nhất trong ngành."
            : "Stay updated on ingredient trends, formulation technology and the latest regulations."
        }
        breadcrumbs={[{ label: t.nav.blog }]}
      />

      <BlogCatalog posts={posts} locale={locale} />
    </>
  );
}
