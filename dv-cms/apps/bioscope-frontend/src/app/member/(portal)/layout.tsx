import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/member/auth'

export default async function MemberPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getMemberSession()
  if (!session || session.status !== 'approved') {
    redirect('/member/login')
  }
  return children
}
