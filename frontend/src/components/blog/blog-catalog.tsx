"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Post } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick, cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { PostCard } from "@/components/cards/post-card";
import { Reveal } from "@/components/ui/reveal";

type CategoryKey = Post["categoryKey"] | "all";
type SortKey = "newest" | "oldest" | "reading-asc" | "reading-desc";

const CATEGORY_KEYS: Post["categoryKey"][] = [
  "technology",
  "rd",
  "manufacturing",
];

export function BlogCatalog({
  posts,
  locale,
}: {
  posts: Post[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [category, setCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let list = posts.filter((post) => {
      if (category !== "all" && post.categoryKey !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const title = pick(post.title, locale).toLowerCase();
        const excerpt = pick(post.excerpt, locale).toLowerCase();
        const cat = pick(post.category, locale).toLowerCase();
        if (!title.includes(q) && !excerpt.includes(q) && !cat.includes(q)) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.date.localeCompare(b.date);
        case "reading-asc":
          return a.readingTime - b.readingTime;
        case "reading-desc":
          return b.readingTime - a.readingTime;
        case "newest":
        default:
          return b.date.localeCompare(a.date);
      }
    });

    return list;
  }, [posts, category, query, sort, locale]);

  const tabs: { key: CategoryKey; label: string }[] = [
    { key: "all", label: t.blog.allCategories },
    ...CATEGORY_KEYS.map((key) => ({
      key,
      label: t.blog.categories[key],
    })),
  ];

  return (
    <section className="container-bs py-10 sm:py-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex max-w-full flex-wrap rounded-full border border-neutral-200 bg-neutral-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategory(tab.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5",
                category === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-neutral-700 hover:text-primary-dark"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.blog.searchPlaceholder}
              className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary sm:w-64"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 w-full appearance-none rounded-full border border-neutral-200 bg-white pl-10 pr-8 text-sm outline-none transition-colors focus:border-primary sm:w-48"
            >
              <option value="newest">{t.blog.sortNewest}</option>
              <option value="oldest">{t.blog.sortOldest}</option>
              <option value="reading-asc">{t.blog.sortReadingShort}</option>
              <option value="reading-desc">{t.blog.sortReadingLong}</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        {filtered.length} {t.blog.articleCount}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <Reveal key={post.slug} delay={i * 60}>
              <PostCard post={post} locale={locale} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-lg border border-dashed border-neutral-200 py-20 text-center text-neutral-500">
          {t.common.noResult}
        </div>
      )}
    </section>
  );
}
