import fs from 'fs'
import os from 'os'
import path from 'path'
import type { Payload } from 'payload'
import sharp from 'sharp'

type Id = string | number

type SeedMediaItem = {
  slug: string
  label: string
  bg: string
  folder: string
  altVi: string
  altEn: string
  captionVi?: string
  captionEn?: string
  width?: number
  height?: number
}

const SEED_MEDIA: SeedMediaItem[] = [
  {
    slug: 'hero-lab',
    label: 'Hero · Lab',
    bg: '#0d5c3f',
    folder: 'Hero & Banners',
    altVi: 'Phòng thí nghiệm Bioscope',
    altEn: 'Bioscope research laboratory',
    captionVi: 'Ảnh hero trang chủ',
    captionEn: 'Homepage hero image',
    width: 1600,
    height: 900,
  },
  {
    slug: 'hero-ingredients',
    label: 'Hero · Ingredients',
    bg: '#1a6b4a',
    folder: 'Hero & Banners',
    altVi: 'Nguyên liệu thực phẩm chức năng',
    altEn: 'Nutraceutical ingredients',
    width: 1600,
    height: 900,
  },
  {
    slug: 'product-curcumin',
    label: 'Curcumin 95%',
    bg: '#c45c00',
    folder: 'Sản phẩm',
    altVi: 'Bột curcumin 95%',
    altEn: 'Curcumin 95% powder',
    width: 1200,
    height: 1200,
  },
  {
    slug: 'product-omega3',
    label: 'Omega-3 TG',
    bg: '#0b4f8a',
    folder: 'Sản phẩm',
    altVi: 'Dầu cá omega-3 dạng TG',
    altEn: 'Omega-3 fish oil TG',
    width: 1200,
    height: 1200,
  },
  {
    slug: 'partner-gc-rieber',
    label: 'GC Rieber Oils',
    bg: '#2f3f5f',
    folder: 'Đối tác',
    altVi: 'Logo đối tác GC Rieber Oils',
    altEn: 'GC Rieber Oils partner logo',
    width: 800,
    height: 400,
  },
  {
    slug: 'partner-phytosome',
    label: 'Phytosome',
    bg: '#5a3d8a',
    folder: 'Đối tác',
    altVi: 'Công nghệ Phytosome',
    altEn: 'Phytosome technology',
    width: 800,
    height: 400,
  },
  {
    slug: 'logo-bioscope',
    label: 'Bioscope',
    bg: '#008e4d',
    folder: 'Thương hiệu',
    altVi: 'Logo Bioscope',
    altEn: 'Bioscope logo',
    width: 640,
    height: 320,
  },
  {
    slug: 'about-factory',
    label: 'Factory',
    bg: '#3d4f42',
    folder: 'Thương hiệu',
    altVi: 'Nhà máy sản xuất',
    altEn: 'Manufacturing facility',
    width: 1400,
    height: 800,
  },
  {
    slug: 'cert-gmp',
    label: 'GMP',
    bg: '#1f4d3a',
    folder: 'Thương hiệu',
    altVi: 'Chứng nhận GMP',
    altEn: 'GMP certification badge',
    width: 600,
    height: 600,
  },
  {
    slug: 'gallery-lab-team',
    label: 'Lab team',
    bg: '#264653',
    folder: 'Thư viện',
    altVi: 'Đội ngũ R&D tại phòng lab',
    altEn: 'R&D team in the laboratory',
    width: 1200,
    height: 800,
  },
  {
    slug: 'coa-sample',
    label: 'CoA sample',
    bg: '#4a5568',
    folder: 'Tài liệu',
    altVi: 'Chứng nhận phân tích mẫu (CoA)',
    altEn: 'Sample certificate of analysis (CoA)',
    width: 800,
    height: 1100,
  },
]

const FOLDERS = ['Hero & Banners', 'Sản phẩm', 'Đối tác', 'Thương hiệu', 'Thư viện', 'Tài liệu'] as const

async function createPlaceholderImage(
  label: string,
  bg: string,
  filename: string,
  width: number,
  height: number,
): Promise<string> {
  const safe = label.replace(/[<>&'"]/g, '')
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:0.25" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="48%" font-family="Arial,Helvetica,sans-serif" font-size="${Math.max(28, Math.round(width / 22))}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" opacity="0.95">${safe}</text>
  <text x="50%" y="58%" font-family="Arial,Helvetica,sans-serif" font-size="${Math.max(16, Math.round(width / 40))}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" opacity="0.65">Bioscope seed media</text>
</svg>`

  const out = path.join(os.tmpdir(), filename)
  await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(out)
  return out
}

async function ensureFolder(payload: Payload, name: string): Promise<Id> {
  const found = await payload.find({
    collection: 'payload-folders' as never,
    where: { name: { equals: name } },
    limit: 1,
    overrideAccess: true,
  })
  if (found.totalDocs > 0) return (found.docs[0] as { id: Id }).id

  const created = await payload.create({
    collection: 'payload-folders' as never,
    data: { name, folderType: ['media'] } as never,
    overrideAccess: true,
  })
  return (created as { id: Id }).id
}

async function ensureMedia(
  payload: Payload,
  item: SeedMediaItem,
  folderId: Id,
): Promise<Id> {
  const filename = `seed-${item.slug}.webp`
  const found = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  if (found.totalDocs > 0) {
    const id = (found.docs[0] as { id: Id }).id
    await payload.update({
      collection: 'media',
      id: id as never,
      data: {
        folder: folderId,
        alt: item.altVi,
        caption: item.captionVi ?? '',
      } as never,
      locale: 'vi',
      overrideAccess: true,
    })
    await payload.update({
      collection: 'media',
      id: id as never,
      data: {
        alt: item.altEn,
        caption: item.captionEn ?? item.captionVi ?? '',
      },
      locale: 'en',
      overrideAccess: true,
    })
    return id
  }

  const filePath = await createPlaceholderImage(
    item.label,
    item.bg,
    filename,
    item.width ?? 1200,
    item.height ?? 800,
  )

  try {
    const created = await payload.create({
      collection: 'media',
      data: {
        folder: folderId,
        alt: item.altVi,
        caption: item.captionVi ?? '',
      } as never,
      locale: 'vi',
      filePath,
      overrideAccess: true,
    })
    const id = (created as { id: Id }).id
    await payload.update({
      collection: 'media',
      id: id as never,
      data: {
        alt: item.altEn,
        caption: item.captionEn ?? item.captionVi ?? '',
      },
      locale: 'en',
      overrideAccess: true,
    })
    return id
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

/** Seed thư viện ảnh mẫu (folders + placeholder WebP). Trả về id ảnh CoA nếu có. */
export async function seedMediaLibrary(payload: Payload, log: (m: string) => void): Promise<Id | null> {
  if (!payload.config.folders) {
    log('media seed skipped — folders chưa bật trong payload.config')
    return null
  }

  const folderIds = new Map<string, Id>()
  for (const name of FOLDERS) {
    folderIds.set(name, await ensureFolder(payload, name))
  }
  log(`media folders: ${FOLDERS.length}`)

  let coaId: Id | null = null
  for (const item of SEED_MEDIA) {
    const folderId = folderIds.get(item.folder)
    if (!folderId) continue
    const id = await ensureMedia(payload, item, folderId)
    if (item.slug === 'coa-sample') coaId = id
  }
  log(`media library: ${SEED_MEDIA.length} ảnh mẫu`)

  return coaId
}
