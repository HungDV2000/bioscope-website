import type { PostSection } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick, cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";

export function TableOfContents({
  sections,
  locale,
  className,
}: {
  sections: PostSection[];
  locale: Locale;
  className?: string;
}) {
  const t = getDictionary(locale);
  if (!sections.length) return null;

  return (
    <nav className={cn("w-full", className)} aria-label={t.blog.tableOfContents}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {t.blog.tableOfContents}
      </p>
      <ul className="mt-4 space-y-0.5 border-l border-neutral-200">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "block border-l-2 border-transparent py-1.5 text-sm leading-snug text-neutral-600 transition-colors hover:border-primary hover:text-primary-dark",
                section.level === 2 ? "pl-4 font-medium" : "pl-7 text-[13px]"
              )}
            >
              {pick(section.title, locale)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
