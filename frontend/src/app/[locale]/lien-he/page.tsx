import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { PageHeader } from "@/components/shared/page-header";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ với Công ty Cổ phần Bioscope Việt Nam để được tư vấn nguyên liệu và giải pháp công thức.",
};

export default function ContactPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const t = getDictionary(locale);

  const info = [
    {
      icon: MapPin,
      label: locale === "vi" ? "Địa chỉ" : "Address",
      value: "Tầng 5, Tòa nhà Bioscope, Quận 1, TP. Hồ Chí Minh",
    },
    { icon: Phone, label: locale === "vi" ? "Hotline" : "Hotline", value: "+84 28 3999 9999" },
    { icon: Mail, label: "Email", value: "info@bioscope.vn" },
    {
      icon: Clock,
      label: locale === "vi" ? "Giờ làm việc" : "Working hours",
      value: locale === "vi" ? "Thứ 2 - Thứ 6, 8:00 - 17:30" : "Mon - Fri, 8:00 - 17:30",
    },
  ];

  return (
    <>
      <PageHeader
        locale={locale}
        eyebrow={t.nav.contact}
        title={
          locale === "vi" ? "Kết nối với Bioscope" : "Get in touch with Bioscope"
        }
        description={
          locale === "vi"
            ? "Để lại thông tin, đội ngũ chuyên gia của chúng tôi sẽ liên hệ tư vấn trong thời gian sớm nhất."
            : "Leave your details and our experts will reach out to you as soon as possible."
        }
        breadcrumbs={[{ label: t.nav.contact }]}
      />

      <section className="container-bs py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          {/* Info */}
          <div>
            <h2 className="font-heading text-2xl font-bold">
              {t.common.quickContact}
            </h2>
            <ul className="mt-7 space-y-6">
              {info.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm text-neutral-500">{item.label}</div>
                      <div className="font-medium text-neutral-900">
                        {item.value}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200">
              <iframe
                title="Bioscope map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=106.69%2C10.77%2C106.71%2C10.79&layer=mapnik"
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-card">
            <h2 className="font-heading text-2xl font-bold">
              {locale === "vi" ? "Gửi yêu cầu tư vấn" : "Send a consultation request"}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {locale === "vi"
                ? "Vui lòng điền đầy đủ thông tin bên dưới."
                : "Please fill in the details below."}
            </p>
            <div className="mt-6">
              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
