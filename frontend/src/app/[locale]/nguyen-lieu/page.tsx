import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { ingredients } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { IngredientCatalog } from "@/components/ingredients/ingredient-catalog";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Nguyên liệu TPCN & Mỹ phẩm",
  description:
    "Danh mục nguyên liệu cao cấp cho thực phẩm chức năng và mỹ phẩm, nguồn gốc minh bạch từ các đối tác toàn cầu.",
};

export default function IngredientsPage({
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
        title={locale === "vi" ? "Nguyên liệu cho TPCN &" : "Ingredients for Supplements &"}
        titleAccent={locale === "vi" ? "Mỹ phẩm" : "Cosmetics"}
        description={
          locale === "vi"
            ? "Tuyển chọn nguyên liệu chuẩn hóa, độ tinh khiết cao từ các nhà sản xuất uy tín toàn cầu, sẵn sàng cho công thức của bạn."
            : "Standardised, high-purity ingredients curated from reputable global manufacturers, ready for your formulations."
        }
        breadcrumbs={[{ label: t.nav.ingredients }]}
      />
      <Suspense
        fallback={
          <div className="container-bs py-14 text-sm text-neutral-500">
            {locale === "vi" ? "Đang tải danh mục…" : "Loading catalog…"}
          </div>
        }
      >
        <IngredientCatalog ingredients={ingredients} locale={locale} />
      </Suspense>
      <CtaBand locale={locale} />
      <div className="pb-8" />
    </>
  );
}
