import type { GatedDocument, MemberSession } from './types'

/** Khớp seed CMS — xem `apps/core-cms/src/seed/runSeed.ts` */
export const MOCK_MEMBER_ACCOUNTS: (MemberSession & { password: string })[] = [
  {
    email: 'member@acme.com',
    password: 'Member@123',
    company: 'ACME Pharma',
    contactName: 'Nguyễn Văn A',
    phone: '0900000000',
    status: 'approved',
  },
  {
    email: 'pending@acme.com',
    password: 'Member@123',
    company: 'Pending Co',
    contactName: 'Trần Thị B',
    phone: '0900000001',
    status: 'pending',
  },
]

export const MOCK_GATED_DOCUMENTS: GatedDocument[] = [
  {
    id: 'coa-curcumin-95',
    title: 'CoA mẫu – Curcumin 95%',
    docType: 'COA',
    ingredient: 'Curcumin Extract 95%',
    updatedAt: '2026-05-12',
  },
  {
    id: 'sds-omega-3',
    title: 'SDS – Omega-3 Fish Oil TG',
    docType: 'SDS',
    ingredient: 'Omega-3 Fish Oil',
    updatedAt: '2026-04-28',
  },
  {
    id: 'tds-phytosome',
    title: 'TDS – Phytosome Curcumin (ướt)',
    docType: 'TDS',
    ingredient: 'Phytosome Curcumin',
    updatedAt: '2026-04-15',
  },
  {
    id: 'wp-curcumin-bio',
    title: 'Whitepaper – Sinh khả dụng Curcumin',
    docType: 'Whitepaper',
    updatedAt: '2026-03-20',
  },
]
