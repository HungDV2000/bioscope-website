import type { Spec } from "@/lib/types";
import type { Locale } from "@/lib/utils";
import { pick } from "@/lib/utils";

export function SpecDisplay({ spec, locale }: { spec: Spec; locale: Locale }) {
  const label = pick(spec.label, locale);

  if (spec.display === "bar" && spec.percent != null) {
    return (
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          <span className="font-heading text-sm font-bold text-primary-dark">
            {spec.value}
            {spec.unit}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[#0FAE73]"
            style={{ width: `${spec.percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
      <div className="font-heading text-2xl font-bold text-primary-dark">
        {spec.value}
        {spec.unit && (
          <span className="ml-1 text-sm font-medium text-neutral-500">
            {spec.unit}
          </span>
        )}
      </div>
      <div className="mt-1 text-sm text-neutral-500">{label}</div>
    </div>
  );
}
