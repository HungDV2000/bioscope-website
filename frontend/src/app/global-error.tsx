"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#F4F8F6",
          color: "#1A2B24",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Đã xảy ra lỗi hệ thống
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#6B7A72", maxWidth: 420 }}>
            Vui lòng thử tải lại trang.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: 9999,
              border: "none",
              background: "#098F50",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
