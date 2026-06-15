import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Chỉ dùng khi chạy Node (PM2 / Docker), KHÔNG dùng với static export.
 * Copy vào: src/app/api/revalidate/route.ts
 *
 * Payload CMS afterChange hook:
 *   POST /api/revalidate?secret=...&path=/vi/nguyen-lieu
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }
  if (!path) {
    return NextResponse.json({ message: "Missing path" }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}
