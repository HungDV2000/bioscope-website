import type { Locale } from './config'

export type PageExtras = {
  solutionsPage: { icpTitle: string; icpDesc: string }
  coCreatePage: {
    compareTitle: string
    compareDesc: string
    traditionalTitle: string
    bioscopeTitle: string
    stepLabel: string
    casesTitle: string
    casesDesc: string
    readCase: string
    journey: { title: string; desc: string }[]
  }
  rdPage: {
    stats: { label: string }[]
    techTitle: string
    researchTitle: string
    researchDesc: string
    partnersTitle: string
    partnersDesc: string
    papersTitle: string
    papersDesc: string
    gated: string
  }
  resourcesPage: {
    gated: string
    public: string
    comingSoon: string
    backToResources: string
    viewAllCaseStudies: string
    emptyTitle: string
    emptyDesc: string
    explore: string
    featured: string
    newsletterTitle: string
    newsletterDesc: string
    newsletterPlaceholder: string
    newsletterButton: string
  }
  blogPage: {
    search: string
    searchPlaceholder: string
    topics: string
    allTopics: string
    industries: string
    allIndustries: string
    clearFilters: string
    articleCount: string
    pageOf: string
    featured: string
    readArticle: string
    readMore: string
    noResults: string
    minRead: string
    backToBlog: string
    relatedTitle: string
    relatedDesc: string
    toc: string
    share: string
    copyLink: string
    copied: string
    author: string
    authorBio: string
    comments: string
    commentPrompt: string
    nameLabel: string
    emailLabel: string
    contentLabel: string
    namePlaceholder: string
    emailPlaceholder: string
    commentPlaceholder: string
    commentModeration: string
    submitComment: string
    commentThanks: string
    prevPage: string
    nextPage: string
    pagination: string
  }
  ingredientsCatalog: {
    tags: Record<string, string>
    searchPlaceholder: string
    advancedSearch: string
    allIndustries: string
    pagination: string
    prevPage: string
    nextPage: string
    close: string
    filters: Record<string, string>
    moqAny: string
    results: string
    noResults: string
    clearFilters: string
    applyFilters: string
    viewDetails: string
    clearAdvanced: string
    ingredientsUnit: string
    pageOf: string
    originLabel: string
    advancedTitle: string
    advancedDesc: string
    tryClearFilters: string
    reset: string
    cancel: string
    applyFiltersFull: string
    moqMax: string
  }
}

const vi: PageExtras = {
  solutionsPage: {
    icpTitle: 'Ai phù hợp với giải pháp nào?',
    icpDesc:
      'Tùy năng lực nội bộ và mục tiêu kinh doanh, bạn có thể chọn mức độ đồng hành phù hợp — từ cung cấp nguyên liệu đến đồng kiến tạo trọn hành trình.',
  },
  coCreatePage: {
    compareTitle: 'So sánh mô hình hợp tác',
    compareDesc: 'Chúng tôi không chỉ cung cấp. Chúng tôi đồng kiến tạo — từ ý tưởng đến thành công thị trường.',
    traditionalTitle: 'Nhà phân phối thông thường',
    bioscopeTitle: 'Bioscope — Đồng kiến tạo',
    stepLabel: 'Bước',
    casesTitle: 'Câu chuyện đồng kiến tạo thực tế',
    casesDesc:
      'vivomega®, Gastroheal và PEA — minh chứng cho hành trình 5 bước từ ý tưởng đến tăng trưởng đo lường được.',
    readCase: 'Đọc case study',
    journey: [
      {
        title: 'Ý tưởng',
        desc: 'Thấu hiểu nhu cầu & nắm bắt xu hướng. Cùng bạn phân tích thị trường, đối tượng mục tiêu, phân khúc và cơ hội.',
      },
      {
        title: 'Nghiên cứu & đề xuất',
        desc: 'Lựa chọn nguyên liệu, công nghệ và đề xuất công thức tối ưu hiệu quả/chi phí.',
      },
      {
        title: 'Kiểm chứng & thử nghiệm',
        desc: 'Tạo mẫu, kiểm nghiệm hiệu quả và độ an toàn; test tín hiệu thị trường qua kênh online trước khi sản xuất lớn.',
      },
      {
        title: 'Phát triển & ra mắt',
        desc: 'Hoàn thiện sản phẩm, hỗ trợ pháp lý, sản xuất và đưa ra thị trường.',
      },
      {
        title: 'Tăng trưởng & đồng hành',
        desc: 'Tối ưu liên tục, mở rộng danh mục, đồng hành xây dựng thương hiệu bền vững.',
      },
    ],
  },
  rdPage: {
    stats: [
      { label: 'Dự án nghiên cứu' },
      { label: 'Đơn sáng chế' },
      { label: 'Nguyên liệu công nghệ cao' },
      { label: 'Đối tác R&D toàn cầu' },
    ],
    techTitle: 'Công nghệ độc quyền của Bioscope',
    researchTitle: 'Lĩnh vực nghiên cứu',
    researchDesc:
      '23+ dự án R&D tập trung vào sinh khả dụng, dẫn truyền qua da, nano hoạt chất và các phân khúc sức khỏe trọng điểm.',
    partnersTitle: 'Đối tác R&D quốc tế',
    partnersDesc:
      'Hợp tác trực tiếp với các nhà sản xuất và viện nghiên cứu hàng đầu tại hơn 50 quốc gia — đảm bảo nguồn công nghệ và nguyên liệu luôn cập nhật.',
    papersTitle: 'Tài liệu chuyên môn & công bố',
    papersDesc: 'Tài liệu chuyên sâu từ đội ngũ R&D — một số yêu cầu email để tải.',
    gated: 'Cần đăng ký',
  },
  resourcesPage: {
    gated: 'Cần đăng ký',
    public: 'Public',
    comingSoon: 'Sắp ra mắt',
    backToResources: 'Quay lại Tài nguyên',
    viewAllCaseStudies: 'Xem tất cả Case Study',
    emptyTitle: 'Nội dung đang được cập nhật',
    emptyDesc: 'Đăng ký nhận tin để không bỏ lỡ khi có tài liệu mới trong danh mục này.',
    explore: 'Khám phá',
    featured: 'Nội dung nổi bật',
    newsletterTitle: 'Nhận tài liệu mới qua email',
    newsletterDesc: 'Whitepaper, checklist và bài viết chuyên môn — gửi thẳng tới hộp thư của bạn.',
    newsletterPlaceholder: 'Email công việc của bạn',
    newsletterButton: 'Đăng ký',
  },
  blogPage: {
    search: 'Tìm kiếm',
    searchPlaceholder: 'Tiêu đề, từ khóa…',
    topics: 'Chủ đề',
    allTopics: 'Tất cả chủ đề',
    industries: 'Ngành',
    allIndustries: 'Tất cả ngành',
    clearFilters: 'Xóa bộ lọc',
    articleCount: 'bài viết',
    pageOf: 'Trang',
    featured: 'Nổi bật',
    readArticle: 'Đọc bài viết',
    readMore: 'Đọc thêm',
    noResults: 'Không tìm thấy bài viết phù hợp. Thử từ khóa hoặc bộ lọc khác.',
    minRead: 'phút đọc',
    backToBlog: 'Quay lại Blog chuyên môn',
    relatedTitle: 'Bài viết liên quan',
    relatedDesc: 'Cùng chủ đề hoặc ngành — gợi ý đọc tiếp.',
    toc: 'Mục lục',
    share: 'Chia sẻ',
    copyLink: 'Sao chép link',
    copied: 'Đã sao chép',
    author: 'Tác giả',
    authorBio:
      'Đội ngũ nghiên cứu & ứng dụng của Bioscope — chia sẻ kiến thức chuyên môn về nguyên liệu, công thức và phát triển nhãn hàng.',
    comments: 'Bình luận',
    commentPrompt: 'Chia sẻ câu hỏi hoặc kinh nghiệm của bạn về',
    nameLabel: 'Họ tên *',
    emailLabel: 'Email công việc',
    contentLabel: 'Nội dung *',
    namePlaceholder: 'Nguyễn Văn A',
    emailPlaceholder: 'ban@congty.com',
    commentPlaceholder: 'Viết bình luận của bạn…',
    commentModeration: 'Bình luận sẽ được kiểm duyệt trước khi hiển thị công khai.',
    submitComment: 'Gửi bình luận',
    commentThanks: 'Cảm ơn bạn! Bình luận đã được ghi nhận và hiển thị tạm thời trên trang này.',
    prevPage: 'Trang trước',
    nextPage: 'Trang sau',
    pagination: 'Phân trang blog',
  },
  ingredientsCatalog: {
    tags: { NEW: 'Mới', TRENDING: 'Nổi bật', EXCLUSIVE: 'Độc quyền' },
    searchPlaceholder: 'Tìm theo tên, nhóm hoặc công dụng…',
    advancedSearch: 'Tìm kiếm nâng cao',
    allIndustries: 'Tất cả ngành',
    pagination: 'Phân trang',
    prevPage: 'Trang trước',
    nextPage: 'Trang sau',
    close: 'Đóng',
    filters: {
      industry: 'Ngành hàng',
      category: 'Nhóm nguyên liệu',
      origin: 'Xuất xứ',
      form: 'Dạng bào chế',
      application: 'Ứng dụng',
      cert: 'Chứng nhận',
      tag: 'Nhãn nổi bật',
      moq: 'MOQ',
    },
    moqAny: 'Không giới hạn',
    results: 'kết quả',
    noResults: 'Không tìm thấy nguyên liệu phù hợp.',
    clearFilters: 'Xóa bộ lọc',
    applyFilters: 'Áp dụng',
    viewDetails: 'Xem chi tiết',
    clearAdvanced: 'Xóa bộ lọc nâng cao',
    ingredientsUnit: 'nguyên liệu',
    pageOf: 'Trang',
    originLabel: 'Xuất xứ',
    advancedTitle: 'Tìm kiếm nâng cao',
    advancedDesc: 'Chọn nhiều tiêu chí để thu hẹp danh mục',
    tryClearFilters: 'Không tìm thấy nguyên liệu phù hợp. Thử xóa bớt bộ lọc.',
    reset: 'Đặt lại',
    cancel: 'Hủy',
    applyFiltersFull: 'Áp dụng bộ lọc',
    moqMax: 'MOQ tối đa',
  },
}

const en: PageExtras = {
  solutionsPage: {
    icpTitle: 'Which solution fits you?',
    icpDesc:
      'Depending on internal capabilities and business goals, choose the right level of partnership — from ingredient supply to full-journey co-creation.',
  },
  coCreatePage: {
    compareTitle: 'Partnership model comparison',
    compareDesc: 'We do not just supply. We co-create — from idea to market success.',
    traditionalTitle: 'Traditional distributor',
    bioscopeTitle: 'Bioscope — Co-creation',
    stepLabel: 'Step',
    casesTitle: 'Real co-creation stories',
    casesDesc:
      'vivomega®, Gastroheal, and PEA — proof of a 5-step journey from idea to measurable growth.',
    readCase: 'Read case study',
    journey: [
      {
        title: 'Ideation',
        desc: 'Understand needs and capture trends. Together we analyze market, target audience, segments, and opportunities.',
      },
      {
        title: 'Research & proposal',
        desc: 'Select ingredients, technologies, and propose formulas optimized for efficacy and cost.',
      },
      {
        title: 'Validation & testing',
        desc: 'Create samples, test efficacy and safety; validate market signals online before large-scale production.',
      },
      {
        title: 'Development & launch',
        desc: 'Finalize product, support regulatory compliance, manufacturing, and go-to-market.',
      },
      {
        title: 'Growth & partnership',
        desc: 'Continuous optimization, portfolio expansion, and sustainable brand building together.',
      },
    ],
  },
  rdPage: {
    stats: [
      { label: 'Research projects' },
      { label: 'Patents' },
      { label: 'High-tech ingredients' },
      { label: 'Global R&D partners' },
    ],
    techTitle: 'Bioscope proprietary technologies',
    researchTitle: 'Research areas',
    researchDesc:
      '23+ R&D projects focused on bioavailability, transdermal delivery, nano actives, and key health segments.',
    partnersTitle: 'International R&D partners',
    partnersDesc:
      'Direct partnerships with leading manufacturers and research institutes in 50+ countries — ensuring access to the latest technologies and ingredients.',
    papersTitle: 'Expert materials & publications',
    papersDesc: 'In-depth materials from our R&D team — some require email registration to download.',
    gated: 'Registration required',
  },
  resourcesPage: {
    gated: 'Registration required',
    public: 'Public',
    comingSoon: 'Coming soon',
    backToResources: 'Back to Resources',
    viewAllCaseStudies: 'View all case studies',
    emptyTitle: 'Content coming soon',
    emptyDesc: 'Subscribe to our newsletter to be notified when new materials are added to this category.',
    explore: 'Explore',
    featured: 'Featured content',
    newsletterTitle: 'Get new resources by email',
    newsletterDesc: 'Whitepapers, checklists, and expert articles — delivered to your inbox.',
    newsletterPlaceholder: 'Your work email',
    newsletterButton: 'Subscribe',
  },
  blogPage: {
    search: 'Search',
    searchPlaceholder: 'Title, keywords…',
    topics: 'Topics',
    allTopics: 'All topics',
    industries: 'Industry',
    allIndustries: 'All industries',
    clearFilters: 'Clear filters',
    articleCount: 'articles',
    pageOf: 'Page',
    featured: 'Featured',
    readArticle: 'Read article',
    readMore: 'Read more',
    noResults: 'No matching articles. Try different keywords or filters.',
    minRead: 'min read',
    backToBlog: 'Back to Expert blog',
    relatedTitle: 'Related articles',
    relatedDesc: 'Same topic or industry — suggested reading.',
    toc: 'Table of contents',
    share: 'Share',
    copyLink: 'Copy link',
    copied: 'Copied',
    author: 'Author',
    authorBio:
      'The Bioscope research & application team — sharing expert knowledge on ingredients, formulation, and brand development.',
    comments: 'Comments',
    commentPrompt: 'Share your questions or experience about',
    nameLabel: 'Full name *',
    emailLabel: 'Work email',
    contentLabel: 'Comment *',
    namePlaceholder: 'Jane Doe',
    emailPlaceholder: 'you@company.com',
    commentPlaceholder: 'Write your comment…',
    commentModeration: 'Comments are moderated before being published.',
    submitComment: 'Submit comment',
    commentThanks: 'Thank you! Your comment has been recorded and shown temporarily on this page.',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    pagination: 'Blog pagination',
  },
  ingredientsCatalog: {
    tags: { NEW: 'New', TRENDING: 'Trending', EXCLUSIVE: 'Exclusive' },
    searchPlaceholder: 'Search by name, category, or benefit…',
    advancedSearch: 'Advanced search',
    allIndustries: 'All industries',
    pagination: 'Pagination',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    close: 'Close',
    filters: {
      industry: 'Industry',
      category: 'Ingredient category',
      origin: 'Origin',
      form: 'Dosage form',
      application: 'Application',
      cert: 'Certification',
      tag: 'Featured tags',
      moq: 'MOQ',
    },
    moqAny: 'No limit',
    results: 'results',
    noResults: 'No matching ingredients found.',
    clearFilters: 'Clear filters',
    applyFilters: 'Apply',
    viewDetails: 'View details',
    clearAdvanced: 'Clear advanced filters',
    ingredientsUnit: 'ingredients',
    pageOf: 'Page',
    originLabel: 'Origin',
    advancedTitle: 'Advanced search',
    advancedDesc: 'Select multiple criteria to narrow the catalog',
    tryClearFilters: 'No matching ingredients. Try clearing some filters.',
    reset: 'Reset',
    cancel: 'Cancel',
    applyFiltersFull: 'Apply filters',
    moqMax: 'Max MOQ',
  },
}

export function getPageExtras(locale: Locale): PageExtras {
  return locale === 'en' ? en : vi
}
