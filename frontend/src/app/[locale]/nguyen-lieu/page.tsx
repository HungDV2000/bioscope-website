import type { Metadata } from "next";
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
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: { type?: string };
}) {
  const { locale } = params;
  const t = getDictionary(locale);
  const initialType =
    searchParams.type === "supplement" || searchParams.type === "cosmetic"
      ? searchParams.type
      : undefined;

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
      <IngredientCatalog
        ingredients={ingredients}
        locale={locale}
        initialType={initialType}
      />
      <CtaBand locale={locale} />
      <div className="pb-8" />
    </>
  );
}
