"use client";

import { useEffect } from "react";

/** Redirect / → /vi/ (thay middleware khi deploy static) */
export default function RootRedirectPage() {
  useEffect(() => {
    window.location.replace("/vi/");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-8 font-sans text-neutral-700">
      <p>
        Đang chuyển hướng…{" "}
        <a href="/vi/" className="font-medium text-primary underline">
          Bioscope Vietnam
        </a>
      </p>
    </main>
  );
}
