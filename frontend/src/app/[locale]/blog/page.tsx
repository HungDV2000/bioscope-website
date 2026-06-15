import type { Metadata } from "next";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { posts } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/cards/post-card";
import { Reveal } from "@/components/ui/reveal";

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
        eyebrow="Bioneer's Blog"
        title={
          locale === "vi"
            ? "Góc nhìn & kiến thức chuyên ngành"
            : "Insights & industry knowledge"
        }
        description={
          locale === "vi"
            ? "Cập nhật xu hướng nguyên liệu, công nghệ bào chế và quy định mới nhất trong ngành."
            : "Stay updated on ingredient trends, formulation technology and the latest regulations."
        }
        breadcrumbs={[{ label: t.nav.blog }]}
      />

      <section className="container-bs py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 80}>
              <PostCard post={post} locale={locale} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
