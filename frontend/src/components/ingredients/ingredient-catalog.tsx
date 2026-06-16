"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Tag,
  ArrowUpDown,
  LayoutGrid,
  List,
  X,
} from "lucide-react";
import type { Ingredient } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick, cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { IngredientCard } from "@/components/cards/ingredient-card";

type ViewMode = "grid" | "list";
type SortKey = "name-asc" | "name-desc" | "origin-asc" | "origin-desc";

const selectClass =
  "h-11 w-full appearance-none rounded-lg border border-neutral-200 bg-white pl-10 pr-9 text-sm outline-none transition-colors focus:border-primary";

export function IngredientCatalog({
  ingredients,
  locale,
}: {
  ingredients: Ingredient[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const ti = t.ingredients;
  const searchParams = useSearchParams();

  const [type, setType] = useState<"all" | "supplement" | "cosmetic">("all");
  const [origin, setOrigin] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const param = searchParams.get("type");
    if (param === "supplement" || param === "cosmetic") {
      setType(param);
    }
  }, [searchParams]);

  const origins = useMemo(
    () =>
      Array.from(new Set(ingredients.map((i) => i.originCountry))).sort(
        (a, b) => a.localeCompare(b, locale),
      ),
    [ingredients, locale],
  );

  const categories = useMemo(() => {
    const map = new Map<string, Ingredient["category"]>();
    for (const ing of ingredients) {
      map.set(ing.categorySlug, ing.category);
    }
    return Array.from(map.entries()).sort((a, b) =>
      pick(a[1], locale).localeCompare(pick(b[1], locale), locale),
    );
  }, [ingredients, locale]);

  const hasActiveFilters =
    type !== "all" ||
    origin !== "all" ||
    category !== "all" ||
    query.trim() !== "" ||
    sort !== "name-asc";

  const filtered = useMemo(() => {
    let list = ingredients.filter((i) => {
      if (type !== "all" && i.type !== type) return false;
      if (origin !== "all" && i.originCountry !== origin) return false;
      if (category !== "all" && i.categorySlug !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = [
          pick(i.name, locale),
          i.brandName,
          i.originCountry,
          pick(i.category, locale),
          pick(i.description, locale),
          i.partner,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return pick(b.name, locale).localeCompare(pick(a.name, locale), locale);
        case "origin-asc":
          return a.originCountry.localeCompare(b.originCountry, locale);
        case "origin-desc":
          return b.originCountry.localeCompare(a.originCountry, locale);
        case "name-asc":
        default:
          return pick(a.name, locale).localeCompare(pick(b.name, locale), locale);
      }
    });

    return list;
  }, [ingredients, type, origin, category, query, sort, locale]);

  const clearFilters = () => {
    setType("all");
    setOrigin("all");
    setCategory("all");
    setQuery("");
    setSort("name-asc");
  };

  const tabs = [
    { key: "all" as const, label: locale === "vi" ? "Tất cả" : "All" },
    { key: "supplement" as const, label: t.common.supplement },
    { key: "cosmetic" as const, label: t.common.cosmetic },
  ];

  return (
    <div className="container-bs py-10 sm:py-14">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card sm:p-5">
        {/* Loại sản phẩm */}
        <div className="inline-flex max-w-full flex-wrap rounded-full border border-neutral-200 bg-neutral-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setType(tab.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5",
                type === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-neutral-700 hover:text-primary-dark",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ti.searchPlaceholder}
              className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50/50 pl-10 pr-10 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:text-neutral-700"
                aria-label={t.common.clearFilters}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className={selectClass}
              aria-label={t.common.origin}
            >
              <option value="all">{t.common.allOrigins}</option>
              {origins.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
              aria-label={t.common.category}
            >
              <option value="all">{t.common.allCategories}</option>
              {categories.map(([slug, label]) => (
                <option key={slug} value={slug}>
                  {pick(label, locale)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort + view + kết quả */}
        <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[11rem] flex-1 sm:max-w-[13rem]">
              <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={selectClass}
                aria-label={t.common.sortBy}
              >
                <option value="name-asc">{ti.sortNameAsc}</option>
                <option value="name-desc">{ti.sortNameDesc}</option>
                <option value="origin-asc">{ti.sortOriginAsc}</option>
                <option value="origin-desc">{ti.sortOriginDesc}</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-primary-dark underline-offset-2 hover:underline"
              >
                {t.common.clearFilters}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-800">
                {filtered.length}
              </span>{" "}
              {ti.ingredientCount}
            </p>

            <div
              className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1"
              role="group"
              aria-label={locale === "vi" ? "Chế độ hiển thị" : "View mode"}
            >
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "grid"
                    ? "bg-white text-primary shadow-sm"
                    : "text-neutral-600 hover:text-primary-dark",
                )}
                aria-pressed={view === "grid"}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">{t.common.gridView}</span>
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === "list"
                    ? "bg-white text-primary shadow-sm"
                    : "text-neutral-600 hover:text-primary-dark",
                )}
                aria-pressed={view === "list"}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">{t.common.listView}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div
          className={cn(
            "mt-8",
            view === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-4",
          )}
        >
          {filtered.map((ing) => (
            <IngredientCard
              key={ing.slug}
              ingredient={ing}
              locale={locale}
              variant={view}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 py-20 text-center">
          <p className="text-neutral-500">{t.common.noResult}</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-semibold text-primary-dark hover:underline"
            >
              {t.common.clearFilters}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
