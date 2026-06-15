import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Post } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick, formatDate } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SafeImage
          src={post.image}
          alt={pick(post.title, locale)}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="accent">{pick(post.category, locale)}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-3 text-xs text-neutral-500">
          <span>{formatDate(post.date, locale)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime} {t.common.readingTime}
          </span>
        </div>
        <h3 className="font-heading text-lg font-bold leading-snug text-neutral-900 transition-colors group-hover:text-primary-dark">
          {pick(post.title, locale)}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-500">
          {pick(post.excerpt, locale)}
        </p>
      </div>
    </Link>
  );
}
