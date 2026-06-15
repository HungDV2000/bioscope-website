import type { ContentSection, Bilingual } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick, cn } from "@/lib/utils";
import { TableOfContents } from "@/components/blog/table-of-contents";

export function RichContent({
  lead,
  sections,
  locale,
}: {
  lead?: Bilingual;
  sections: ContentSection[];
  locale: Locale;
}) {
  if (!lead && sections.length === 0) return null;

  return (
    <div className="prose-bs">
      {lead && (
        <p className="text-lg font-medium text-neutral-900">{pick(lead, locale)}</p>
      )}
      {sections.map((section) => {
        const Tag = section.level === 2 ? "h2" : "h3";
        return (
          <div key={section.id}>
            <Tag id={section.id}>{pick(section.title, locale)}</Tag>
            {section.paragraphs.map((para, i) => (
              <p key={i}>{pick(para, locale)}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function RichContentLayout({
  lead,
  sections,
  locale,
  className,
  showToc = true,
}: {
  lead?: Bilingual;
  sections: ContentSection[];
  locale: Locale;
  className?: string;
  /** Hiển thị mục lục phía trên nội dung (ngay dưới ảnh nếu dùng kèm) */
  showToc?: boolean;
}) {
  if (sections.length === 0 && !lead) return null;

  const hasToc = showToc && sections.length > 0;

  return (
    <section className={cn("border-t border-neutral-200 bg-neutral-50/50 py-12 sm:py-16", className)}>
      <div className="container-bs">
        <div className="mx-auto flex w-full max-w-[48rem] flex-col">
          {hasToc && (
            <div className="w-full rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
              <TableOfContents sections={sections} locale={locale} />
            </div>
          )}

          <div className={cn(hasToc && "mt-10")}>
            <RichContent lead={lead} sections={sections} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
