import type { Metadata } from "next";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { Accordion } from "@/components/shared/accordion";
import { CtaBand } from "@/components/shared/cta-band";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description: "Giải đáp các câu hỏi thường gặp về nguyên liệu, dịch vụ ODM và hợp tác với Bioscope.",
};

const faqs = {
  vi: [
    { q: "Bioscope cung cấp những loại nguyên liệu nào?", a: "Chúng tôi cung cấp nguyên liệu cho cả Thực phẩm chức năng (TPCN) và Mỹ phẩm, nhập khẩu chuẩn hóa từ các nhà sản xuất uy tín tại Nhật Bản, Thụy Sĩ, Argentina và nhiều quốc gia khác." },
    { q: "Số lượng đặt hàng tối thiểu (MOQ) là bao nhiêu?", a: "MOQ phụ thuộc vào từng loại nguyên liệu. Vui lòng liên hệ đội ngũ kinh doanh để nhận báo giá và thông tin chi tiết phù hợp với nhu cầu của bạn." },
    { q: "Dịch vụ ODM của Bioscope bao gồm những gì?", a: "Dịch vụ ODM trọn gói gồm: nghiên cứu & phát triển công thức, gia công sản xuất đạt chuẩn GMP, tư vấn công bố pháp lý và thiết kế bao bì." },
    { q: "Bioscope có hỗ trợ thủ tục công bố sản phẩm không?", a: "Có. Chúng tôi hỗ trợ trọn gói hồ sơ công bố TPCN và mỹ phẩm theo đúng quy định pháp luật hiện hành." },
    { q: "Làm sao để truy cập tài liệu kỹ thuật (COA, spec sheet)?", a: "Khách hàng doanh nghiệp có thể đăng ký tài khoản B2B để truy cập tài liệu kỹ thuật, COA và báo giá sau khi được phê duyệt." },
  ],
  en: [
    { q: "What types of ingredients does Bioscope supply?", a: "We supply ingredients for both Dietary Supplements and Cosmetics, standardised and imported from reputable manufacturers in Japan, Switzerland, Argentina and more." },
    { q: "What is the minimum order quantity (MOQ)?", a: "MOQ varies by ingredient. Please contact our sales team for a quote and details tailored to your needs." },
    { q: "What does Bioscope's ODM service include?", a: "Our end-to-end ODM service covers formulation R&D, GMP-certified manufacturing, regulatory registration consultancy and packaging design." },
    { q: "Does Bioscope support product registration?", a: "Yes. We provide full support for supplement and cosmetic declaration dossiers in compliance with current regulations." },
    { q: "How can I access technical documents (COA, spec sheets)?", a: "Business customers can register for a B2B account to access technical documents, COAs and quotes after approval." },
  ],
};

export default function FaqPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = getDictionary(locale);

  return (
    <>
      <PageHeader
        locale={locale}
        eyebrow={t.nav.faq}
        title={
          locale === "vi" ? "Câu hỏi thường gặp" : "Frequently asked questions"
        }
        description={
          locale === "vi"
            ? "Những thắc mắc phổ biến về nguyên liệu, dịch vụ và quy trình hợp tác."
            : "Common questions about our ingredients, services and partnership process."
        }
        breadcrumbs={[{ label: t.nav.faq }]}
      />

      <section className="container-bs py-16">
        <div className="mx-auto max-w-3xl">
          <Accordion items={faqs[locale]} />
        </div>
      </section>

      <div className="pb-12">
        <CtaBand locale={locale} />
      </div>
    </>
  );
}
