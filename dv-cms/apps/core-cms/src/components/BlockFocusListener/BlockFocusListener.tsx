'use client'

/**
 * BlockFocusListener — the admin side of Live Preview click-to-focus. Listens
 * for `dv-focus-block` messages from the preview iframe, maps the clicked block
 * id to its row in the `layout` blocks field, then scrolls to + briefly
 * highlights that block row in the form. Renders nothing.
 */

import { useEffect } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

type RowLike = { id?: string | number }

export const BlockFocusListener: React.FC = () => {
  const [fields] = useAllFormFields()

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data as { type?: string; blockId?: string } | undefined
      if (!data || data.type !== 'dv-focus-block' || !data.blockId) return

      // Rows of the `layout` blocks field, in order.
      const layout = (fields as Record<string, { rows?: RowLike[] }>)?.layout
      const rows = layout?.rows ?? []
      let index = rows.findIndex((r) => String(r?.id) === String(data.blockId))
      if (index < 0) return

      const row = document.getElementById(`layout-row-${index}`)
      if (!row) return
      row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Brief highlight so the user sees which block was selected.
      const prev = row.style.boxShadow
      row.style.transition = 'box-shadow .2s'
      row.style.boxShadow = '0 0 0 2px #008e4d'
      setTimeout(() => {
        row.style.boxShadow = prev
      }, 1400)
    }

    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [fields])

  return null
}

export default BlockFocusListener
