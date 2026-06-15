import type { Metadata } from "next";
import { FileText, Download, FileBadge, Receipt } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Cổng đối tác B2B",
  robots: { index: false },
};

const docs = {
  vi: [
    { t: "COA - Marine Sweet® NAG", type: "COA", icon: FileBadge, date: "2026-05-10" },
    { t: "Spec Sheet - Collagen Peptide", type: "Spec", icon: FileText, date: "2026-04-22" },
    { t: "Báo giá Q2/2026", type: "Báo giá", icon: Receipt, date: "2026-04-01" },
    { t: "Brochure công nghệ Novaskin™", type: "Brochure", icon: FileText, date: "2026-03-15" },
  ],
  en: [
    { t: "COA - Marine Sweet® NAG", type: "COA", icon: FileBadge, date: "2026-05-10" },
    { t: "Spec Sheet - Collagen Peptide", type: "Spec", icon: FileText, date: "2026-04-22" },
    { t: "Quote Q2/2026", type: "Quote", icon: Receipt, date: "2026-04-01" },
    { t: "Novaskin™ technology brochure", type: "Brochure", icon: FileText, date: "2026-03-15" },
  ],
};

export default function PortalPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const t = getDictionary(locale);

  return (
    <>
      <PageHeader
        locale={locale}
        title={locale === "vi" ? "Tài liệu" : "Your"}
        titleAccent={locale === "vi" ? "của bạn" : "documents"}
        description={
          locale === "vi"
            ? "Truy cập COA, spec sheet, báo giá và tài liệu kỹ thuật dành riêng cho đối tác. (Demo — sẽ bảo vệ bằng xác thực ở giai đoạn backend.)"
            : "Access COAs, spec sheets, quotes and partner-only technical documents. (Demo — auth-protected during the backend phase.)"
        }
        breadcrumbs={[{ label: locale === "vi" ? "Cổng B2B" : "B2B Portal" }]}
      />

      <section className="container-bs py-16">
        <div className="grid gap-4">
          {docs[locale].map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.t}
                className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-medium text-neutral-900">{doc.t}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                      <Badge tone="neutral">{doc.type}</Badge>
                      {doc.date}
                    </div>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary-dark transition-colors hover:bg-primary-tint">
                  <Download className="h-4 w-4" />
                  {locale === "vi" ? "Tải" : "Download"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
