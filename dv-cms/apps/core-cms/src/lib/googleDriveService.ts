/**
 * GoogleDriveService — crawl folder structure từ Google Drive.
 *
 * Không cần n8n. Đọc trực tiếp Google Drive API với service account.
 *
 * Credentials: Set GOOGLE_APPLICATION_CREDENTIALS env var,
 * hoặc copy service-account.json vào apps/core-cms/credentials/
 */

import { google } from 'googleapis'
import type { drive_v3 } from 'googleapis'
import path from 'node:path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DriveFile = {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink: string
  createdTime?: string
  modifiedTime?: string
  size?: string
}

export type DriveFolder = {
  id: string
  name: string
  parentId: string | null
  path: string
}

export type IngredientNode = {
  categoryId: string
  categoryName: string
  categoryPath: string
  ingredientId: string
  ingredientName: string
  ingredientPath: string
  files: DriveFile[]
}

export type CrawlResult = {
  categories: DriveFolder[]
  ingredients: IngredientNode[]
  errors: string[]
}

// ---------------------------------------------------------------------------
// Credential loading
// ---------------------------------------------------------------------------

async function loadCredentials(): Promise<object> {
  // Env var takes priority
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (envPath) {
    const { readFile } = await import('node:fs/promises')
    return JSON.parse(await readFile(envPath, 'utf8'))
  }

  // Default: credentials/ in app root (works after `pnpm build`)
  const cwd = process.cwd()
  const candidates = [
    path.resolve(cwd, 'credentials/service-account.json'),
    path.resolve(cwd, '../BioBot/biobot/config/service-account.json'),
  ]

  for (const candidate of candidates) {
    try {
      const { readFile } = await import('node:fs/promises')
      const content = await readFile(candidate, 'utf8')
      return JSON.parse(content)
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    `Google service account credentials not found.\n` +
    `Set GOOGLE_APPLICATION_CREDENTIALS env var,\n` +
    `or place service-account.json at: ${candidates[0]}`,
  )
}

// ---------------------------------------------------------------------------
// GoogleDriveService
// ---------------------------------------------------------------------------

export class GoogleDriveService {
  private rootFolderId: string
  private _drivePromise: Promise<drive_v3.Drive> | null = null

  constructor(rootFolderId: string) {
    this.rootFolderId = rootFolderId
  }

  private async getDrive(): Promise<drive_v3.Drive> {
    if (this._drivePromise) return this._drivePromise
    this._drivePromise = this._initDrive()
    return this._drivePromise
  }

  private async _initDrive(): Promise<drive_v3.Drive> {
    const credentials = await loadCredentials()
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
      ],
    })
    return google.drive({ version: 'v3', auth })
  }

  async listFolders(parentId: string, pageSize = 200): Promise<DriveFolder[]> {
    const drive = await this.getDrive()
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name, parents, createdTime, modifiedTime)',
      pageSize,
      orderBy: 'name',
    })
    return (res.data.files ?? []).map((f) => ({
      id: f.id!,
      name: f.name!,
      parentId: (f.parents ?? [])[0] ?? null,
      path: '',
    }))
  }

  async listFilesInFolder(folderId: string, pageSize = 200): Promise<DriveFile[]> {
    const drive = await this.getDrive()
    const query = `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size)',
      pageSize,
      orderBy: 'name',
    })
    return (res.data.files ?? []).map((f) => ({
      id: f.id!,
      name: f.name!,
      mimeType: f.mimeType!,
      webViewLink: f.webViewLink ?? '',
      webContentLink: f.webContentLink ?? '',
      createdTime: f.createdTime ?? undefined,
      modifiedTime: f.modifiedTime ?? undefined,
      size: f.size ?? undefined,
    }))
  }

  async crawl(
    onProgress?: (batch: number, cats: number, ings: number, msg: string) => void,
  ): Promise<CrawlResult> {
    const categories: DriveFolder[] = []
    const ingredients: IngredientNode[] = []
    const errors: string[] = []
    let batch = 0

    try {
      const cats = await this.listFolders(this.rootFolderId)
      categories.push(...cats)
      batch++
      onProgress?.(batch, cats.length, 0, `Tìm thấy ${cats.length} danh mục`)
    } catch (err) {
      errors.push(`Lỗi đọc root folder: ${err}`)
      return { categories, ingredients, errors }
    }

    for (const cat of categories) {
      try {
        const ingFolders = await this.listFolders(cat.id)

        for (const ingFolder of ingFolders) {
          try {
            const files = await this.listFilesInFolder(ingFolder.id)
            ingredients.push({
              categoryId: cat.id,
              categoryName: cat.name,
              categoryPath: `/${cat.name}`,
              ingredientId: ingFolder.id,
              ingredientName: ingFolder.name,
              ingredientPath: `/${cat.name}/${ingFolder.name}`,
              files,
            })
          } catch (err) {
            errors.push(`Lỗi đọc ingredient "${ingFolder.name}": ${err}`)
          }
        }

        batch++
        onProgress?.(
          batch,
          categories.length,
          ingredients.length,
          `Đang xử lý "${cat.name}": ${ingFolders.length} nguyên liệu`,
        )
      } catch (err) {
        errors.push(`Lỗi đọc category "${cat.name}": ${err}`)
      }
    }

    onProgress?.(batch, categories.length, ingredients.length, 'Hoàn tất crawl')
    return { categories, ingredients, errors }
  }

  async testConnection(): Promise<{
    ok: boolean
    rootFolderName: string
    categoryCount: number
    error?: string
  }> {
    try {
      const drive = await this.getDrive()
      const root = await drive.files.get({
        fileId: this.rootFolderId,
        fields: 'id, name',
      })
      const cats = await this.listFolders(this.rootFolderId, 5)
      return {
        ok: true,
        rootFolderName: root.data.name ?? 'Unknown',
        categoryCount: cats.length,
      }
    } catch (err) {
      return {
        ok: false,
        rootFolderName: '',
        categoryCount: 0,
        error: String(err),
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _service: GoogleDriveService | null = null

export function getDriveService(): GoogleDriveService {
  if (!_service) {
    _service = new GoogleDriveService(
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '1YFh__V4da3Q6rU3grYgd5YCBH70HcVbs',
    )
  }
  return _service
}
