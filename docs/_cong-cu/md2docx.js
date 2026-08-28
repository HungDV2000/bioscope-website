/**
 * Chuyển Markdown → DOCX theo nhận diện Bioscope.
 * Dùng chung cho toàn bộ hồ sơ để 21 tài liệu có cùng một bộ định dạng.
 */
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, Header, Footer, PageNumber, LevelFormat,
  convertMillimetersToTwip, TableLayoutType, VerticalAlign, ExternalHyperlink,
} = require('docx')

const C = {
  primary: '008E4D', primaryDark: '036F3D', tint: 'EEF6F1', border: 'CFE3D8',
  accent: 'F58E33', accentSoft: 'FFF4E8', accentDark: '8A4B12',
  ink: '101814', inkSoft: '4A5551', mist: 'F4F8F6', code: 'F1F5F3',
}
const FONT = 'Be Vietnam Pro'
const MONO = 'Menlo'
const CONTENT_W = 9360   // bề rộng vùng nội dung (twip)

const SETS = {
  A: 'Hồ sơ AI cập nhật sản phẩm',
  B: 'Hồ sơ hệ thống website',
  C: 'Hồ sơ chatbot AI tích hợp',
  D: 'Hồ sơ sản xuất phần mềm nội bộ',
  R: 'Hồ sơ hệ thống Bioscope',
}

// ── Inline: **đậm**, *nghiêng*, `mã`, [chữ](link) ──────────────────────────
function inline(text, base = {}) {
  const out = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g
  let last = 0, m
  const push = (s, extra = {}) => {
    if (!s) return
    out.push(new TextRun({ text: s, font: FONT, size: 21, color: C.ink, ...base, ...extra }))
  }
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) push(tok.slice(2, -2), { bold: true })
    else if (tok.startsWith('`')) {
      out.push(new TextRun({
        text: tok.slice(1, -1), font: MONO, size: 19, color: C.primaryDark,
        shading: { type: ShadingType.CLEAR, fill: C.code, color: 'auto' }, ...base,
      }))
    } else if (tok.startsWith('[')) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)
      const isExt = /^https?:/.test(mm[2])
      if (isExt) {
        out.push(new ExternalHyperlink({
          link: mm[2],
          children: [new TextRun({ text: mm[1], font: FONT, size: 21, color: C.primary, underline: {}, ...base })],
        }))
      } else push(mm[1], { color: C.primaryDark, bold: true })
    } else push(tok.slice(1, -1), { italics: true })
    last = m.index + tok.length
  }
  push(text.slice(last))
  return out.length ? out : [new TextRun({ text: '', font: FONT, size: 21 })]
}

const stripMd = (s) => s.replace(/\*\*|`|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()

// ── Khối ───────────────────────────────────────────────────────────────────
const h2 = (txt) => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 380, after: 180 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.primary, space: 6 } },
  children: [new TextRun({ text: stripMd(txt), font: FONT, size: 28, bold: true, color: C.primaryDark })],
})
const h3 = (txt) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 },
  children: [new TextRun({ text: stripMd(txt), font: FONT, size: 24, bold: true, color: C.primary })],
})
const h4 = (txt) => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 100 },
  children: [new TextRun({ text: stripMd(txt), font: FONT, size: 21, bold: true, color: C.ink })],
})

/** Dải phân mục lớn — nền xanh nhạt, sang trang mới */
const h1band = (txt) => new Table({
  columnWidths: [CONTENT_W], width: { size: CONTENT_W, type: WidthType.DXA },
  layout: TableLayoutType.FIXED,
  borders: {
    top: { style: BorderStyle.SINGLE, size: 12, color: C.primary },
    bottom: { style: BorderStyle.SINGLE, size: 12, color: C.primary },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  },
  rows: [new TableRow({ children: [new TableCell({
    width: { size: CONTENT_W, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: C.tint, color: 'auto' },
    margins: { top: 220, bottom: 220, left: 160, right: 160 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 },
      children: [new TextRun({ text: stripMd(txt), font: FONT, size: 30, bold: true, color: C.primaryDark })] })],
  })] })],
})

const para = (txt) => new Paragraph({ spacing: { after: 130, line: 300 }, children: inline(txt) })

const codeBlock = (lines) => new Table({
  columnWidths: [CONTENT_W], width: { size: CONTENT_W, type: WidthType.DXA },
  layout: TableLayoutType.FIXED,
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: C.border },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
    left: { style: BorderStyle.SINGLE, size: 4, color: C.border },
    right: { style: BorderStyle.SINGLE, size: 4, color: C.border },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  },
  rows: [new TableRow({ children: [new TableCell({
    width: { size: CONTENT_W, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: C.code, color: 'auto' },
    margins: { top: 130, bottom: 130, left: 160, right: 140 },
    children: lines.map((l, i) => new Paragraph({
      spacing: { after: i === lines.length - 1 ? 0 : 0, line: 250 },
      children: [new TextRun({ text: l || ' ', font: MONO, size: 17, color: C.ink })],
    })),
  })] })],
})

/** Trích dẫn → khối cảnh báo. Cam nếu có dấu cảnh báo, xanh nếu là ghi chú. */
const callout = (lines) => {
  const joined = lines.join(' ')
  const warn = /⚠️|⛔|CẢNH BÁO|KHÔNG|TUYỆT ĐỐI|CHƯA TRIỂN KHAI|MẪU/.test(joined)
  const bar = warn ? C.accent : C.primary
  const fill = warn ? C.accentSoft : C.tint
  return new Table({
    columnWidths: [CONTENT_W], width: { size: CONTENT_W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.SINGLE, size: 18, color: bar },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill, color: 'auto' },
      margins: { top: 150, bottom: 150, left: 190, right: 160 },
      children: lines.map((l, i) => new Paragraph({
        spacing: { after: i === lines.length - 1 ? 0 : 100, line: 290 },
        children: inline(l, { size: 20, color: warn ? C.accentDark : C.ink }),
      })),
    })] })],
  })
}

/** Bảng markdown → bảng docx, cột chia theo độ dài nội dung */
function mdTable(rows, aligns) {
  const n = rows[0].length
  const maxLen = new Array(n).fill(1)
  rows.forEach((r) => r.forEach((c, j) => { maxLen[j] = Math.max(maxLen[j], Math.min(stripMd(c).length, 60)) }))
  const total = maxLen.reduce((a, b) => a + b, 0)
  const MIN = Math.floor(CONTENT_W / (n * 3.2))
  let widths = maxLen.map((l) => Math.max(MIN, Math.round((l / total) * CONTENT_W)))
  const diff = CONTENT_W - widths.reduce((a, b) => a + b, 0)
  widths[widths.indexOf(Math.max(...widths))] += diff

  return new Table({
    columnWidths: widths, width: { size: CONTENT_W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: C.border },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
      left: { style: BorderStyle.SINGLE, size: 4, color: C.border },
      right: { style: BorderStyle.SINGLE, size: 4, color: C.border },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: C.border },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: C.border },
    },
    rows: rows.map((cells, i) => new TableRow({
      tableHeader: i === 0,
      children: cells.map((c, j) => new TableCell({
        width: { size: widths[j], type: WidthType.DXA },
        shading: i === 0 ? { type: ShadingType.CLEAR, fill: C.tint, color: 'auto' } : undefined,
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          spacing: { after: 0, line: 280 },
          alignment: aligns[j] === 'center' ? AlignmentType.CENTER
                   : aligns[j] === 'right' ? AlignmentType.RIGHT : undefined,
          children: inline(c, i === 0
            ? { size: 20, bold: true, color: C.primaryDark }
            : { size: 20 }),
        })],
      })),
    })),
  })
}

// ── Bộ phân tích Markdown ──────────────────────────────────────────────────
function parse(md) {
  const lines = md.split('\n')
  const out = []
  let i = 0
  let title = ''

  while (i < lines.length) {
    const L = lines[i]

    if (/^```/.test(L)) {                       // khối mã / sơ đồ
      const buf = []; i++
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++])
      i++
      out.push({ t: 'code', lines: buf })
      continue
    }
    if (/^# /.test(L)) {
      // '#' đầu tiên là TÊN tài liệu; các '#' sau là dải phân mục lớn trong thân bài
      // (vd D6 có ba công đoạn). Trước đây bỏ hết → mất nội dung.
      if (!title) title = stripMd(L.slice(2))
      else out.push({ t: 'h1', s: L.slice(2) })
      i++; continue
    }
    if (/^## /.test(L))  { out.push({ t: 'h2', s: L.slice(3) }); i++; continue }
    if (/^### /.test(L)) { out.push({ t: 'h3', s: L.slice(4) }); i++; continue }
    if (/^#### /.test(L)){ out.push({ t: 'h4', s: L.slice(5) }); i++; continue }
    if (/^---+\s*$/.test(L)) { out.push({ t: 'hr' }); i++; continue }

    if (/^>/.test(L)) {                          // trích dẫn
      const buf = []
      while (i < lines.length && /^>/.test(lines[i])) {
        const c = lines[i].replace(/^>\s?/, '')
        if (c.trim() === '') { if (buf.length) buf.push('') } else buf.push(c)
        i++
      }
      out.push({ t: 'quote', lines: buf.filter((x, k, a) => !(x === '' && (k === 0 || k === a.length - 1))) })
      continue
    }

    if (/^\|/.test(L) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const split = (r) => r.replace(/^\||\|$/g, '').split('|').map((x) => x.trim())
      const head = split(L)
      const aligns = split(lines[i + 1]).map((a) =>
        a.startsWith(':') && a.endsWith(':') ? 'center' : a.endsWith(':') ? 'right' : 'left')
      i += 2
      const rows = [head]
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(split(lines[i++]))
      out.push({ t: 'table', rows, aligns })
      continue
    }

    if (/^\s*[-*] /.test(L) || /^\s*\d+\. /.test(L)) {   // danh sách
      const items = []
      while (i < lines.length && (/^\s*[-*] /.test(lines[i]) || /^\s*\d+\. /.test(lines[i]))) {
        const ord = /^\s*\d+\. /.test(lines[i])
        items.push({ s: lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''), ord })
        i++
      }
      out.push({ t: 'list', items })
      continue
    }

    if (L.trim() === '') { i++; continue }

    const buf = [L]; i++                          // đoạn văn nối dòng
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^[#>|`-]|^\s*[-*] |^\s*\d+\. /.test(lines[i])) buf.push(lines[i++])
    out.push({ t: 'p', s: buf.join(' ') })
  }
  return { title, blocks: out }
}

// ── Dựng tài liệu ──────────────────────────────────────────────────────────
function build(mdPath, outPath, logo) {
  const md = fs.readFileSync(mdPath, 'utf8')
  const { title, blocks } = parse(md)
  const base = path.basename(mdPath, '.md')
  const isReadme = base === 'README'
  const code = isReadme ? 'MỤC LỤC' : base.split('-')[0]
  const setKey = isReadme ? 'R' : code[0]
  const setName = SETS[setKey]

  const body = []
  let hasContent = false   // đã có nội dung thật chưa — quyết định có ngắt trang không
  for (const b of blocks) {
    if (b.t === 'h1') {
      // Chỉ ngắt trang khi PHÍA TRƯỚC đã có nội dung. Dải đầu tiên nằm ngay đầu
      // thân bài mà ngắt trang thì sinh ra một trang gần trống.
      if (hasContent) body.push(new Paragraph({ pageBreakBefore: true, spacing: { after: 200 } }))
      body.push(h1band(b.s))
      body.push(new Paragraph({ spacing: { after: 240 } }))
      hasContent = true
    }
    else if (b.t === 'h2') { body.push(h2(b.s)); hasContent = true }
    else if (b.t === 'h3') body.push(h3(b.s))
    else if (b.t === 'h4') body.push(h4(b.s))
    else if (b.t === 'p') { body.push(para(b.s)); hasContent = true }
    else if (b.t === 'quote') { body.push(callout(b.lines)); body.push(new Paragraph({ spacing: { after: 160 } })) }
    else if (b.t === 'code') { body.push(codeBlock(b.lines)); body.push(new Paragraph({ spacing: { after: 160 } })) }
    else if (b.t === 'table') { body.push(mdTable(b.rows, b.aligns)); body.push(new Paragraph({ spacing: { after: 180 } })); hasContent = true }
    else if (b.t === 'list') {
      b.items.forEach((it) => body.push(new Paragraph({
        numbering: { reference: it.ord ? 'bio-num' : 'bio-bullet', level: 0 },
        spacing: { after: 80, line: 290 },
        children: inline(it.s),
      })))
      body.push(new Paragraph({ spacing: { after: 100 } }))
    } else if (b.t === 'hr') {
      body.push(new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border, space: 4 } },
        children: [new TextRun({ text: '', font: FONT, size: 2 })],
      }))
    }
  }

  const doc = new Document({
    creator: 'Bioscope', title: `${code} — ${title}`, description: setName,
    numbering: { config: [
      { reference: 'bio-bullet', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } }, run: { color: C.primary, font: FONT } } }] },
      { reference: 'bio-num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 380, hanging: 240 } }, run: { color: C.primary, font: FONT, bold: true } } }] },
    ] },
    styles: { default: { document: { run: { font: FONT, size: 21, color: C.ink }, paragraph: { spacing: { line: 300 } } } } },
    sections: [
      {   // BÌA
        properties: { page: { margin: {
          top: convertMillimetersToTwip(28), bottom: convertMillimetersToTwip(24),
          left: convertMillimetersToTwip(25), right: convertMillimetersToTwip(20) } } },
        children: [
          new Paragraph({ spacing: { after: 1400 } }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 },
            children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 260, height: 76 } })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
            children: [new TextRun({ text: setName.toUpperCase(), font: FONT, size: 22, bold: true,
              color: C.accent, characterSpacing: 60 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 260, after: 900 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 12, color: C.primary, space: 18 },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: C.primary, space: 18 },
            },
            children: [new TextRun({ text: title.toUpperCase(), font: FONT, size: 36, bold: true, color: C.primaryDark })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 },
            children: [new TextRun({ text: 'Hệ thống website và quản trị nội dung Bioscope',
              font: FONT, size: 24, color: C.inkSoft, italics: true })] }),
          mdTable(
            [['Mục', 'Nội dung'], ['Mã tài liệu', code], ['Thuộc bộ', setName],
             ['Ngày lập', '28/08/2026'], ['Phiên bản', '1.0'], ['Phạm vi', 'Toàn hệ thống Bioscope']],
            ['left', 'left'],
          ),
          new Paragraph({ spacing: { after: 600 } }),
          new Paragraph({ alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Tài liệu nội bộ — không phổ biến ra ngoài',
              font: FONT, size: 18, color: C.inkSoft, italics: true })] }),
        ],
      },
      {   // NỘI DUNG
        properties: { page: { margin: {
          top: convertMillimetersToTwip(24), bottom: convertMillimetersToTwip(22),
          left: convertMillimetersToTwip(25), right: convertMillimetersToTwip(20) } } },
        headers: { default: new Header({ children: [new Table({
          columnWidths: [2200, 7160], width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: C.border },
            left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
          },
          rows: [new TableRow({ children: [
            new TableCell({ width: { size: 2200, type: WidthType.DXA },
              margins: { top: 40, bottom: 100, left: 0, right: 0 }, verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ spacing: { after: 0 },
                children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 106, height: 31 } })] })] }),
            new TableCell({ width: { size: 7160, type: WidthType.DXA },
              margins: { top: 40, bottom: 100, left: 0, right: 0 }, verticalAlign: VerticalAlign.CENTER,
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 },
                children: [new TextRun({ text: `${code} · ${title}`, font: FONT, size: 17, color: C.inkSoft })] })] }),
          ] })],
        })] }) },
        footers: { default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 100 },
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.border, space: 8 } },
          children: [
            new TextRun({ text: `${setName}  ·  Trang `, font: FONT, size: 16, color: C.inkSoft }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: C.primary, bold: true }),
            new TextRun({ text: ' / ', font: FONT, size: 16, color: C.inkSoft }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: C.inkSoft }),
          ],
        })] }) },
        children: body,
      },
    ],
  })

  return Packer.toBuffer(doc).then((b) => { fs.writeFileSync(outPath, b); return b.length })
}

module.exports = { build }
