import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "primary" | "accent" | "neutral";
}) {
  const tones = {
    primary: "bg-primary-tint text-primary-dark",
    accent: "bg-accent-tint text-accent-dark",
    neutral: "bg-neutral-50 text-neutral-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
