import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.avif";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "white";
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Bioscope Healthcare Innovation"
      width={200}
      height={48}
      priority
      className={cn(
        "h-10 w-auto object-contain object-left",
        variant === "white" && "brightness-0 invert",
        className
      )}
    />
  );
}
