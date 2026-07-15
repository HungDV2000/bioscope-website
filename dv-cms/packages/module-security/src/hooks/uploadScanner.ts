/**
 * Upload scanner — blocks dangerous file uploads on the media collection.
 * Checks the filename extension against the configured blocklist and sniffs the
 * first bytes for executable/script signatures (PHP, shell, ELF, PE).
 */

import type { CollectionBeforeOperationHook } from 'payload'
import { getSecuritySettings, recordSecurityEvent } from '../lib/settings.js'

const DEFAULT_BLOCKED_EXT = ['php', 'phtml', 'phar', 'exe', 'sh', 'bat', 'js', 'html', 'svg']

// Byte/text signatures that should never appear in an uploaded "media" asset.
const DANGEROUS_SIGNATURES: RegExp[] = [
  /<\?php/i,
  /<script[\s>]/i,
  /#!\s*\/bin\/(ba)?sh/i,
  /\x7fELF/, // Linux executable
  /^MZ/, // Windows PE executable
]

function ext(filename?: string): string {
  return filename?.split('.').pop()?.toLowerCase() ?? ''
}

export const uploadScannerHook: CollectionBeforeOperationHook = async ({ operation, req }) => {
  if (operation !== 'create' && operation !== 'update') return
  const file = req.file
  if (!file) return

  const settings = await getSecuritySettings(req.payload)
  if (settings.scanEnabled === false || settings.scanMediaUploads === false) return

  const blocked = (settings.blockedUploadExtensions ?? DEFAULT_BLOCKED_EXT.join(','))
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  const fileExt = ext(file.name)
  const reject = async (reason: string) => {
    await recordSecurityEvent(req.payload, {
      type: 'scan',
      action: 'blocked',
      reason,
      path: file.name,
      username: req.user?.email,
    })
    throw new Error(`Tệp bị chặn vì lý do bảo mật: ${reason}`)
  }

  if (fileExt && blocked.includes(fileExt)) {
    await reject(`đuôi tệp không cho phép (.${fileExt})`)
  }

  // Content sniff on the head of the buffer.
  const buf = file.data
  if (buf && buf.length) {
    const head = buf.subarray(0, 2048).toString('latin1')
    if (DANGEROUS_SIGNATURES.some((re) => re.test(head))) {
      await reject('nội dung tệp chứa mã thực thi/script')
    }
  }
}
