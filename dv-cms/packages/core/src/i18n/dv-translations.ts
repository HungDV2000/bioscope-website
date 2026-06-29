/** Custom admin UI strings — use as `t('dv:…')` in client components. */
export const dvTranslations = {
  en: {
    general: {
      locale: 'Content language',
    },
    dv: {
      dashboard: {
        greetingMorning: 'Good morning',
        greetingNoon: 'Good afternoon',
        greetingAfternoon: 'Good afternoon',
        greetingEvening: 'Good evening',
        subtitle: 'Bioscope admin dashboard — pick an item below to get started.',
      },
      login: {
        subtitle: 'Sign in with an authorized admin account',
        backToSite: '← Back to Bioscope website',
      },
      seed: {
        title: 'Sample content',
        description:
          'Create or refresh all sample data (media library, forms, ingredients, case studies, FAQs, posts, pages…). Safe to re-run — existing records are updated, not duplicated.',
        run: 'Run seed / refresh data',
        running: 'Running seed…',
        success: '✅ Seed completed',
        failed: 'Seed failed.',
        apiError: 'Could not reach the API.',
      },
    },
  },
  vi: {
    general: {
      locale: 'Ngôn ngữ nội dung',
    },
    dv: {
      dashboard: {
        greetingMorning: 'Chào buổi sáng',
        greetingNoon: 'Chào buổi trưa',
        greetingAfternoon: 'Chào buổi chiều',
        greetingEvening: 'Chào buổi tối',
        subtitle: 'Bảng điều khiển quản trị Bioscope — chọn một mục bên dưới để bắt đầu.',
      },
      login: {
        subtitle: 'Đăng nhập bằng tài khoản quản trị được cấp quyền',
        backToSite: '← Về website Bioscope',
      },
      seed: {
        title: 'Dữ liệu mẫu nội dung',
        description:
          'Tạo/cập nhật toàn bộ dữ liệu mẫu (thư viện ảnh, form, nguyên liệu, case study, FAQ, bài viết, trang…). An toàn khi chạy lại — dữ liệu đã có sẽ được cập nhật, không nhân đôi.',
        run: 'Chạy seed / cập nhật dữ liệu',
        running: 'Đang chạy seed…',
        success: '✅ Seed thành công',
        failed: 'Seed thất bại.',
        apiError: 'Không gọi được API.',
      },
    },
  },
} as const
