export type Bilingual = { vi: string; en: string };

export interface Spec {
  label: Bilingual;
  value: string;
  unit?: string;
  display: "text" | "bar" | "donut" | "number";
  /** % cho thanh bar/donut (0-100) */
  percent?: number;
}

export interface Technology {
  slug: string;
  name: Bilingual;
  tagline: Bilingual;
  description: Bilingual;
  mechanism: Bilingual;
  image: string;
  accent: string;
  specs: Spec[];
  order: number;
}

export interface Ingredient {
  slug: string;
  name: Bilingual;
  type: "supplement" | "cosmetic";
  category: Bilingual;
  categorySlug: string;
  originCountry: string;
  originCode: string;
  brandName: string;
  partner: string;
  description: Bilingual;
  benefits: Bilingual[];
  applications: Bilingual[];
  image: string;
  specs: Spec[];
  relatedTech?: string;
  featured?: boolean;
}

export interface Service {
  slug: string;
  title: Bilingual;
  description: Bilingual;
  icon: string;
  features: Bilingual[];
}

export interface Certification {
  value: string;
  suffix: Bilingual;
  kind: "stat" | "certificate";
}

export interface Partner {
  name: string;
  country: string;
  code: string;
}

export interface Post {
  slug: string;
  title: Bilingual;
  excerpt: Bilingual;
  category: Bilingual;
  image: string;
  author: string;
  date: string;
  readingTime: number;
  content: Bilingual;
}
