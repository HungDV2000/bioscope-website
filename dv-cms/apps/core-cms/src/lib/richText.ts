import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Rich text (Lexical) → văn bản thuần.
 *
 * Dùng khi đưa nội dung cho mô hình AI hoặc cho hệ thống bên ngoài: JSON Lexical
 * thô vừa tốn token vô ích vừa khó đọc, còn HTML thì thừa thẻ. Ở đây trả về đúng
 * phần chữ, giữ ngắt đoạn.
 */
export function lexicalToPlainText(v: unknown, maxLen = 4000): string {
  if (!v || typeof v !== 'object' || !('root' in (v as object))) return ''
  try {
    const html = convertLexicalToHTML({ data: v as SerializedEditorState, disableContainer: true })
    const text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
  } catch {
    return ''
  }
}
