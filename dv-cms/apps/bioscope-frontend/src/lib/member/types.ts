export type MemberStatus = 'pending' | 'approved' | 'rejected'

export type MemberSession = {
  email: string
  company: string
  contactName: string
  phone?: string
  status: MemberStatus
}

export type GatedDocument = {
  id: string
  title: string
  docType: 'COA' | 'SDS' | 'TDS' | 'Whitepaper'
  ingredient?: string
  updatedAt: string
}
