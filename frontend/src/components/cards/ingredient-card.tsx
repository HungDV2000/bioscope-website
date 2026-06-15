import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Ingredient } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export function IngredientCard({
  ingredient,
  locale,
}: {
  ingredient: Ingredient;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <Link
      href={`/${locale}/nguyen-lieu/${ingredient.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage
          src={ingredient.image}
          alt={pick(ingredient.name, locale)}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone={ingredient.type === "supplement" ? "primary" : "accent"}>
            {ingredient.type === "supplement"
              ? t.common.supplement
              : t.common.cosmetic}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-neutral-500">
          <MapPin className="h-3.5 w-3.5" />
          {ingredient.originCountry}
          <span className="mx-1">•</span>
          {ingredient.brandName}
        </div>
        <h3 className="font-heading text-base font-bold leading-snug text-neutral-900 transition-colors group-hover:text-primary-dark">
          {pick(ingredient.name, locale)}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-500">
          {pick(ingredient.description, locale)}
        </p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {t.cta.viewDetail}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
