import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Locale = "vi" | "en";

/** Lấy giá trị theo ngôn ngữ từ object song ngữ { vi, en } */
export function pick<T>(value: { vi: T; en: T }, locale: Locale): T {
  return value[locale] ?? value.vi;
}

export function formatDate(date: string, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
