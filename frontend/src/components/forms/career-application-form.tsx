"use client";

import { useState } from "react";
import { Send, CheckCircle2, Paperclip } from "lucide-react";
import type { Locale } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CareerApplicationForm({
  locale,
  jobTitle,
}: {
  locale: Locale;
  jobTitle: string;
}) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvName, setCvName] = useState("");

  const labels =
    locale === "vi"
      ? {
          position: "Vị trí ứng tuyển",
          name: "Họ và tên",
          email: "Email",
          phone: "Số điện thoại",
          linkedin: "LinkedIn / Portfolio (tuỳ chọn)",
          cv: "Đính kèm CV",
          cvHint: "PDF, DOC — tối đa 5MB",
          message: "Thư giới thiệu",
          submit: "Gửi hồ sơ",
          success:
            "Cảm ơn bạn đã ứng tuyển! Bộ phận Nhân sự Bioscope sẽ liên hệ trong 5–7 ngày làm việc.",
        }
      : {
          position: "Position",
          name: "Full name",
          email: "Email",
          phone: "Phone",
          linkedin: "LinkedIn / Portfolio (optional)",
          cv: "Attach CV",
          cvHint: "PDF, DOC — max 5MB",
          message: "Cover letter",
          submit: "Submit application",
          success:
            "Thank you for applying! Bioscope HR will contact you within 5–7 business days.",
        };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: POST {NEXT_PUBLIC_CMS_URL}/api/career-applications khi tích hợp Payload
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary-tint/40 p-10 text-center sm:p-12">
        <CheckCircle2 className="h-14 w-14 text-primary" />
        <p className="mt-4 max-w-sm text-neutral-700">{labels.success}</p>
      </div>
    );
  }

  const field =
    "h-12 w-full rounded-md border border-neutral-200 bg-white px-4 text-sm outline-none transition-colors focus:border-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {labels.position}
        </label>
        <input
          readOnly
          value={jobTitle}
          className={`${field} cursor-default bg-neutral-50 text-neutral-800`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input required placeholder={labels.name} className={field} />
        <input
          required
          type="email"
          placeholder={labels.email}
          className={field}
        />
        <input required placeholder={labels.phone} className={field} />
        <input placeholder={labels.linkedin} className={field} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {labels.cv}
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary-tint/30">
          <Paperclip className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm text-neutral-600">
            {cvName || labels.cvHint}
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => setCvName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      <textarea
        rows={5}
        placeholder={labels.message}
        className="w-full rounded-md border border-neutral-200 bg-white p-4 text-sm outline-none transition-colors focus:border-primary"
      />

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "..." : labels.submit}
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
