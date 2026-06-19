"use client";

import { useEffect } from "react";
import { defaultLocale } from "@/lib/i18n";

/** Redirect / → /en/ (default locale) */
export default function RootRedirectPage() {
  useEffect(() => {
    window.location.replace(`/${defaultLocale}/`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-8 font-sans text-neutral-700">
      <p>
        Redirecting…{" "}
        <a href={`/${defaultLocale}/`} className="font-medium text-primary underline">
          Bioscope
        </a>
      </p>
    </main>
  );
}
