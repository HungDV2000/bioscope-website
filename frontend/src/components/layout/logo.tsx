import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC =
  "https://static.wixstatic.com/media/c303b2_424663974fc1406dbf99262fde243a25~mv2.png";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "white";
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={LOGO_SRC}
        alt="Bioscope Vietnam"
        width={160}
        height={40}
        priority
        // Trên nền tối (footer / panel B2B) chuyển logo về dạng trắng để đảm bảo tương phản
        className={cn(
          "h-9 w-auto object-contain",
          variant === "white" && "brightness-0 invert"
        )}
      />
    </span>
  );
}
