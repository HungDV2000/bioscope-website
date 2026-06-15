"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Ingredient } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick, cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { IngredientCard } from "@/components/cards/ingredient-card";

export function IngredientCatalog({
  ingredients,
  locale,
  initialType,
}: {
  ingredients: Ingredient[];
  locale: Locale;
  initialType?: "supplement" | "cosmetic";
}) {
  const t = getDictionary(locale);
  const [type, setType] = useState<"all" | "supplement" | "cosmetic">(
    initialType ?? "all"
  );
  const [origin, setOrigin] = useState("all");
  const [query, setQuery] = useState("");

  const origins = useMemo(
    () => Array.from(new Set(ingredients.map((i) => i.originCountry))),
    [ingredients]
  );

  const filtered = useMemo(() => {
    return ingredients.filter((i) => {
      if (type !== "all" && i.type !== type) return false;
      if (origin !== "all" && i.originCountry !== origin) return false;
      if (query) {
        const q = query.toLowerCase();
        const name = pick(i.name, locale).toLowerCase();
        if (!name.includes(q) && !i.brandName.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [ingredients, type, origin, query, locale]);

  const tabs = [
    { key: "all" as const, label: locale === "vi" ? "Tất cả" : "All" },
    { key: "supplement" as const, label: t.common.supplement },
    { key: "cosmetic" as const, label: t.common.cosmetic },
  ];

  return (
    <div className="container-bs py-14">
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setType(tab.key)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                type === tab.key
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
              placeholder={t.common.searchPlaceholder}
              className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary sm:w-64"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="h-11 w-full appearance-none rounded-full border border-neutral-200 bg-white pl-10 pr-8 text-sm outline-none transition-colors focus:border-primary sm:w-48"
            >
              <option value="all">{t.common.allOrigins}</option>
              {origins.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        {filtered.length}{" "}
        {locale === "vi" ? "nguyên liệu" : "ingredients"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ing) => (
            <IngredientCard key={ing.slug} ingredient={ing} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-lg border border-dashed border-neutral-200 py-20 text-center text-neutral-500">
          {t.common.noResult}
        </div>
      )}
    </div>
  );
}
