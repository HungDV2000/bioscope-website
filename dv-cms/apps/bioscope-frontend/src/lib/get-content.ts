import type { Locale } from '@/lib/i18n/config'
import * as vi from '@/lib/content'
import type { BlogPost } from '@/lib/content'
import { enOverrides, translateIngredientFields } from '@/lib/content-en'
import { ingredientForm } from '@/lib/content'
import {
  BLOG_TOPICS_EN,
  BLOG_INDUSTRIES_EN,
  BLOG_SAMPLE_COMMENTS_EN,
  translateBlogPost,
  getBlogSectionsEn,
  formatBlogDateEn,
  getRelatedBlogPostsEn,
} from '@/lib/blog-en'

export type ContentModule = typeof vi

function buildEnContent(): ContentModule {
  const ingredients = vi.INGREDIENTS.map(translateIngredientFields)
  const blogPosts = vi.BLOG_POSTS.map(translateBlogPost)
  const resourceCategories = enOverrides.RESOURCE_CATEGORIES ?? vi.RESOURCE_CATEGORIES
  const resourceItems = enOverrides.RESOURCE_ITEMS ?? vi.RESOURCE_ITEMS
  const caseStudies = enOverrides.CASE_STUDIES ?? vi.CASE_STUDIES

  return {
    ...vi,
    ...enOverrides,
    INGREDIENTS: ingredients,
    INGREDIENT_CATEGORIES: [...new Set(ingredients.map((it) => it.category))] as string[],
    ORIGINS: [...new Set(ingredients.map((it) => it.origin))].sort() as string[],
    PRODUCT_FORMS: [...new Set(ingredients.map(ingredientForm).filter(Boolean))] as string[],
    RESOURCE_ITEMS: resourceItems,
    RESOURCE_CATEGORIES: resourceCategories,
    CASE_STUDIES: caseStudies,
    BLOG_POSTS: blogPosts,
    BLOG_TOPICS: BLOG_TOPICS_EN as unknown as typeof vi.BLOG_TOPICS,
    BLOG_INDUSTRIES: BLOG_INDUSTRIES_EN as unknown as typeof vi.BLOG_INDUSTRIES,
    BLOG_SAMPLE_COMMENTS: BLOG_SAMPLE_COMMENTS_EN,
    getBlogPost: (slug: string) => blogPosts.find((p) => p.slug === slug),
    getRelatedBlogPosts: (post: BlogPost, limit = 3) => getRelatedBlogPostsEn(post, blogPosts, limit),
    getBlogSections: getBlogSectionsEn,
    formatBlogDate: formatBlogDateEn,
    getResourceCategory: (slug: string) => resourceCategories.find((c) => c.slug === slug),
    getResourceItemsForCategory: (slug: string) => {
      const cat = resourceCategories.find((c) => c.slug === slug)
      if (!cat?.filterCategories) return []
      return resourceItems.filter((i) => cat.filterCategories!.includes(i.category))
    },
  } as unknown as ContentModule
}

export function getContent(locale: Locale): ContentModule {
  if (locale === 'en') return buildEnContent()
  return vi
}
