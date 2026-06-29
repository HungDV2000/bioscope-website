import './home.css'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://web.bioscope.vn'

export default function Home() {
  return (
    <div className="bs-notice">
      <section className="bs-notice__main">
        <div className="bs-notice__bg" aria-hidden />
        <div className="bs-notice__glow bs-notice__glow--1" aria-hidden />
        <div className="bs-notice__glow bs-notice__glow--2" aria-hidden />

        <div className="bs-notice__card">
          <span className="bs-notice__status">
            <span className="bs-notice__status-dot" />
            Dịch vụ hoạt động bình thường
          </span>

          <h1 className="bs-notice__title">Bioscope Vietnam</h1>

          <p className="bs-notice__body">
            Cảm ơn bạn đã ghé thăm. Website chính thức của Bioscope có đầy đủ thông tin về nguyên
            liệu, giải pháp và đối tác.
          </p>

          <a href={FRONTEND_URL} className="bs-notice__link">
            bioscope.vn →
          </a>
        </div>
      </section>

      <footer className="bs-notice__footer">© {new Date().getFullYear()} Bioscope Vietnam</footer>
    </div>
  )
}
