"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function ContactForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const labels =
    locale === "vi"
      ? {
          name: "Họ và tên",
          company: "Công ty",
          email: "Email",
          phone: "Số điện thoại",
          subject: "Lĩnh vực quan tâm",
          message: "Nội dung",
          success: "Cảm ơn bạn! Yêu cầu đã được gửi. Bioscope sẽ liên hệ sớm.",
          subjects: ["Nguyên liệu TPCN", "Nguyên liệu mỹ phẩm", "Dịch vụ ODM", "Khác"],
        }
      : {
          name: "Full name",
          company: "Company",
          email: "Email",
          phone: "Phone",
          subject: "Area of interest",
          message: "Message",
          success: "Thank you! Your request has been sent. Bioscope will contact you soon.",
          subjects: ["Supplement ingredients", "Cosmetic ingredients", "ODM services", "Other"],
        };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: POST {NEXT_PUBLIC_CMS_URL}/api/form-submissions khi tích hợp Payload
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary-tint/40 p-12 text-center">
        <CheckCircle2 className="h-14 w-14 text-primary" />
        <p className="mt-4 max-w-sm text-neutral-700">{labels.success}</p>
      </div>
    );
  }

  const field =
    "h-12 w-full rounded-md border border-neutral-200 bg-white px-4 text-sm outline-none transition-colors focus:border-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required placeholder={labels.name} className={field} />
        <input placeholder={labels.company} className={field} />
        <input
          required
          type="email"
          placeholder={labels.email}
          className={field}
        />
        <input placeholder={labels.phone} className={field} />
      </div>
      <select required defaultValue="" className={field}>
        <option value="" disabled>
          {labels.subject}
        </option>
        {labels.subjects.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <textarea
        required
        rows={12}
        placeholder={labels.message}
        className="w-full rounded-md border border-neutral-200 bg-white p-4 text-sm outline-none transition-colors focus:border-primary"
      />
      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
        {loading ? "..." : t.cta.send}
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
