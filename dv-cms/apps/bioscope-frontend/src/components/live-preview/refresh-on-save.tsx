'use client'

/**
 * Payload Live Preview integration. When the site runs inside the admin's Live
 * Preview iframe, this listens (via postMessage) for the document being saved
 * and refreshes the Next route so the preview shows the new content. Inert
 * during normal browsing.
 */

import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

export function RefreshOnSave({ serverURL }: { serverURL: string }) {
  const router = useRouter()
  return <PayloadRefreshRouteOnSave serverURL={serverURL} refresh={() => router.refresh()} />
}
