// Strapi API response types
export interface StrapiResponse<T> {
  data: T
  meta: StrapiMeta
}

export interface StrapiMeta {
  pagination?: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export interface StrapiData<T> {
  id: number
  attributes: T
}

export interface StrapiLocalization {
  locale: string
  localizations?: {
    data: Array<{
      id: number
      attributes: {
        locale: string
      }
    }>
  }
}

// Content types (flexible structure)
export interface Post extends StrapiLocalization {
  title: string
  slug: string
  content: string
  excerpt?: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  author?: StrapiData<Author>
  tags?: {
    data: Array<StrapiData<Tag>>
  }
  coverImage?: StrapiData<Media>
}

export interface Author extends StrapiLocalization {
  name: string
  bio?: string
  avatar?: StrapiData<Media>
}

export interface Tag extends StrapiLocalization {
  name: string
  slug: string
}

export interface Project extends StrapiLocalization {
  title: string
  slug: string
  description: string
  content?: string
  url?: string
  github?: string
  image?: StrapiData<Media>
  tags?: {
    data: Array<StrapiData<Tag>>
  }
  featured?: boolean
  order?: number
}

export interface Media {
  name: string
  alternativeText?: string
  caption?: string
  width: number
  height: number
  formats?: {
    thumbnail?: MediaFormat
    small?: MediaFormat
    medium?: MediaFormat
    large?: MediaFormat
  }
  url: string
}

export interface MediaFormat {
  url: string
  width: number
  height: number
}

export type Locale = "en" | "ko" | "ja"
