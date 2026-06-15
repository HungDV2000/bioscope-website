import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <Badge className="mb-4 uppercase">{eyebrow}</Badge>
      )}
      <h2 className="text-3xl font-bold leading-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
