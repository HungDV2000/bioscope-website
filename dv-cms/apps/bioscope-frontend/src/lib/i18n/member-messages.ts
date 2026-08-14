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
    google: string
    or: string
    noAccount: string
    signUp: string
    errors: {
      invalid: string
      pending: string
      rejected: string
      network: string
      server: string
      googleOff: string
      googleFailed: string
    }
  }
  register: {
    title: string
    subtitle: string
    typeLegend: string
    typeBusiness: string
    typeBusinessHint: string
    typeIndividual: string
    typeIndividualHint: string
    taxCode: string
    position: string
    contactNameIndividual: string
    company: string
    contactName: string
    phone: string
    email: string
    password: string
    passwordHint: string
    submit: string
    haveAccount: string
    signIn: string
    doneTitle: string
    doneDesc: string
    errors: { emailTaken: string; invalid: string; network: string; off: string }
  }
  account: {
    title: string
    desc: string
    profileTitle: string
    typeLegend: string
    typeBusiness: string
    typeBusinessHint: string
    typeIndividual: string
    typeIndividualHint: string
    taxCode: string
    position: string
    contactNameIndividual: string
    company: string
    contactName: string
    phone: string
    email: string
    emailNote: string
    save: string
    saved: string
    passwordTitle: string
    passwordSetTitle: string
    currentPassword: string
    newPassword: string
    confirmPassword: string
    changeSubmit: string
    changed: string
    googleNote: string
    statusPendingNote: string
    errors: { mismatch: string; tooShort: string; wrongCurrent: string; failed: string }
  }
  nav: {
    dashboard: string
    documents: string
    account: string
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
    empty: string
    needApproval: string
  }
}

const vi: MemberMessages = {
  portalName: 'Cổng đối tác B2B',
  demoBanner: 'Tài khoản đang chờ Bioscope duyệt — khu tài liệu B2B sẽ mở sau khi được duyệt.',
  login: {
    title: 'Đăng nhập đối tác',
    subtitle: 'Truy cập COA, SDS, TDS và tài liệu gated dành cho khách hàng đã duyệt.',
    email: 'Email công việc',
    password: 'Mật khẩu',
    submit: 'Đăng nhập',
    backToSite: '← Về website',
    google: 'Đăng nhập bằng Google',
    or: 'hoặc',
    noAccount: 'Chưa có tài khoản?',
    signUp: 'Đăng ký ngay',
    errors: {
      invalid: 'Sai email hoặc mật khẩu.',
      pending: 'Tài khoản đang chờ duyệt — bạn vẫn nhắn tin cho chúng tôi được.',
      rejected: 'Tài khoản không được phép truy cập.',
      network: 'Không kết nối được máy chủ. Thử lại sau.',
      server: 'Máy chủ chưa cấu hình xong. Vui lòng báo quản trị viên.',
      googleOff: 'Đăng nhập bằng Google chưa được bật.',
      googleFailed: 'Đăng nhập bằng Google thất bại. Thử lại nhé.',
    },
  },
  register: {
    title: 'Đăng ký tài khoản đối tác',
    subtitle: 'Tạo tài khoản để nhắn tin với đội ngũ Bioscope và theo dõi tài liệu kỹ thuật.',
    typeLegend: 'Bạn đăng ký với tư cách',
    typeBusiness: 'Doanh nghiệp',
    typeBusinessHint: 'Công ty, nhà máy, đơn vị phân phối',
    typeIndividual: 'Cá nhân',
    typeIndividualHint: 'Nghiên cứu viên, dược sĩ, khách lẻ',
    taxCode: 'Mã số thuế',
    position: 'Chức vụ',
    contactNameIndividual: 'Họ và tên',
    company: 'Tên công ty',
    contactName: 'Người liên hệ',
    phone: 'Số điện thoại',
    email: 'Email công việc',
    password: 'Mật khẩu',
    passwordHint: 'Tối thiểu 8 ký tự.',
    submit: 'Đăng ký',
    haveAccount: 'Đã có tài khoản?',
    signIn: 'Đăng nhập',
    doneTitle: 'Đăng ký thành công 🎉',
    doneDesc: 'Bạn đã có thể đăng nhập và nhắn tin với chúng tôi. Khu tài liệu B2B sẽ mở sau khi Bioscope duyệt tài khoản.',
    errors: {
      emailTaken: 'Email này đã được đăng ký.',
      invalid: 'Thông tin chưa hợp lệ, kiểm tra lại giúp bạn nhé.',
      network: 'Không kết nối được máy chủ. Thử lại sau.',
      off: 'Hệ thống đang tạm ngừng nhận đăng ký mới.',
    },
  },
  account: {
    title: 'Tài khoản của tôi',
    desc: 'Cập nhật thông tin liên hệ và mật khẩu đăng nhập.',
    profileTitle: 'Thông tin liên hệ',
    typeLegend: 'Loại khách hàng',
    typeBusiness: 'Doanh nghiệp',
    typeBusinessHint: 'Công ty, nhà máy, đơn vị phân phối',
    typeIndividual: 'Cá nhân',
    typeIndividualHint: 'Nghiên cứu viên, dược sĩ, khách lẻ',
    taxCode: 'Mã số thuế',
    position: 'Chức vụ',
    contactNameIndividual: 'Họ và tên',
    company: 'Tên công ty',
    contactName: 'Người liên hệ',
    phone: 'Số điện thoại',
    email: 'Email đăng nhập',
    emailNote: 'Email đăng nhập không đổi được. Cần đổi vui lòng liên hệ Bioscope.',
    save: 'Lưu thay đổi',
    saved: 'Đã lưu thông tin.',
    passwordTitle: 'Đổi mật khẩu',
    passwordSetTitle: 'Đặt mật khẩu',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Nhập lại mật khẩu mới',
    changeSubmit: 'Cập nhật mật khẩu',
    changed: 'Đã đổi mật khẩu.',
    googleNote: 'Tài khoản này đăng nhập bằng Google. Bạn có thể đặt thêm mật khẩu để đăng nhập trực tiếp.',
    statusPendingNote: 'Tài khoản đang chờ duyệt — bạn vẫn chat và sửa hồ sơ bình thường. Khu tài liệu B2B mở sau khi Bioscope duyệt.',
    errors: {
      mismatch: 'Hai ô mật khẩu mới chưa khớp.',
      tooShort: 'Mật khẩu mới phải từ 8 ký tự.',
      wrongCurrent: 'Mật khẩu hiện tại không đúng.',
      failed: 'Không cập nhật được. Thử lại sau.',
    },
  },
  nav: {
    dashboard: 'Tổng quan',
    documents: 'Tài liệu gated',
    account: 'Tài khoản',
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
    demoDownload: 'Tải tài liệu',
    empty: 'Chưa có tài liệu nào được chia sẻ cho tài khoản của bạn.',
    needApproval: 'Khu tài liệu B2B sẽ mở sau khi Bioscope duyệt tài khoản của bạn.',
  },
}

const en: MemberMessages = {
  portalName: 'B2B Partner Portal',
  demoBanner: 'Your account is awaiting approval — the B2B document area opens once approved.',
  login: {
    title: 'Partner sign in',
    subtitle: 'Access COA, SDS, TDS, and gated materials for approved customers.',
    email: 'Work email',
    password: 'Password',
    submit: 'Sign in',
    backToSite: '← Back to website',
    google: 'Continue with Google',
    or: 'or',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    errors: {
      invalid: 'Invalid email or password.',
      pending: 'Account pending approval — you can still message us.',
      rejected: 'Account access denied.',
      network: 'Could not reach server. Try again later.',
      server: 'Server is not fully configured. Please notify an administrator.',
      googleOff: 'Google sign-in is not enabled.',
      googleFailed: 'Google sign-in failed. Please try again.',
    },
  },
  register: {
    title: 'Create a partner account',
    subtitle: 'Sign up to message the Bioscope team and follow technical documents.',
    typeLegend: 'You are registering as',
    typeBusiness: 'Business',
    typeBusinessHint: 'Company, factory, distributor',
    typeIndividual: 'Individual',
    typeIndividualHint: 'Researcher, pharmacist, retail buyer',
    taxCode: 'Tax code',
    position: 'Job title',
    contactNameIndividual: 'Full name',
    company: 'Company name',
    contactName: 'Contact person',
    phone: 'Phone number',
    email: 'Work email',
    password: 'Password',
    passwordHint: 'At least 8 characters.',
    submit: 'Sign up',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    doneTitle: 'Account created 🎉',
    doneDesc: 'You can sign in and message us right away. The B2B document area opens once Bioscope approves your account.',
    errors: {
      emailTaken: 'This email is already registered.',
      invalid: 'Some details are invalid, please check again.',
      network: 'Could not reach server. Try again later.',
      off: 'New sign-ups are temporarily closed.',
    },
  },
  account: {
    title: 'My account',
    desc: 'Update your contact details and sign-in password.',
    profileTitle: 'Contact details',
    typeLegend: 'Customer type',
    typeBusiness: 'Business',
    typeBusinessHint: 'Company, factory, distributor',
    typeIndividual: 'Individual',
    typeIndividualHint: 'Researcher, pharmacist, retail buyer',
    taxCode: 'Tax code',
    position: 'Job title',
    contactNameIndividual: 'Full name',
    company: 'Company name',
    contactName: 'Contact person',
    phone: 'Phone number',
    email: 'Sign-in email',
    emailNote: 'Sign-in email cannot be changed. Contact Bioscope if you need it updated.',
    save: 'Save changes',
    saved: 'Details saved.',
    passwordTitle: 'Change password',
    passwordSetTitle: 'Set a password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Repeat new password',
    changeSubmit: 'Update password',
    changed: 'Password updated.',
    googleNote: 'This account signs in with Google. You may also set a password to sign in directly.',
    statusPendingNote: 'Account pending approval — you can still chat and edit your profile. The B2B document area opens after approval.',
    errors: {
      mismatch: 'The two new password fields do not match.',
      tooShort: 'New password must be at least 8 characters.',
      wrongCurrent: 'Current password is incorrect.',
      failed: 'Could not update. Try again later.',
    },
  },
  nav: {
    dashboard: 'Overview',
    documents: 'Gated documents',
    account: 'Account',
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
    demoDownload: 'Download document',
    empty: 'No documents have been shared with your account yet.',
    needApproval: 'The B2B document area opens once Bioscope approves your account.',
  },
}

export function getMemberMessages(locale: Locale): MemberMessages {
  return locale === 'en' ? en : vi
}
