import fs from 'fs/promises'
import path from 'path'
import type { Payload } from 'payload'

import { DEFAULT_MANIFEST, LANGUAGES_SLUG } from '../lib/constants.js'
import { isMissingDbTableError } from '../lib/env.js'
import type { LanguageDoc, LocalesManifest, PublicLocale } from '../types.js'

export function getDefaultLocalesManifest(): LocalesManifest {
  return {
    defaultLocale: DEFAULT_MANIFEST.defaultLocale,
    fallback: DEFAULT_MANIFEST.fallback,
    locales: DEFAULT_MANIFEST.locales.map((l) => ({ ...l })),
  }
}

export function docToManifestEntry(doc: LanguageDoc): LocalesManifest['locales'][number] {
  return {
    code: doc.code,
    label: doc.label,
    rtl: Boolean(doc.rtl),
    fallbackLocale: doc.fallbackLocale || null,
  }
}

export function docToPublicLocale(doc: LanguageDoc): PublicLocale {
  return {
    code: doc.code,
    label: doc.label,
    nativeLabel: doc.nativeLabel ?? undefined,
    isDefault: Boolean(doc.isDefault),
    rtl: Boolean(doc.rtl),
    fallbackLocale: doc.fallbackLocale ?? undefined,
    flag: doc.flag ?? undefined,
  }
}

export async function buildManifestFromPayload(payload: Payload): Promise<LocalesManifest> {
  try {
    const result = await payload.find({
      collection: LANGUAGES_SLUG,
      where: { enabled: { equals: true } },
      sort: 'sortOrder',
      limit: 100,
      overrideAccess: true,
    })

    const docs = result.docs as LanguageDoc[]

    if (!docs.length) {
      return getDefaultLocalesManifest()
    }

    const defaultDoc = docs.find((d) => d.isDefault) ?? docs[0]!

    return {
      defaultLocale: defaultDoc.code,
      fallback: true,
      locales: docs.map(docToManifestEntry),
    }
  } catch (err) {
    if (isMissingDbTableError(err)) return getDefaultLocalesManifest()
    throw err
  }
}

export async function buildPublicLocales(payload: Payload): Promise<PublicLocale[]> {
  const result = await payload.find({
    collection: LANGUAGES_SLUG,
    where: { enabled: { equals: true } },
    sort: 'sortOrder',
    limit: 100,
    overrideAccess: true,
  })

  return (result.docs as LanguageDoc[]).map(docToPublicLocale)
}

export async function writeManifest(manifest: LocalesManifest, filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')
}

export async function readManifest(filePath: string): Promise<LocalesManifest | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as LocalesManifest
  } catch {
    return null
  }
}
