/**
 * Dựng lại toàn bộ bản .docx từ các file .md trong docs/ và các thư mục con.
 * Chạy:  cd docs/_cong-cu && node run.js
 */
const fs = require('fs'), path = require('path')
const { build } = require('./md2docx.js')

const ROOT = path.resolve(__dirname, '..')
const logo = fs.readFileSync(path.join(__dirname, '.logo.png'))

/** Liệt kê mọi .md trong docs/, bỏ qua thư mục công cụ */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}

;(async () => {
  const files = walk(ROOT).sort()
  let ok = 0, fail = 0
  for (const f of files) {
    const out = f.replace(/\.md$/, '.docx')
    const label = path.relative(ROOT, f)
    try {
      const size = await build(f, out, logo)
      console.log(`  ✅ ${label.padEnd(58)} ${(size / 1024).toFixed(1)} KB`)
      ok++
    } catch (e) {
      console.log(`  ❌ ${label.padEnd(58)} ${e.message}`)
      fail++
    }
  }
  console.log(`\n  ${ok} file dựng xong${fail ? `, ${fail} lỗi` : ''}`)
})()
