import { partners } from "@/lib/data";
import type { Locale } from "@/lib/utils";

export function PartnersStrip({ locale }: { locale: Locale }) {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-12">
      <div className="container-bs">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500">
          {locale === "vi"
            ? "Đối tác cung ứng toàn cầu"
            : "Trusted global supply partners"}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center justify-center text-center"
            >
              <span className="font-heading text-lg font-bold text-neutral-700">
                {partner.name}
              </span>
              <span className="text-xs text-neutral-500">{partner.country}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
