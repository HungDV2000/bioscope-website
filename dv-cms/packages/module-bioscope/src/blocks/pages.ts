import type { Block, Field } from 'payload'

/**
 * Section blocks for the static (non-home) pages — About, Solutions, etc.
 * Field names mirror the frontend i18n shape (messages.<page>.<section>) so the
 * page can overlay CMS values onto the static fallback, exactly like the home
 * blocks. Added to the Pages `layout` field by bioscopePlugin.
 */

const T = (name: string, label?: Record<string, string>): Field => ({ name, type: 'text', localized: true, ...(label ? { label } : {}) })
const A = (name: string, label?: Record<string, string>): Field => ({ name, type: 'textarea', localized: true, ...(label ? { label } : {}) })

// ── About page ─────────────────────────────────────────────────────────────

export const AboutMissionBlock: Block = {
  slug: 'aboutMission',
  interfaceName: 'AboutMissionBlock',
  labels: { singular: { en: 'About · Mission', vi: 'Về chúng tôi · Sứ mệnh' }, plural: { en: 'About · Mission', vi: 'Về chúng tôi · Sứ mệnh' } },
  fields: [
    {
      name: 'mission',
      type: 'array',
      label: { en: 'Mission cards (3)', vi: 'Thẻ sứ mệnh (3)' },
      admin: { description: { en: 'The three mission cards.', vi: 'Ba thẻ sứ mệnh.' } },
      fields: [T('title', { en: 'Title', vi: 'Tiêu đề' }), A('desc', { en: 'Description', vi: 'Mô tả' })],
    },
  ],
}

/** All static-page section blocks, appended to the Pages layout. */
export const PAGE_BLOCKS: Block[] = [AboutMissionBlock]

export const PAGE_BLOCK_SLUGS = PAGE_BLOCKS.map((b) => b.slug)
