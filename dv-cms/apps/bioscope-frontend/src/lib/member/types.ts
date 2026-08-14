export type MemberStatus = 'pending' | 'approved' | 'rejected'

/** Cách tài khoản được tạo — quyết định có cho đổi mật khẩu hay không. */
export type AuthProvider = 'password' | 'google'

/** Khách doanh nghiệp cần thông tin công ty; khách cá nhân thì không. */
export type CustomerType = 'business' | 'individual'

export type MemberSession = {
  id: string | number
  email: string
  customerType?: CustomerType
  company: string
  taxCode?: string
  position?: string
  contactName: string
  phone?: string
  status: MemberStatus
  authProvider?: AuthProvider
  /** Email đã xác thực (qua Google) — dùng để hiển thị, không mở quyền tài liệu. */
  emailVerified?: boolean
  /** Thời điểm cấp phiên (epoch ms) — dùng để hết hạn phía server. */
  iat?: number
}

export type GatedDocument = {
  id: string
  title: string
  docType: 'COA' | 'SDS' | 'TDS' | 'Whitepaper'
  ingredient?: string
  updatedAt: string
}
