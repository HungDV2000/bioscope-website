import { homeImages } from "./home-images";

/** Công nghệ + nghiên cứu lâm sàng — khớp mockup example */
export const homeScienceTechs = [
  {
    slug: "liposome",
    name: { en: "Liposome Technology", vi: "Công nghệ Liposome" },
    tagline: {
      en: "Enhanced bioavailability up to 3.8x",
      vi: "Tăng sinh khả dụng lên đến 3.8 lần",
    },
    image: homeImages.tech.liposome,
  },
  {
    slug: "microencapsulation",
    name: { en: "Microencapsulation", vi: "Vi nang hóa" },
    tagline: {
      en: "Improves stability and protects actives",
      vi: "Cải thiện độ ổn định và bảo vệ hoạt chất",
    },
    image: homeImages.tech.microencapsulation,
  },
  {
    slug: "spray-drying",
    name: { en: "Spray Drying", vi: "Sấy phun" },
    tagline: {
      en: "Preserves potency and ensures consistency",
      vi: "Giữ hoạt tính và đảm bảo đồng nhất",
    },
    image: homeImages.tech.sprayDrying,
  },
] as const;

export const homeClinicalStudies = [
  {
    slug: "curcumin-phytosome",
    title: { en: "Curcumin Phytosome®", vi: "Curcumin Phytosome®" },
    excerpt: {
      en: "Improves joint comfort in 8 weeks",
      vi: "Cải thiện thoải mái khớp trong 8 tuần",
    },
    image: homeImages.studies.study1,
  },
  {
    slug: "bacopa-monnieri",
    title: { en: "Bacopa Monnieri Extract", vi: "Chiết xuất Bacopa Monnieri" },
    excerpt: {
      en: "Enhances memory and cognitive function",
      vi: "Tăng cường trí nhớ và chức năng nhận thức",
    },
    image: homeImages.studies.study2,
  },
  {
    slug: "omega-3-tg",
    title: { en: "Omega 3 TG Form", vi: "Omega 3 dạng TG" },
    excerpt: {
      en: "Supports heart health and triglyceride levels",
      vi: "Hỗ trợ sức khỏe tim mạch và triglyceride",
    },
    image: homeImages.studies.study3,
  },
  {
    slug: "collagen-peptide",
    title: { en: "Collagen Peptide", vi: "Collagen Peptide" },
    excerpt: {
      en: "Improves skin elasticity in 12 weeks",
      vi: "Cải thiện độ đàn hồi da trong 12 tuần",
    },
    image: homeImages.ingredients.collagen,
  },
] as const;
