import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, User } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { pick, formatDate } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { posts, getPost } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/cards/post-card";
import { Badge } from "@/components/ui/badge";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ArticleBody } from "@/components/blog/article-body";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string; locale: Locale };
}): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: pick(post.title, params.locale),
    description: pick(post.excerpt, params.locale),
  };
}

const contentColumnClass = "mx-auto flex w-full max-w-[42rem] flex-col";

export default function PostDetail({
  params,
}: {
  params: { slug: string; locale: Locale };
}) {
  const { locale, slug } = params;
  const post = getPost(slug);
  if (!post) notFound();
  const t = getDictionary(locale);
  const related = posts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.categoryKey === post.categoryKey ? 1 : 0;
      const bMatch = b.categoryKey === post.categoryKey ? 1 : 0;
      return bMatch - aMatch || b.date.localeCompare(a.date);
    })
    .slice(0, 2);
  const sections = post.sections ?? [];
  const hasToc = sections.length > 0;

  return (
    <>
      <PageHeader
        locale={locale}
        compact
        eyebrow={`${pick(post.category, locale).toUpperCase()} · BIONEER'S BLOG`}
        title={pick(post.title, locale)}
        description={pick(post.excerpt, locale)}
        breadcrumbs={[
          { label: t.nav.blog, href: `/${locale}/blog` },
          { label: pick(post.title, locale) },
        ]}
      />

      <article className="container-bs py-10 sm:py-14">
        <div className={contentColumnClass}>
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            <Badge tone="accent">{pick(post.category, locale)}</Badge>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span>{formatDate(post.date, locale)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime} {t.common.readingTime}
            </span>
          </div>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200">
            <Image
              src={post.image}
              alt={pick(post.title, locale)}
              fill
              sizes="(max-width:1024px) 100vw, 672px"
              className="object-cover"
              priority
            />
          </div>

          {hasToc && (
            <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
              <TableOfContents sections={sections} locale={locale} />
            </div>
          )}

          <div className="mt-10">
            <ArticleBody post={post} locale={locale} />
          </div>
        </div>
      </article>

      <section className="border-t border-neutral-200 bg-neutral-50 py-14 sm:py-16">
        <div className={`container-bs ${contentColumnClass}`}>
          <h2 className="font-heading text-xl font-bold text-ink sm:text-2xl">
            {t.blog.relatedPosts}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
