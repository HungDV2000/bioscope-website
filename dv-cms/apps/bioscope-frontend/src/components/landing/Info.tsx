'use client'

import { CircleAlert, CircleCheck } from 'lucide-react'
import { useLp } from './context'
import { PointTable } from './Steps'
import { IMG, OrbitText } from './ui'

export const INFO_TITLES: Record<string, string> = {
  product: 'Gastroheal là gì?',
  ingredients: 'Trong đó có gì?',
  reviews: 'Người dùng kể gì?',
  science: 'Có gì đáng tin?',
  points: 'Điểm tính thế nào?',
}

export function InfoBody({ k, openCompany }: { k: string; openCompany: () => void }) {
  if (k === 'product') return <Product />
  if (k === 'ingredients') return <Ingredients />
  if (k === 'reviews') return <Reviews />
  if (k === 'science') return <Science openCompany={openCompany} />
  if (k === 'points') return <Points />
  return null
}

/* Nội dung sản phẩm: giữ NGUYÊN câu chữ theo bản công bố — không tự sửa. */
function Product() {
  return (
    <>
      <p className="text-lg font-bold">Thực phẩm bảo vệ sức khoẻ GASTROHEAL</p>
      <p className="mt-1 text-gh-ink-soft">Dạng nước, lọ 50 ml, thương hiệu NatuComplex® 5 của Bioscope.</p>
      <div className="mt-5 rounded-3xl bg-gh-canvas p-4">
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gh-ink-faint">Thành phần chính (trong 50 ml)</dt>
            <dd className="font-semibold">NatuComplex 5 (Curcumin 5%)</dd>
          </div>
          <div className="border-t border-black/5 pt-3">
            <dt className="text-sm text-gh-ink-faint">Phụ liệu</dt>
            <dd className="font-semibold">Propylene glycol, glycerin, nước tinh khiết vừa đủ</dd>
          </div>
          <div className="border-t border-black/5 pt-3">
            <dt className="text-sm text-gh-ink-faint">Chỉ tiêu chất lượng công bố</dt>
            <dd className="font-semibold">Curcumin 200 mg / 4 ml (±20%)</dd>
          </div>
        </dl>
      </div>
      <h3 className="mt-6 text-[17px] font-bold">Công dụng</h3>
      <ul className="mt-2 space-y-2 text-gh-ink-soft">
        {['Giúp tăng cường bảo vệ niêm mạc dạ dày.', 'Hỗ trợ làm giảm các loét dạ dày, tá tràng như: đầy bụng, khó tiêu, đau thượng vị.'].map((t) => (
          <li key={t} className="flex gap-2">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-gh-brand" strokeWidth={1.5} aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
      <h3 className="mt-6 text-[17px] font-bold">Đối tượng sử dụng</h3>
      <p className="mt-2 text-gh-ink-soft">Người bị viêm loét dạ dày, tá tràng, hoặc có dấu hiệu đầy bụng, khó tiêu, đau vùng thượng vị.</p>
      <h3 className="mt-6 text-[17px] font-bold">Hướng dẫn sử dụng</h3>
      <ul className="mt-2 space-y-2 text-gh-ink-soft">
        {[
          'Uống 1–2 lần mỗi ngày, mỗi lần 4 ml.',
          'Uống trước bữa ăn 30 phút hoặc sau ăn 1 giờ, hoặc khi có cảm giác khó chịu.',
          'Dạng hỗn dịch có thể tách lớp, lắc kỹ trước khi dùng.',
        ].map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gh-brand" />
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-gh-canvas p-4">
          <p className="font-bold">Quy cách, bao bì</p>
          <p className="mt-1 text-gh-ink-soft">Lọ 50 ml (±7,5%).</p>
        </div>
        <div className="rounded-3xl bg-gh-canvas p-4">
          <p className="font-bold">Hạn dùng, bảo quản</p>
          <p className="mt-1 text-gh-ink-soft">
            Hạn sử dụng 24 tháng kể từ ngày sản xuất (xem trên nhãn). Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp, để xa tầm tay trẻ em.
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-3xl bg-gh-cta-soft p-4">
        <p className="flex items-center gap-2 font-bold text-gh-cta-deep">
          <CircleAlert className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          Khuyến cáo
        </p>
        <ul className="mt-2 space-y-1.5 text-gh-ink-soft">
          <li>Không dùng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm.</li>
          <li>Thực phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.</li>
          <li>Hiệu quả sử dụng tuỳ thuộc cơ địa từng người.</li>
        </ul>
      </div>
    </>
  )
}

const INGREDIENTS = [
  {
    img: 'ing-curcumin.png',
    name: 'Nano Phytosome Curcumin',
    tag: 'Hoạt chất chính',
    text: 'Hoạt chất chính giúp hỗ trợ chống viêm và chống oxy hoá.',
    orbit: 'NANO PHYTOSOME · CURCUMIN · NANO ·',
    size: 8,
    spacing: 1.6,
  },
  {
    img: 'ing-phosphatidylcholine.png',
    name: 'Phosphatidyl­choline',
    tag: 'Lớp màng nhầy',
    text: 'Giúp tái tạo, làm dày lại lớp màng nhầy bảo vệ của dạ dày.',
    orbit: 'PHOSPHATIDYLCHOLINE · PHOSPHATIDYL ·',
    size: 8,
    spacing: 1.3,
    reverse: true,
  },
  {
    img: 'ing-piperine.png',
    name: 'Piperine',
    tag: 'Giữ tác dụng lâu hơn',
    text: 'Làm chậm quá trình đào thải curcumin, duy trì hiệu quả trong thời gian dài.',
    orbit: 'PIPERINE · PIPERINE · PIPERINE ·',
    size: 9,
    spacing: 2.4,
  },
]

function Ingredients() {
  return (
    <>
      <span className="lp-eyebrow bg-gh-brand-soft text-gh-brand-deep">Thành phần cốt lõi</span>
      <h3 className="mt-3 text-[1.55rem] font-bold leading-tight tracking-[-0.03em] sm:text-[1.9rem]">
        Không chỉ là nghệ,
        <span className="mt-0.5 block font-gh-serif font-medium italic text-gh-cta-deep">Gastroheal là nghệ hấp thu được.</span>
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-gh-ink-soft">
        Curcumin trong nghệ vốn rất khó hấp thu, uống nhiều mà cơ thể giữ lại chẳng bao nhiêu. Công nghệ <b className="font-semibold text-gh-ink">Phytosome</b> bọc curcumin
        trong lớp phospholipid: tăng hấp thu, bảo vệ hoạt chất khỏi bị phân huỷ, lại cần liều thấp hơn curcumin thông thường.
      </p>
      <p className="mt-2 text-xs text-gh-ink-faint">Chỉ tiêu công bố: Curcumin 200 mg / 4 ml (±20%)</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {INGREDIENTS.map((x, i) => (
          <article key={x.img} className="flex min-w-0 flex-col rounded-[1.75rem] bg-gh-canvas p-4 ring-1 ring-black/5 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="relative h-24 w-24 shrink-0">
                <OrbitText text={x.orbit} size={x.size} spacing={x.spacing} reverse={x.reverse} radius={45} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/${x.img}`} alt={x.name.replace('­', '')} loading="lazy" className="absolute inset-[18%] h-[64%] w-[64%] rounded-full bg-white object-cover ring-4 ring-white" />
              </div>
              <span className="font-gh-serif text-3xl italic text-gh-brand/30">0{i + 1}</span>
            </div>
            <span className="mt-4 w-max max-w-full rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gh-brand-deep ring-1 ring-black/5">{x.tag}</span>
            <h3 className="mt-2 break-words text-[15.5px] font-semibold leading-snug sm:text-[17px]">{x.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gh-ink-soft">{x.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 border-t border-black/5 pt-8 sm:gap-6">
        <div className="rounded-[1.75rem] bg-gh-canvas p-4 text-center sm:p-6">
          <p className="text-sm font-semibold text-gh-cta-deep sm:text-base">
            Curcumin
            <br />
            thông thường
          </p>
          <div className="relative mx-auto mt-4 h-20 w-20 sm:h-28 sm:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/ing-turmeric.png`} alt="Nghệ và bột nghệ – curcumin thông thường" loading="lazy" className="absolute inset-0 h-full w-full rounded-full bg-white object-cover ring-4 ring-white" />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full w-[22%] rounded-full bg-gh-ink-faint" />
          </div>
          <p className="mt-2 text-xs font-medium text-gh-ink-soft">Hiệu quả thấp</p>
        </div>
        <div className="rounded-[1.75rem] bg-gh-brand-mist p-4 text-center ring-1 ring-gh-brand/15 sm:p-6">
          <p className="text-sm font-semibold text-gh-brand-deep sm:text-base">
            Curcumin trong
            <br />
            Gastroheal
          </p>
          <div className="relative mx-auto mt-4 h-20 w-20 sm:h-28 sm:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/ing-curcumin.png`} alt="Nano Phytosome Curcumin" loading="lazy" className="absolute inset-0 h-full w-full rounded-full bg-white object-cover ring-4 ring-white" />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-gh-lime to-gh-brand" />
          </div>
          <p className="mt-2 text-xs font-semibold text-gh-brand-deep">Tăng hấp thu gấp nhiều lần</p>
        </div>
      </div>
    </>
  )
}

const AVATAR_TONES = ['bg-gh-brand-soft text-gh-brand-deep', 'bg-gh-cta-soft text-gh-cta-deep', 'bg-gh-lime-soft text-gh-cta-deep']

function Reviews() {
  const { campaign } = useLp()
  const list = campaign.testimonials
  return (
    <>
      <p className="text-gh-ink-soft">Phản hồi sau khoảng hai tuần dùng sản phẩm.</p>
      <div className="mt-4 space-y-3">
        {list.map((t, i) => (
          <figure key={i} className="rounded-3xl bg-gh-canvas p-4">
            <figcaption className="flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-full font-bold ${AVATAR_TONES[i % 3]}`}>{(t.name.trim().split(/\s+/).pop() ?? '?').charAt(0).toUpperCase()}</span>
              <span>
                <b className="block">{t.name}</b>
                <span className="text-sm text-gh-ink-soft">{[t.area, t.symptom].filter(Boolean).join(' · ')}</span>
              </span>
            </figcaption>
            <blockquote className="mt-3 leading-relaxed">“{t.quote}”</blockquote>
            {t.isIllustration && <p className="mt-2 text-xs text-gh-ink-faint">Nội dung minh hoạ</p>}
          </figure>
        ))}
      </div>
      <p className="mt-4 text-sm text-gh-ink-faint">Hiệu quả tuỳ cơ địa từng người.</p>
    </>
  )
}

const STUDY_FALLBACK = [
  { title: 'Curcumin dạng phytosome hấp thu ra sao?', summary: 'So sánh mức hấp thu giữa curcumin bọc phospholipid và curcumin bột thường.', source: '', link: '' },
  { title: 'Phosphatidylcholine và lớp màng nhầy dạ dày', summary: 'Vai trò của phospholipid trong lớp nhầy che chở niêm mạc.', source: '', link: '' },
  { title: 'Piperine giữ curcumin trong cơ thể lâu hơn', summary: 'Ảnh hưởng của piperine tới tốc độ đào thải curcumin.', source: '', link: '' },
]

function Science({ openCompany }: { openCompany: () => void }) {
  const { campaign } = useLp()
  const studies = campaign.studies.length ? campaign.studies : STUDY_FALLBACK
  return (
    <>
      <p className="text-gh-ink-soft">Những nghiên cứu đứng sau công thức NatuComplex® 5.</p>
      <div className="mt-4 space-y-3">
        {studies.map((s, i) => (
          <article key={s.title} className="rounded-3xl bg-gh-canvas p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-gh-brand-deep">Nghiên cứu {i + 1}</span>
              <span className="font-extrabold text-gh-brand/30">0{i + 1}</span>
            </div>
            <h3 className="mt-2 font-bold">{s.title}</h3>
            {s.summary && <p className="mt-1 text-gh-ink-soft">{s.summary}</p>}
            <p className="mt-2 text-sm text-gh-ink-faint">
              {s.source || 'Tạp chí, cỡ mẫu và kết quả: đang cập nhật'}
              {s.link && /^https?:\/\//.test(s.link) && (
                <>
                  {' · '}
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-gh-brand-deep underline">
                    Xem nguồn
                  </a>
                </>
              )}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-4 rounded-3xl bg-gh-brand-mist p-4">
        <p className="font-bold text-gh-brand-deep">Về đơn vị tổ chức</p>
        <p className="mt-1 text-gh-ink-soft">Chương trình do {campaign.company.name || 'Công ty Cổ phần Bioscope Việt Nam'} thực hiện.</p>
        <button type="button" onClick={openCompany} className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-gh-brand-deep underline underline-offset-2">
          Xem thông tin công ty và chứng nhận
        </button>
      </div>
    </>
  )
}

function Points() {
  const { campaign } = useLp()
  return (
    <>
      <p className="leading-relaxed text-gh-ink-soft">
        Ai cũng có tên trong danh sách chờ. Quà có hạn nên danh sách xếp theo điểm: <b className="text-gh-ink">nhiều điểm hơn thì được gửi trước</b>.
      </p>
      <div className="mt-4 overflow-hidden rounded-3xl ring-1 ring-black/5">
        <PointTable variant="table" />
      </div>
      <p className="mt-4 rounded-3xl bg-gh-brand-mist p-4 leading-relaxed text-gh-ink-soft">
        Khi chốt, <b className="text-gh-ink">{campaign.slots} khách hàng có tổng điểm cao nhất</b> nhận quà tận nhà. Nếu bằng điểm, người tham gia
        sớm hơn được ưu tiên. Điểm tính lại từ đầu mỗi đợt.
      </p>
    </>
  )
}
