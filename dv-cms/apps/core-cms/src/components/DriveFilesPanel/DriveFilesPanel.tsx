'use client'

/**
 * DriveFilesPanel — hiển thị danh sách Drive Files trong Ingredients edit page.
 *
 * Thay thế việc hiển thị JSON raw trong sidebar bằng card đẹp với:
 * - Icon theo loại file (PDF, Google Docs, Sheets, Slides, Image, Text)
 * - Badge màu theo mimeType
 * - Tên file + kích thước + ngày sửa
 * - Link "Xem trên Drive" → mở webViewLink trong tab mới
 * - Trạng thái đã sync (số file)
 */

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DriveFileEntry = {
  fileId?: string
  fileName?: string
  mimeType?: string
  webViewLink?: string
  webContentLink?: string
  size?: string
  modifiedTime?: string | null
}

interface DriveFilesPanelProps {
  files?: DriveFileEntry[] | null
  driveId?: string | null
  lastSyncAt?: string | null
  fileCount?: number | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytesStr: string | undefined): string {
  if (!bytesStr) return ''
  const bytes = parseInt(bytesStr, 10)
  if (isNaN(bytes)) return bytesStr
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

type FileType = 'pdf' | 'google_doc' | 'google_sheet' | 'google_slide' | 'image' | 'text' | 'csv' | 'unknown'

function getFileType(mimeType: string | undefined): FileType {
  if (!mimeType) return 'unknown'
  const lower = mimeType.toLowerCase()
  if (lower.includes('google-apps.document')) return 'google_doc'
  if (lower.includes('google-apps.spreadsheet')) return 'google_sheet'
  if (lower.includes('google-apps.presentation')) return 'google_slide'
  if (lower === 'application/pdf' || lower.includes('pdf')) return 'pdf'
  if (lower.startsWith('image/')) return 'image'
  if (lower.startsWith('text/')) return 'text'
  if (lower.includes('spreadsheet') || lower === 'text/csv') return 'csv'
  return 'unknown'
}

const FILE_TYPE_CONFIG: Record<
  FileType,
  { icon: string; label: string; bgColor: string; textColor: string }
> = {
  pdf: { icon: '📄', label: 'PDF', bgColor: '#e74c3c22', textColor: '#c0392b' },
  google_doc: { icon: '📝', label: 'Docs', bgColor: '#4285f422', textColor: '#1a73e8' },
  google_sheet: { icon: '📊', label: 'Sheets', bgColor: '#0f9d5822', textColor: '#0f9d58' },
  google_slide: { icon: '📽️', label: 'Slides', bgColor: '#fbbc0422', textColor: '#f9ab00' },
  image: { icon: '🖼️', label: 'Image', bgColor: '#9b59b622', textColor: '#8e44ad' },
  text: { icon: '📃', label: 'Text', bgColor: '#34495e22', textColor: '#2c3e50' },
  csv: { icon: '📋', label: 'CSV', bgColor: '#27ae6022', textColor: '#27ae60' },
  unknown: { icon: '📁', label: 'File', bgColor: '#95a5a622', textColor: '#7f8c8d' },
}

// ---------------------------------------------------------------------------
// File card
// ---------------------------------------------------------------------------

const FileCard: React.FC<{ file: DriveFileEntry }> = ({ file }) => {
  const fileType = getFileType(file.mimeType)
  const config = FILE_TYPE_CONFIG[fileType]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid var(--color-input-border, #e0e0e0)',
        background: 'var(--theme-elevation-0, #fff)',
        marginBottom: 6,
        fontSize: 12,
      }}
    >
      {/* Icon + Type badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>{config.icon}</span>
        <span
          style={{
            display: 'inline-block',
            padding: '1px 6px',
            borderRadius: 10,
            fontSize: 10,
            fontWeight: 700,
            background: config.bgColor,
            color: config.textColor,
            whiteSpace: 'nowrap',
          }}
        >
          {config.label}
        </span>
      </div>

      {/* File info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            color: 'var(--theme-elevation-800, #1a1a1a)',
            marginBottom: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 12,
          }}
          title={file.fileName}
        >
          {file.fileName}
        </div>

        <div style={{ display: 'flex', gap: 10, color: '#888', fontSize: 11, flexWrap: 'wrap' }}>
          {file.size && (
            <span>💾 {formatBytes(file.size)}</span>
          )}
          {file.modifiedTime && (
            <span>📅 {formatDate(file.modifiedTime)}</span>
          )}
        </div>

        {/* Google Docs inline preview hint */}
        {fileType === 'google_doc' && (
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            Google Docs — nội dung sẽ được export khi tạo nội dung
          </div>
        )}
        {fileType === 'google_sheet' && (
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            Google Sheets — dữ liệu bảng sẽ được export khi tạo nội dung
          </div>
        )}
        {fileType === 'image' && (
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
            Hình ảnh — GPT-4o Vision sẽ đọc nội dung khi tạo nội dung
          </div>
        )}
      </div>

      {/* Drive link */}
      {file.webViewLink && (
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid var(--color-input-border, #ddd)',
            color: '#666',
            textDecoration: 'none',
            fontSize: 11,
            flexShrink: 0,
            background: 'var(--theme-elevation-0, #fff)',
          }}
          title="Xem trên Google Drive"
        >
          🔗 Mở
        </a>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export const DriveFilesPanel: React.FC<DriveFilesPanelProps> = ({
  files,
  driveId,
  lastSyncAt,
  fileCount,
}) => {
  const fileList: DriveFileEntry[] = Array.isArray(files) ? files : []
  const hasFiles = fileList.length > 0

  return (
    <div style={{ marginTop: 8 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--theme-elevation-800)' }}>
            📁 Drive Files {hasFiles && `(${fileList.length})`}
          </span>
          {fileCount !== undefined && fileCount !== null && fileCount !== fileList.length && (
            <span style={{ fontSize: 11, color: '#aaa', marginLeft: 4 }}>
              (DB: {fileCount})
            </span>
          )}
        </div>
        {lastSyncAt && (
          <span style={{ fontSize: 10, color: '#aaa' }}>
            Sync: {formatDate(lastSyncAt)}
          </span>
        )}
      </div>

      {/* Drive ID */}
      {driveId && (
        <div
          style={{
            fontSize: 10,
            color: '#aaa',
            marginBottom: 6,
            padding: '3px 6px',
            background: '#f5f5f5',
            borderRadius: 4,
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={`Folder ID: ${driveId}`}
        >
          📂 {driveId}
        </div>
      )}

      {/* File list */}
      {hasFiles ? (
        <div>
          {fileList.map((file, i) => (
            <FileCard key={file.fileId || `file-${i}`} file={file} />
          ))}

          {/* Summary */}
          <div
            style={{
              marginTop: 8,
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(52, 152, 219, 0.06)',
              border: '1px solid rgba(52, 152, 219, 0.15)',
              fontSize: 11,
              color: '#666',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {(() => {
              const typeCount = fileList.reduce(
                (acc, f) => {
                  const t = getFileType(f.mimeType)
                  acc[t] = (acc[t] ?? 0) + 1
                  return acc
                },
                {} as Record<FileType, number>,
              )
              return Object.entries(typeCount).map(([type, count]) => {
                const cfg = FILE_TYPE_CONFIG[type as FileType]
                return (
                  <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {cfg.icon} {count} {cfg.label}
                  </span>
                )
              })
            })()}
          </div>

          {/* AI hint */}
          <div
            style={{
              marginTop: 8,
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(155, 89, 182, 0.06)',
              border: '1px solid rgba(155, 89, 182, 0.15)',
              fontSize: 11,
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13 }}>🤖</span>
            <span>
              Bấm <strong>"Tạo nội dung tự động"</strong> trên Dashboard để AI đọc tất cả file này và sinh nội dung.
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '16px',
            borderRadius: 8,
            border: '1px dashed var(--color-input-border, #ccc)',
            textAlign: 'center' as const,
            color: '#aaa',
            fontSize: 12,
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 6 }}>📂</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Chưa có file Drive</div>
          <div style={{ fontSize: 11 }}>
            Chạy <strong>Drive Sync</strong> trên Dashboard để đồng bộ file từ Google Drive.
          </div>
        </div>
      )}
    </div>
  )
}

export default DriveFilesPanel
