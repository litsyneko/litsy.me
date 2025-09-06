// 블로그 관련 타입 정의

export interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  tags: string[] | null
  cover_url: string | null
  published: boolean
  published_at: string | null
  user_id: string | null
  created_at: string
  updated_at: string
}

export interface BlogPostWithAuthor extends BlogPost {
  author: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

export interface BlogComment {
  id: string
  post_id: string | null
  user_id: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface BlogCommentWithAuthor extends BlogComment {
  author: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

// 프론트엔드에서 사용하는 정규화된 타입
export interface NormalizedPost {
  slug: string
  title: string
  summary: string
  content?: string
  date: string
  tags: string[]
  author: string
  username?: string | null
  cover: string
  published?: boolean
}

export interface NormalizedComment {
  id: string
  author_name: string
  author_avatar: string | null
  content: string
  created_at: string
}

// API 응답 타입
export interface BlogPostsResponse {
  posts: BlogPostWithAuthor[]
  total: number
  page: number
  limit: number
}

export interface BlogCommentsResponse {
  comments: BlogCommentWithAuthor[]
  total: number
}

// 폼 데이터 타입
export interface CreatePostData {
  title: string
  slug: string
  summary: string
  content: string
  tags: string[]
  cover_url?: string
  published?: boolean
}

export interface CreateCommentData {
  post_id: string
  content: string
}

// 필터링 옵션
export interface BlogFilters {
  query?: string
  tag?: string
  published?: boolean
  author?: string
  page?: number
  limit?: number
}