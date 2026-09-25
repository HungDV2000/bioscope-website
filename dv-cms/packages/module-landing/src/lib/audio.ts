/**
 * Nhận diện file âm thanh bằng magic bytes.
 *
 * Không tin `Content-Type` do trình duyệt khai — đổi đuôi một file bất kỳ
 * thành `.webm` là xong. Chỉ nhận các định dạng mà trình duyệt thật sự ghi ra
 * (WebM/Opus, MP4/AAC, Ogg) và các định dạng file ghi âm thường gặp trên điện
 * thoại (M4A, MP3, WAV, AAC).
 */
function at(buf: Buffer, offset: number, bytes: number[]): boolean {
  if (buf.length < offset + bytes.length) return false
  return bytes.every((b, i) => buf[offset + i] === b)
}

export function detectAudio(buf: Buffer): { mime: string; ext: string } | null {
  if (at(buf, 0, [0x1a, 0x45, 0xdf, 0xa3])) return { mime: 'audio/webm', ext: 'webm' }
  if (at(buf, 0, [0x4f, 0x67, 0x67, 0x53])) return { mime: 'audio/ogg', ext: 'ogg' }
  if (at(buf, 4, [0x66, 0x74, 0x79, 0x70])) return { mime: 'audio/mp4', ext: 'm4a' }
  if (at(buf, 0, [0x52, 0x49, 0x46, 0x46]) && at(buf, 8, [0x57, 0x41, 0x56, 0x45])) return { mime: 'audio/wav', ext: 'wav' }
  if (at(buf, 0, [0x49, 0x44, 0x33])) return { mime: 'audio/mpeg', ext: 'mp3' }
  if (buf.length > 1 && buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) {
    // Khung MPEG/ADTS: 0xFFF1/0xFFF9 là AAC ADTS, còn lại là MP3.
    return (buf[1] & 0xf6) === 0xf0 ? { mime: 'audio/aac', ext: 'aac' } : { mime: 'audio/mpeg', ext: 'mp3' }
  }
  return null
}
