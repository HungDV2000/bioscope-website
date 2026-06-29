import type { WidgetServerProps } from 'payload'

const greeting = (hour: number, locale: string) => {
  const vi = locale === 'vi'
  if (hour < 11) return vi ? 'Chào buổi sáng' : 'Good morning'
  if (hour < 14) return vi ? 'Chào buổi trưa' : 'Good afternoon'
  if (hour < 18) return vi ? 'Chào buổi chiều' : 'Good afternoon'
  return vi ? 'Chào buổi tối' : 'Good evening'
}

export default async function WelcomeWidget({ req }: WidgetServerProps) {
  const locale = req.locale === 'en' ? 'en' : 'vi'
  const name = req.user && 'name' in req.user ? String(req.user.name ?? '') : ''
  const greet = greeting(new Date().getHours(), locale)
  const subtitle =
    locale === 'vi'
      ? 'Bảng điều khiển Bioscope — theo dõi nội dung, thống kê và truy cập nhanh các chức năng.'
      : 'Bioscope dashboard — track content, stats, and quick access to key areas.'

  return (
    <div className="card dv-dashboard-welcome">
      <h2>
        👋 {greet}
        {name ? `, ${name}` : ''}
      </h2>
      <p>{subtitle}</p>
    </div>
  )
}

export { WelcomeWidget }
