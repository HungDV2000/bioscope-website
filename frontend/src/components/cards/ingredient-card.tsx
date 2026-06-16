import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Ingredient } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick, cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export function IngredientCard({
  ingredient,
  locale,
  variant = "grid",
}: {
  ingredient: Ingredient;
  locale: Locale;
  variant?: "grid" | "list";
}) {
  const t = getDictionary(locale);
  const href = `/${locale}/nguyen-lieu/${ingredient.slug}`;
  const typeLabel =
    ingredient.type === "supplement"
      ? t.common.supplement
      : t.common.cosmetic;

  const meta = (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-neutral-500">
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        {ingredient.originCountry}
      </span>
      <span aria-hidden>•</span>
      <span>{ingredient.brandName}</span>
      <span aria-hidden>•</span>
      <span>{pick(ingredient.category, locale)}</span>
    </div>
  );

  const title = (
    <h3
      className={cn(
        "font-heading font-bold leading-snug text-neutral-900 transition-colors group-hover:text-primary-dark",
        variant === "grid" ? "text-base" : "text-lg",
      )}
    >
      {pick(ingredient.name, locale)}
    </h3>
  );

  const description = (
    <p
      className={cn(
        "text-sm leading-relaxed text-neutral-500",
        variant === "grid" ? "mt-2 line-clamp-2 flex-1" : "mt-2 line-clamp-2 sm:line-clamp-3",
      )}
    >
      {pick(ingredient.description, locale)}
    </p>
  );

  const cta = (
    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
      {t.cta.viewDetail}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  );

  if (variant === "list") {
    return (
      <Link
        href={href}
        className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-card-hover sm:flex-row"
      >
        <div className="relative aspect-[16/9] w-full shrink-0 sm:aspect-auto sm:w-52 sm:self-stretch lg:w-60">
          <SafeImage
            src={ingredient.image}
            alt={pick(ingredient.name, locale)}
            fill
            sizes="(max-width:640px) 100vw, 240px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <Badge tone={ingredient.type === "supplement" ? "primary" : "accent"}>
              {typeLabel}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {meta}
          <div className="mt-2">{title}</div>
          {description}
          <div className="mt-auto pt-2">{cta}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
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
            {typeLabel}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {meta}
        <div className="mt-2">{title}</div>
        {description}
        {cta}
      </div>
    </Link>
  );
}
