import type { Metadata } from "next";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: "Chính sách bảo mật thông tin của Công ty Cổ phần Bioscope Việt Nam.",
};

const sections = {
  vi: [
    { h: "1. Thông tin chúng tôi thu thập", p: "Bioscope thu thập thông tin bạn cung cấp khi liên hệ, đăng ký tài khoản B2B hoặc nhận bản tin, bao gồm họ tên, email, số điện thoại và thông tin doanh nghiệp." },
    { h: "2. Mục đích sử dụng", p: "Thông tin được sử dụng để tư vấn sản phẩm, xử lý yêu cầu, gửi báo giá, tài liệu kỹ thuật và cập nhật thông tin ngành mà bạn quan tâm." },
    { h: "3. Bảo mật thông tin", p: "Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân khỏi truy cập, tiết lộ hoặc thay đổi trái phép." },
    { h: "4. Chia sẻ với bên thứ ba", p: "Bioscope không bán hoặc cho thuê thông tin cá nhân của bạn. Dữ liệu chỉ được chia sẻ khi có sự đồng ý hoặc theo yêu cầu của pháp luật." },
    { h: "5. Quyền của bạn", p: "Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bằng cách liên hệ hungdv@bioscope.vn." },
  ],
  en: [
    { h: "1. Information we collect", p: "Bioscope collects information you provide when contacting us, registering a B2B account or subscribing, including name, email, phone and company details." },
    { h: "2. How we use it", p: "Information is used to advise on products, process requests, send quotes, technical documents and industry updates you are interested in." },
    { h: "3. Data security", p: "We apply appropriate technical and organisational measures to protect personal data from unauthorised access, disclosure or alteration." },
    { h: "4. Third-party sharing", p: "Bioscope does not sell or rent your personal information. Data is only shared with your consent or as required by law." },
    { h: "5. Your rights", p: "You have the right to access, correct or request deletion of your personal data by contacting hungdv@bioscope.vn." },
  ],
};

export default function PrivacyPage({
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
        title={locale === "vi" ? "Chính sách" : "Privacy"}
        titleAccent={locale === "vi" ? "bảo mật" : "policy"}
        description={
          locale === "vi"
            ? "Cập nhật lần cuối: 01/06/2026"
            : "Last updated: June 1, 2026"
        }
        breadcrumbs={[{ label: t.nav.privacy }]}
      />

      <section className="container-bs py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections[locale].map((s) => (
            <div key={s.h}>
              <h2 className="font-heading text-xl font-bold text-neutral-900">
                {s.h}
              </h2>
              <p className="mt-3 leading-relaxed text-neutral-600">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
