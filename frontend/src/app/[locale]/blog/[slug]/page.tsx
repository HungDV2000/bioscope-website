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

export default function PostDetail({
  params,
}: {
  params: { slug: string; locale: Locale };
}) {
  const { locale, slug } = params;
  const post = getPost(slug);
  if (!post) notFound();
  const t = getDictionary(locale);
  const more = posts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHeader
        locale={locale}
        title={pick(post.title, locale)}
        breadcrumbs={[
          { label: t.nav.blog, href: `/${locale}/blog` },
          { label: pick(post.title, locale) },
        ]}
      />

      <article className="container-bs py-14">
        <div className="mx-auto max-w-3xl">
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
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>

          <div className="prose-bs mt-10">
            <p className="text-lg font-medium text-neutral-900">
              {pick(post.excerpt, locale)}
            </p>
            <p>{pick(post.content, locale)}</p>
            <p>
              {locale === "vi"
                ? "Nội dung bài viết đầy đủ sẽ được quản trị qua Payload CMS (Bioneer's Blog) ở giai đoạn tích hợp backend. Phần này hiển thị dữ liệu mẫu để minh họa bố cục trang chi tiết."
                : "The full article content will be managed via Payload CMS (Bioneer's Blog) during backend integration. This shows sample data to illustrate the detail layout."}
            </p>
          </div>
        </div>
      </article>

      <section className="bg-neutral-50 py-20">
        <div className="container-bs">
          <h2 className="font-heading text-2xl font-bold">
            {t.common.latestPosts}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
