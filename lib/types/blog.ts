// 블로그 관련 타입 정의
import { BlogPostWithAuthor, CommentWithAuthor } from '@/lib/services/blog'

// API 응답 타입
export interface BlogPostsResponse {
  posts: BlogPostWithAuthor[]
  total: number
  page: number
  limit: number
}

export interface BlogCommentsResponse {
  comments: CommentWithAuthor[]
  total: number
}

// 폼 데이터 타입
export interface CreatePostData {
  title: string
  summary: string
  content: string
  tags: string[]
  cover?: string // cover_url 대신 cover 사용 (폼에서 받을 때)
}

export interface CreateCommentData {
  post_id: string
  content: string
}