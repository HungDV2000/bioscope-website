/**
 * Tên nguyên liệu trong CMS mang rất nhiều "rác" do quy ước nhập liệu, khiến so
 * khớp thô (chỉ lowercase + trim) bỏ sót phần lớn trùng lặp thật. Khảo sát 60
 * bản ghi thực tế:
 *   - 22% có tiền tố số/ngày:      "019.001 Chiết xuất cúc la mã", "1. Immunepath"
 *   - 28% có hậu tố xuất xứ:       "- TQ", "- Nhật Bản", "- Đức"
 *   - 25% có nhãn thương hiệu:     "(TM)", "™"
 * Ví dụ: "1. Đường Erythritol - TQ(TM)" và "Đường Erythritol - Trung Quốc" là
 * cùng một thứ nhưng không bao giờ khớp nếu không bóc các phần này ra.
 *
 * Mỗi phép bóc là một tuỳ chọn riêng để admin tự cân giữa "bắt được nhiều" và
 * "báo nhầm ít".
 */

export type NormalizeOptions = {
  /** Bỏ tiền tố số thứ tự / mã / ngày ở đầu: "019.001 ", "1. ", "24.04.19 ", "100919-" */
  stripNumericPrefix?: boolean
  /** Bỏ hậu tố quốc gia: "- TQ", "- Nhật Bản", "- Đức" */
  stripOriginSuffix?: boolean
  /** Bỏ nhãn (TM), ™, ®, (R) ở bất kỳ đâu */
  stripTrademark?: boolean
  /** Bỏ dấu tiếng Việt — bắt được trường hợp gõ thiếu dấu */
  removeDiacritics?: boolean
  /** Bỏ dấu câu, gộp về khoảng trắng */
  stripPunctuation?: boolean
}

export const DEFAULT_NORMALIZE: Required<NormalizeOptions> = {
  stripNumericPrefix: true,
  stripOriginSuffix: true,
  stripTrademark: true,
  removeDiacritics: true,
  stripPunctuation: true,
}

/**
 * Tên quốc gia + mã viết tắt xuất hiện ở đuôi tên nguyên liệu. Xếp theo độ dài
 * giảm dần khi ghép regex để "Trung Quốc" được thử trước "Trung".
 */
const COUNTRIES = [
  'trung quốc', 'trung quoc', 'tq',
  'việt nam', 'viet nam', 'vn',
  'nhật bản', 'nhat ban', 'nhật', 'nhat', 'jp',
  'hàn quốc', 'han quoc', 'hàn', 'han', 'kr',
  'ấn độ', 'an do', 'in',
  'na uy', 'nauy', 'no',
  'đức', 'duc', 'de',
  'pháp', 'phap', 'fr',
  'mỹ', 'my', 'hoa kỳ', 'hoa ky', 'us', 'usa',
  'ý', 'italy', 'it',
  'anh', 'uk',
  'tây ban nha', 'tay ban nha', 'es',
  'hà lan', 'ha lan', 'nl',
  'bỉ', 'bi', 'be',
  'thụy sĩ', 'thuy si', 'ch',
  'đan mạch', 'dan mach', 'dk',
  'thụy điển', 'thuy dien', 'se',
  'ba lan', 'pl',
  'áo', 'ao', 'at',
  'canada', 'ca',
  'úc', 'uc', 'australia', 'au',
  'brazil', 'br',
  'chile', 'cl',
  'peru', 'pe',
  'malaysia', 'my2', 'mys',
  'thái lan', 'thai lan', 'th',
  'indonesia', 'id',
  'singapore', 'sg',
  'đài loan', 'dai loan', 'tw',
  'israel', 'il',
  'ireland', 'ie',
  'thổ nhĩ kỳ', 'tho nhi ky', 'tr',
]

/** Ký tự phân tách hay đứng trước hậu tố xuất xứ. */
const SEP = '[-–—/|,(\\[]'

const ORIGIN_SUFFIX_RE = new RegExp(
  `\\s*${SEP}\\s*(?:${[...COUNTRIES].sort((a, b) => b.length - a.length).join('|')})\\s*[)\\]]?\\s*$`,
  'i',
)

/** "019.001 ", "1. ", "1.", "24.04.19 ", "100919-" ở ĐẦU chuỗi. */
const NUMERIC_PREFIX_RE = /^\s*\d[\d.\-/]*\s*[.\-)–—]?\s+|^\s*\d[\d.\-/]*[.\-)–—]\s*/

const TRADEMARK_RE = /\s*(?:\((?:tm|r|c)\)|™|®|©)\s*/gi

/**
 * Nhãn TM/R viết trần ở cuối, không ngoặc: "- TM", "/ R".
 * Chỉ tính khi đứng sau dấu phân tách — một từ "TM" giữa tên là chuyện khác.
 */
const TRADEMARK_SUFFIX_RE = new RegExp(`\\s*${SEP}\\s*(?:tm|r)\\s*[)\\]]?\\s*$`, 'i')

/** Dấu phân tách/khoảng trắng thừa còn sót lại sau khi bóc. */
const TRAILING_JUNK_RE = /^[\s\-–—/|,.]+|[\s\-–—/|,.]+$/g

/** Bỏ dấu tiếng Việt (kể cả đ/Đ, vốn không tách được bằng NFD). */
function removeDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/**
 * Đưa một tên về dạng so sánh được.
 *
 * Thứ tự các bước có chủ ý: nhãn (TM) bóc trước vì nó hay dính liền hậu tố
 * xuất xứ ("- TQ(TM)"), và hậu tố xuất xứ bóc LẶP vì một tên có thể mang nhiều
 * hậu tố chồng nhau ("1. Immunepath - Việt Nam - TM" còn lại "- Việt Nam" sau
 * khi bỏ TM).
 *
 * @returns chuỗi đã chuẩn hoá; có thể là chuỗi rỗng nếu tên chỉ gồm phần bị bóc.
 */
export function normalizeName(raw: string, opts: NormalizeOptions = DEFAULT_NORMALIZE): string {
  let s = String(raw ?? '')

  if (opts.stripTrademark) s = s.replace(TRADEMARK_RE, ' ')

  if (opts.stripNumericPrefix) {
    // Lặp: "24.04.19 XIN GMP..." có thể còn tầng số nữa sau lần bóc đầu.
    for (let i = 0; i < 3; i++) {
      const next = s.replace(NUMERIC_PREFIX_RE, '')
      if (next === s) break
      s = next
    }
  }

  // Bóc XEN KẼ hậu tố xuất xứ và nhãn TM trần cho tới khi không đổi nữa. Chạy
  // riêng lẻ là không đủ: "1. Immunepath - Việt Nam - TM" có "- TM" chắn ở cuối
  // nên "- Việt Nam" không bao giờ lộ ra vị trí cuối chuỗi để bị bóc.
  if (opts.stripOriginSuffix || opts.stripTrademark) {
    for (let i = 0; i < 6; i++) {
      const before = s
      if (opts.stripTrademark) s = s.replace(TRADEMARK_SUFFIX_RE, '')
      if (opts.stripOriginSuffix) s = s.replace(ORIGIN_SUFFIX_RE, '')
      if (s === before) break
    }
  }

  s = s.toLowerCase()

  if (opts.removeDiacritics) s = removeDiacritics(s)

  // Bỏ dấu câu SAU khi đã bóc hậu tố — làm trước sẽ mất dấu "-" mà
  // ORIGIN_SUFFIX_RE cần để nhận ra ranh giới.
  if (opts.stripPunctuation) s = s.replace(/[^\p{L}\p{N}]+/gu, ' ')

  return s.replace(/\s+/g, ' ').replace(TRAILING_JUNK_RE, '').trim()
}

/**
 * "Chữ ký số" của một tên: mọi cụm số theo đúng thứ tự xuất hiện.
 *
 * Trong tên nguyên liệu, con số gần như luôn mang nghĩa phân biệt — B1 khác
 * B12, 30% khác 34%, 0,1% khác 0,2%. So khớp gần đúng bằng trigram lại thấy
 * các cặp đó giống nhau tới 90%+ vì phần chữ trùng khít. Dùng chữ ký này để
 * chặn: hai tên khác chữ ký số thì không coi là trùng dù điểm giống có cao.
 */
export function digitSignature(s: string): string {
  return (s.match(/\d+/g) ?? []).join('.')
}
