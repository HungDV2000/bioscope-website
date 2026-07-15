// AiGenerateWorker.ts — chạy nền sau khi job được tạo.
// Hỗ trợ đa dạng file types: PDF, Google Docs, Sheets, Images, Text, CSV.

import type { Payload } from 'payload'
import { google } from 'googleapis'
import {
  extractTextFromPdf,
  extractTextFromImageUsingVision,
  truncateForAI,
} from '../lib/openaiService.js'
import {
  getOpenAIClient,
  generateIngredientContent,
  generateAndUploadFeaturedImage,
} from '../lib/openaiService.js'
import type { GeneratedContent, Locale } from '../lib/openaiService.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AiGenerateLog = { ts: string; level: 'info' | 'warn' | 'error'; message: string }
type AiGenerateTotals = {
  filesFound: number
  filesDownloaded: number
  filesExtracted: number
  filesSkipped: number
  errors: number
}

type JobData = {
  id: string
  status: string
  phase: string
  ingredientId: string
  ingredientName: string
  locale: Locale
  totals: AiGenerateTotals
  logs: AiGenerateLog[]
  result?: unknown
  startedAt?: string
  finishedAt?: string
  errorMessage?: string
}

export type DriveFileEntry = {
  fileId: string
  fileName: string
  mimeType: string
  webViewLink: string
  webContentLink: string
  size: string
  modifiedTime: string | null
}

type WorkerInput = {
  jobId: string
  ingredientId: string
  locale: Locale
  payload: Payload
}

// ---------------------------------------------------------------------------
// File type detection
// ---------------------------------------------------------------------------

type FileType = 'pdf_text' | 'pdf_image' | 'image' | 'google_doc' | 'google_sheet' | 'google_slide' | 'text' | 'csv' | 'unknown'

function detectFileType(mimeType: string, fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const lower = mimeType.toLowerCase()

  // Google Apps native types
  if (lower === 'application/vnd.google-apps.document') return 'google_doc'
  if (lower === 'application/vnd.google-apps.spreadsheet') return 'google_sheet'
  if (lower === 'application/vnd.google-apps.presentation') return 'google_slide'

  // Google Apps exported formats
  if (lower.includes('application/vnd.google-apps')) return 'unknown'

  // PDF
  if (lower === 'application/pdf' || ext === 'pdf') {
    // Will attempt text extraction first; if empty, treat as image-based
    return 'pdf_text'
  }

  // Images
  if (lower.startsWith('image/')) return 'image'

  // Text
  if (lower.startsWith('text/')) return 'text'
  if (['application/json', 'application/xml'].includes(lower)) return 'text'
  if (['md', 'txt', 'rtf', 'log'].includes(ext)) return 'text'

  // CSV
  if (lower === 'text/csv' || ext === 'csv') return 'csv'
  if (lower.includes('spreadsheet') || ext === 'xlsx' || ext === 'xls') return 'csv'

  return 'unknown'
}

function getMimeTypeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.google-apps.document': 'Google Docs',
    'application/vnd.google-apps.spreadsheet': 'Google Sheets',
    'application/vnd.google-apps.presentation': 'Google Slides',
  }
  return map[mimeType] ?? mimeType
}

// ---------------------------------------------------------------------------
// Drive client
// ---------------------------------------------------------------------------

async function getDriveClient() {
  let credentials: object
  try {
    const { readFile } = await import('node:fs/promises')
    const credPath =
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      `${process.cwd()}/credentials/service-account.json`
    credentials = JSON.parse(await readFile(credPath, 'utf8'))
  } catch {
    throw new Error(
      'Google service account credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS env var.',
    )
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  return google.drive({ version: 'v3', auth })
}

// ---------------------------------------------------------------------------
// Download file from Drive (all types)
// ---------------------------------------------------------------------------

async function downloadDriveFile(
  driveClient: Awaited<ReturnType<typeof getDriveClient>>,
  file: DriveFileEntry,
): Promise<{ buffer: Buffer; detectedType: FileType } | null> {
  const detectedType = detectFileType(file.mimeType, file.fileName)

  // Google Docs/Sheets/Slides → export
  if (detectedType === 'google_doc') {
    try {
      const response = await driveClient.files.export(
        { fileId: file.fileId, mimeType: 'text/plain' },
        { responseType: 'arraybuffer' },
      )
      return { buffer: Buffer.from(response.data as ArrayBuffer), detectedType }
    } catch {
      return null
    }
  }

  if (detectedType === 'google_sheet') {
    try {
      const response = await driveClient.files.export(
        { fileId: file.fileId, mimeType: 'text/csv' },
        { responseType: 'arraybuffer' },
      )
      return { buffer: Buffer.from(response.data as ArrayBuffer), detectedType }
    } catch {
      return null
    }
  }

  if (detectedType === 'google_slide') {
    try {
      const response = await driveClient.files.export(
        { fileId: file.fileId, mimeType: 'text/plain' },
        { responseType: 'arraybuffer' },
      )
      return { buffer: Buffer.from(response.data as ArrayBuffer), detectedType }
    } catch {
      return null
    }
  }

  // Direct download for everything else
  try {
    const response = await driveClient.files.get(
      { fileId: file.fileId, alt: 'media' },
      { responseType: 'arraybuffer' },
    )
    return { buffer: Buffer.from(response.data as ArrayBuffer), detectedType }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Extract text from file based on type
// ---------------------------------------------------------------------------

async function extractTextFromFile(
  file: DriveFileEntry,
  downloaded: { buffer: Buffer; detectedType: FileType },
  logs: AiGenerateLog[],
): Promise<string> {
  const { buffer, detectedType } = downloaded

  switch (detectedType) {
    case 'pdf_text': {
      const text = await extractTextFromPdf(buffer)
      // If empty, it might be a scanned PDF → try vision
      if (!text.trim()) {
        addLog(logs, 'warn', `PDF "${file.fileName}" không có text — thử GPT-4o Vision...`)
        return await extractTextFromImageUsingVision(buffer, file.fileName)
      }
      return text
    }

    case 'pdf_image':
    case 'image': {
      // Images → GPT-4o Vision
      return await extractTextFromImageUsingVision(buffer, file.fileName)
    }

    case 'google_doc':
    case 'text': {
      // Try UTF-8, fallback to Latin-1
      let text = buffer.toString('utf8')
      if (!text.trim() || text.includes('�')) {
        text = buffer.toString('latin1')
      }
      return text
    }

    case 'google_sheet':
    case 'csv': {
      // CSV → simple text extraction, keep structure
      return buffer.toString('utf8')
    }

    case 'google_slide': {
      return buffer.toString('utf8')
    }

    default:
      addLog(logs, 'warn', `Không xử lý được loại file: ${file.fileName} (${file.mimeType})`)
      return ''
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addLog(logs: AiGenerateLog[], level: AiGenerateLog['level'], message: string): void {
  logs.push({ ts: new Date().toISOString(), level, message })
}

async function updateJob(
  payload: Payload,
  jobId: string,
  data: Partial<JobData>,
): Promise<void> {
  try {
    await payload.update({
      collection: 'ai-generate-jobs',
      id: jobId,
      data: data as Record<string, unknown>,
      overrideAccess: true,
    })
  } catch {
    // Non-fatal — don't crash worker
  }
}

// ---------------------------------------------------------------------------
// Main worker
// ---------------------------------------------------------------------------

/** Convert plain text (paragraphs split by blank lines) into a Lexical richText value. */
function textToLexical(text?: string): Record<string, unknown> {
  const paras = (text ?? '')
    .split(/\n{2,}|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const children = (paras.length ? paras : ['']).map((p) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    children: p
      ? [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: p, version: 1 }]
      : [],
  }))
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}

export async function runAiGenerate(input: WorkerInput): Promise<void> {
  const { jobId, ingredientId, locale, payload } = input
  const logs: AiGenerateLog[] = []

  addLog(logs, 'info', `Job started — ingredient: ${ingredientId}, locale: ${locale}`)

  try {
    // ── 1. Load ingredient ────────────────────────────────────────────────
    await updateJob(payload, jobId, {
      status: 'downloading',
      phase: 'Đang tải thông tin nguyên liệu...',
      startedAt: new Date().toISOString(),
      logs,
    })

    const ingredient = await payload.findByID({
      collection: 'ingredients',
      id: ingredientId,
      depth: 1,
      overrideAccess: true,
    })

    const nameField = ingredient.name as { vi?: string; en?: string } | string | undefined
    const ingredientName =
      typeof nameField === 'object' && nameField !== null
        ? (nameField.vi ?? nameField.en ?? ingredientId)
        : String(nameField ?? ingredientId)

    addLog(logs, 'info', `Loaded ingredient: ${ingredientName}`)

    // ── 2. Get drive files ────────────────────────────────────────────────
    const driveFiles = ((ingredient.driveFiles as DriveFileEntry[] | null) ?? []) as DriveFileEntry[]

    const totals: AiGenerateTotals = {
      filesFound: driveFiles.length,
      filesDownloaded: 0,
      filesExtracted: 0,
      filesSkipped: 0,
      errors: 0,
    }

    // Group by type for logging
    const typeSummary = driveFiles.reduce(
      (acc, f) => {
        const t = detectFileType(f.mimeType, f.fileName)
        acc[t] = (acc[t] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const summaryStr = Object.entries(typeSummary)
      .map(([t, c]) => `${c} ${t}`)
      .join(', ')
    addLog(logs, 'info', `Found ${driveFiles.length} files: ${summaryStr || 'none'}`)

    await updateJob(payload, jobId, {
      status: 'downloading',
      phase: `Đang tải ${driveFiles.length} file từ Drive...`,
      totals,
      logs,
    })

    // ── 3. Download + extract all file types ─────────────────────────────
    const extractedContents: string[] = []
    const googleDrive = await getDriveClient()

    for (let i = 0; i < driveFiles.length; i++) {
      const file = driveFiles[i]
      const fileType = detectFileType(file.mimeType, file.fileName)
      const typeLabel = getMimeTypeLabel(file.mimeType)

      addLog(logs, 'info', `Tải file ${i + 1}/${driveFiles.length}: ${file.fileName} [${typeLabel}]`)

      await updateJob(payload, jobId, {
        phase: `Tải file ${i + 1}/${driveFiles.length}: ${file.fileName}`,
        logs,
      })

      const downloaded = await downloadDriveFile(googleDrive, file)

      if (!downloaded) {
        addLog(logs, 'warn', `Không tải được file: ${file.fileName}`)
        totals.errors++
        totals.filesSkipped++
        await updateJob(payload, jobId, { totals, logs })
        continue
      }

      totals.filesDownloaded++

      // Skip unsupported/unknown types
      if (downloaded.detectedType === 'unknown') {
        addLog(logs, 'info', `Bỏ qua loại file không hỗ trợ: ${file.fileName}`)
        totals.filesSkipped++
        await updateJob(payload, jobId, { totals, logs })
        continue
      }

      // Extract text
      try {
        const text = await extractTextFromFile(file, downloaded, logs)

        if (text.trim().length > 20) {
          const preview = text.trim().slice(0, 100).replace(/\n/g, ' ')
          extractedContents.push(
            `=== [${typeLabel}] ${file.fileName} ===\n${text}`,
          )
          totals.filesExtracted++
          addLog(
            logs,
            'info',
            `✓ Trích xuất: ${file.fileName} (${text.trim().length} ký tự) — "${preview}..."`,
          )
        } else if (text.trim().length > 0) {
          addLog(
            logs,
            'warn',
            `File quá ngắn (${text.trim().length} ký tự): ${file.fileName}`,
          )
          totals.filesSkipped++
        } else {
          addLog(logs, 'warn', `Không trích xuất được nội dung: ${file.fileName}`)
          totals.filesSkipped++
        }
      } catch (err) {
        addLog(logs, 'warn', `Lỗi trích xuất ${file.fileName}: ${err}`)
        totals.errors++
      }

      await updateJob(payload, jobId, { totals, logs })
    }

    const combinedDriveContent = truncateForAI(extractedContents.join('\n\n'), 80_000)

    if (extractedContents.length === 0) {
      addLog(
        logs,
        'warn',
        'Không trích xuất được nội dung từ file nào. Sẽ dùng thông tin cơ bản.',
      )
    } else {
      addLog(logs, 'info', `Đã trích xuất ${extractedContents.length} file(s)`)
    }

    // ── 4. Update to generating phase ───────────────────────────────────
    await updateJob(payload, jobId, {
      status: 'generating_content',
      phase: 'Đang gọi AI sinh nội dung...',
      totals,
      logs,
    })

    // ── 5. Gather ingredient metadata ──────────────────────────────────
    let categoryName = 'Không xác định'
    if (ingredient.category) {
      const catRel = ingredient.category as { name?: unknown } | null
      if (catRel && typeof catRel === 'object' && 'name' in catRel) {
        const catNameField = catRel.name as { vi?: string } | string | undefined
        categoryName =
          typeof catNameField === 'object' && catNameField !== null
            ? (catNameField.vi ?? String(catNameField))
            : String(catNameField ?? '')
      }
    }

    const ingredientMeta = {
      name: ingredientName,
      type: (ingredient.type as string | undefined) ?? 'both',
      inci: (ingredient.inci as string | undefined) ?? '',
      originCountry: (ingredient.originCountry as string | undefined) ?? '',
      brandName: (ingredient.brandName as string | undefined) ?? '',
      category: categoryName,
      driveFiles: driveFiles.map((f) => ({
        fileName: f.fileName,
        mimeType: f.mimeType,
        fileType: detectFileType(f.mimeType, f.fileName),
      })),
    }

    // ── 6. Generate content with GPT-4o ───────────────────────────────────
    addLog(logs, 'info', `Calling GPT-4o for "${ingredientName}"...`)
    const contentResult = await generateIngredientContent(ingredientMeta, combinedDriveContent)

    if (!contentResult.ok) {
      throw new Error(`GPT-4o generation failed: ${contentResult.error}`)
    }

    const generatedContent = contentResult.content
    addLog(
      logs,
      'info',
      `Content generated: ${generatedContent.benefits.length} benefits, ${generatedContent.applications.length} applications`,
    )

    // ── 7. Generate featured image with DALL·E 3 ──────────────────────────
    let featuredImage: { id: string | number; url: string } | null = null

    if (generatedContent.imagePrompt) {
      addLog(logs, 'info', 'Calling DALL·E 3 to generate featured image...')
      await updateJob(payload, jobId, {
        status: 'generating_image',
        phase: 'Đang gọi DALL·E 3 sinh hình ảnh...',
        totals,
        logs,
      })

      try {
        featuredImage = await generateAndUploadFeaturedImage(
          ingredientName,
          locale,
          generatedContent.imagePrompt,
          async (buffer, filename, mimeType, alt) => {
            addLog(logs, 'info', `Uploading image: ${filename}`)
            const media = await payload.create({
              collection: 'media',
              data: { alt: { vi: alt, en: alt } },
              file: { buffer, filename, mimeType },
              overrideAccess: true,
            })
            addLog(logs, 'info', `Image uploaded: ${media.id}`)
            return {
              id: media.id,
              url: (media.url as string) ?? `/_uploads/media/${filename}`,
            }
          },
        )
      } catch (imgErr) {
        const msg = imgErr instanceof Error ? imgErr.message : String(imgErr)
        addLog(logs, 'error', `Tạo ảnh thất bại: ${msg}`)
      }

      if (featuredImage) {
        addLog(logs, 'info', `Featured image generated: ${featuredImage.url}`)
      } else {
        addLog(logs, 'warn', 'Không tạo được ảnh — tiếp tục không có ảnh đại diện')
      }
    }

    // ── 7.5 Write generated content back to the ingredient (correct structure) ──
    await updateJob(payload, jobId, { status: 'saving', phase: 'Đang lưu nội dung vào nguyên liệu...', logs })

    const otherLocale = locale === 'vi' ? 'en' : 'vi'
    const gc = generatedContent

    // Normalized product name (AI strips numbering / internal suffixes like "(TM)",
    // "- TQ"). Fall back to the original name so `name` (required, localized) is
    // never empty in either locale.
    const nameFor = (l: 'vi' | 'en'): string =>
      (gc.name?.[l]?.trim() || gc.name?.vi?.trim() || gc.name?.en?.trim() || ingredientName)

    const seoFor = (l: 'vi' | 'en') => {
      const seo: Record<string, unknown> = {}
      if (gc.seoTitle?.[l]) seo.title = gc.seoTitle[l]
      if (gc.seoDescription?.[l]) seo.description = gc.seoDescription[l]
      return Object.keys(seo).length ? seo : undefined
    }

    const primaryData: Record<string, unknown> = { name: nameFor(locale) }
    if (gc.subtitle?.[locale]) primaryData.subtitle = gc.subtitle[locale]
    if (gc.description?.[locale]) primaryData.description = textToLexical(gc.description[locale])
    if (gc.inci?.[locale]) primaryData.inci = gc.inci[locale]
    if (gc.suggestedDosage) primaryData.suggestedDosage = gc.suggestedDosage
    if (gc.benefits?.length) primaryData.benefits = gc.benefits
    if (gc.applications?.length) primaryData.applications = gc.applications
    if (gc.badges?.length) primaryData.badges = gc.badges // not localized
    if (gc.originCountry) primaryData.originCountry = gc.originCountry // not localized
    if (gc.tag) primaryData.tag = gc.tag // not localized
    if (seoFor(locale)) primaryData.seo = seoFor(locale)
    if (featuredImage) primaryData.featuredImage = featuredImage.id

    await payload.update({ collection: 'ingredients', id: ingredientId, data: primaryData, locale, overrideAccess: true })

    // Second language for the bilingual text fields.
    const otherData: Record<string, unknown> = { name: nameFor(otherLocale) }
    if (gc.subtitle?.[otherLocale]) otherData.subtitle = gc.subtitle[otherLocale]
    if (gc.description?.[otherLocale]) otherData.description = textToLexical(gc.description[otherLocale])
    if (gc.inci?.[otherLocale]) otherData.inci = gc.inci[otherLocale]
    if (seoFor(otherLocale)) otherData.seo = seoFor(otherLocale)
    await payload.update({ collection: 'ingredients', id: ingredientId, data: otherData, locale: otherLocale, overrideAccess: true })

    // Specs — a non-localized array whose `label` subfield IS localized. Write the
    // array ONCE in the default locale (vi) to create the rows and satisfy the
    // required label. Then, to add the EN label, re-read the created rows and
    // update by row `id` (rewriting the array without ids would drop the required
    // vi label and fail validation with "Specs N > Label").
    // BUILD MARKER — if this line is missing from the job log, the running build
    // is stale (rebuild required). specs-writeback: v3
    addLog(logs, 'info', 'specs-writeback v3')
    try {
    if (gc.specs?.length) {
      // Diagnostic: log the raw shape of the first spec so we can see exactly how
      // the model returned `label` if validation still complains.
      addLog(logs, 'info', `Specs thô từ AI (mẫu đầu): ${JSON.stringify(gc.specs[0])}`)
      // `label` may arrive as a localized object {vi,en} OR (depending on the
      // model) as a plain string. Resolve both, per locale.
      const labelFor = (raw: unknown, l: 'vi' | 'en'): string => {
        if (typeof raw === 'string') return raw.trim()
        if (raw && typeof raw === 'object') {
          const o = raw as { vi?: string; en?: string }
          return ((l === 'en' ? o.en || o.vi : o.vi || o.en) || '').trim()
        }
        return ''
      }
      // Keep only specs that have a non-empty label in the default locale (vi) and
      // a value — an empty required `label` is what triggers "Specs N > Label".
      const cleaned = gc.specs.filter(
        (s) => s && s.value != null && String(s.value).trim() && labelFor(s.label, 'vi'),
      )
      if (cleaned.length) {
        await payload.update({
          collection: 'ingredients',
          id: ingredientId,
          data: {
            name: nameFor('vi'),
            specs: cleaned.map((s) => ({
              label: labelFor(s.label, 'vi'),
              value: String(s.value),
              unit: s.unit || undefined,
            })),
          },
          locale: 'vi',
          overrideAccess: true,
        })

        // Add EN labels by matching the freshly-created row ids.
        try {
          const fresh = await payload.findByID({ collection: 'ingredients', id: ingredientId, locale: 'en', depth: 0 })
          const rows = (fresh?.specs as Array<{ id?: string }> | undefined) ?? []
          if (rows.length === cleaned.length) {
            await payload.update({
              collection: 'ingredients',
              id: ingredientId,
              data: {
                name: nameFor('en'),
                specs: rows.map((r, i) => ({
                  id: r.id,
                  // Fall back to the vi label so the required en label is never empty.
                  label: labelFor(cleaned[i].label, 'en') || labelFor(cleaned[i].label, 'vi'),
                  value: String(cleaned[i].value),
                  unit: cleaned[i].unit || undefined,
                })),
              },
              locale: 'en',
              overrideAccess: true,
            })
          }
        } catch (specErr) {
          addLog(logs, 'warn', `Không ghi được label EN cho specs: ${specErr instanceof Error ? specErr.message : String(specErr)}`)
        }
      } else if (gc.specs.length) {
        addLog(logs, 'warn', `Bỏ qua ${gc.specs.length} specs vì thiếu label/value hợp lệ`)
      }
    }
    } catch (specsErr) {
      // Never let a specs validation failure sink the whole job — the rest of the
      // content is already saved. Log it so we can inspect the offending shape.
      addLog(
        logs,
        'error',
        `Ghi specs thất bại (bỏ qua, giữ nội dung còn lại): ${specsErr instanceof Error ? specsErr.message : String(specsErr)}`,
      )
    }
    addLog(logs, 'info', `Đã ghi nội dung vào nguyên liệu (${Object.keys(primaryData).join(', ')}${gc.specs?.length ? ', specs' : ''})`)

    // ── 8. Save result ────────────────────────────────────────────────────
    const result = {
      ...generatedContent,
      featuredImage: featuredImage ?? undefined,
      metadata: {
        filesProcessed: totals.filesExtracted,
        filesSkipped: totals.filesSkipped,
        modelUsed: `${process.env.OPENAI_CONTENT_MODEL || 'gpt-5.6-terra'} + ${process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'}`,
        imageGenerated: Boolean(featuredImage),
        locale,
        fileTypes: typeSummary,
        errors: totals.errors > 0 ? [`${totals.errors} file(s) có lỗi`] : undefined,
      },
    }

    addLog(logs, 'info', `✅ Job completed: ${generatedContent.benefits.length} benefits, ${generatedContent.applications.length} applications, image: ${featuredImage ? 'yes' : 'no'}`)

    await updateJob(payload, jobId, {
      status: 'done',
      phase: 'Hoàn tất! Xem kết quả bên dưới.',
      finishedAt: new Date().toISOString(),
      totals,
      logs,
      result: result as unknown as Record<string, unknown>,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[ai-generate] Job ${jobId} failed:`, err)
    addLog(logs, 'error', `Job failed: ${errorMsg}`)

    await updateJob(payload, jobId, {
      status: 'error',
      phase: 'Đã xảy ra lỗi.',
      finishedAt: new Date().toISOString(),
      errorMessage: errorMsg,
      logs,
    })
  }
}
