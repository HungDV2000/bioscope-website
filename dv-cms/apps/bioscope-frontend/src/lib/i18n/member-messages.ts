import type { Locale } from './config'

export type MemberMessages = {
  portalName: string
  demoBanner: string
  login: {
    title: string
    subtitle: string
    email: string
    password: string
    submit: string
    backToSite: string
    demoTitle: string
    demoApproved: string
    demoPending: string
    errors: {
      invalid: string
      pending: string
      rejected: string
      network: string
    }
  }
  nav: {
    dashboard: string
    documents: string
    logout: string
    backToSite: string
  }
  dashboard: {
    welcome: string
    company: string
    contact: string
    status: string
    statusApproved: string
    recentDocs: string
    viewAll: string
    quickActions: string
    downloadCoa: string
    contactSupport: string
  }
  documents: {
    title: string
    desc: string
    colTitle: string
    colType: string
    colIngredient: string
    colUpdated: string
    colAction: string
    download: string
    demoDownload: string
  }
}

const vi: MemberMessages = {
  portalName: 'Cổng đối tác B2B',
  demoBanner: 'Chế độ demo — đăng nhập giả lập, chưa kết nối API CMS.',
  login: {
    title: 'Đăng nhập đối tác',
    subtitle: 'Truy cập COA, SDS, TDS và tài liệu gated dành cho khách hàng đã duyệt.',
    email: 'Email công việc',
    password: 'Mật khẩu',
    submit: 'Đăng nhập',
    backToSite: '← Về website',
    demoTitle: 'Tài khoản demo',
    demoApproved: 'Đã duyệt: member@acme.com / Member@123',
    demoPending: 'Chờ duyệt: pending@acme.com / Member@123',
    errors: {
      invalid: 'Sai email hoặc mật khẩu.',
      pending: 'Tài khoản đang chờ duyệt. Vui lòng liên hệ Bioscope.',
      rejected: 'Tài khoản không được phép truy cập.',
      network: 'Không kết nối được máy chủ. Thử lại sau.',
    },
  },
  nav: {
    dashboard: 'Tổng quan',
    documents: 'Tài liệu gated',
    logout: 'Đăng xuất',
    backToSite: 'Website',
  },
  dashboard: {
    welcome: 'Xin chào',
    company: 'Công ty',
    contact: 'Người liên hệ',
    status: 'Trạng thái',
    statusApproved: 'Đã duyệt',
    recentDocs: 'Tài liệu gần đây',
    viewAll: 'Xem tất cả',
    quickActions: 'Thao tác nhanh',
    downloadCoa: 'Tải COA mẫu',
    contactSupport: 'Liên hệ hỗ trợ',
  },
  documents: {
    title: 'Tài liệu gated',
    desc: 'COA, SDS, TDS và whitepaper — chỉ dành cho đối tác đã duyệt.',
    colTitle: 'Tên tài liệu',
    colType: 'Loại',
    colIngredient: 'Nguyên liệu',
    colUpdated: 'Cập nhật',
    colAction: 'Tải về',
    download: 'Tải xuống',
    demoDownload: 'Demo — chưa có file thật',
  },
}

const en: MemberMessages = {
  portalName: 'B2B Partner Portal',
  demoBanner: 'Demo mode — mock login, CMS API not connected yet.',
  login: {
    title: 'Partner sign in',
    subtitle: 'Access COA, SDS, TDS, and gated materials for approved customers.',
    email: 'Work email',
    password: 'Password',
    submit: 'Sign in',
    backToSite: '← Back to website',
    demoTitle: 'Demo accounts',
    demoApproved: 'Approved: member@acme.com / Member@123',
    demoPending: 'Pending: pending@acme.com / Member@123',
    errors: {
      invalid: 'Invalid email or password.',
      pending: 'Account pending approval. Please contact Bioscope.',
      rejected: 'Account access denied.',
      network: 'Could not reach server. Try again later.',
    },
  },
  nav: {
    dashboard: 'Overview',
    documents: 'Gated documents',
    logout: 'Sign out',
    backToSite: 'Website',
  },
  dashboard: {
    welcome: 'Welcome',
    company: 'Company',
    contact: 'Contact',
    status: 'Status',
    statusApproved: 'Approved',
    recentDocs: 'Recent documents',
    viewAll: 'View all',
    quickActions: 'Quick actions',
    downloadCoa: 'Download sample CoA',
    contactSupport: 'Contact support',
  },
  documents: {
    title: 'Gated documents',
    desc: 'COA, SDS, TDS, and whitepapers — for approved partners only.',
    colTitle: 'Document',
    colType: 'Type',
    colIngredient: 'Ingredient',
    colUpdated: 'Updated',
    colAction: 'Download',
    download: 'Download',
    demoDownload: 'Demo — no real file yet',
  },
}

export function getMemberMessages(locale: Locale): MemberMessages {
  return locale === 'en' ? en : vi
}
