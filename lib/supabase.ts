import { createClient } from '@supabase/supabase-js'

// 환경 변수 검증
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 클라이언트 사이드 Supabase 클라이언트 (브라우저용)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

// 타입 정의 - Supabase Auth 직접 사용으로 단순화
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          content?: string | null
          tags?: string[] | null
          cover_url?: string | null
          published?: boolean
          published_at?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          content?: string | null
          tags?: string[] | null
          cover_url?: string | null
          published?: boolean
          published_at?: string | null
          user_id?: string | null
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string | null
          user_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          content?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          summary: string | null
          body: string | null
          cover_url: string | null
          tech: string[] | null
          repo_url: string | null
          live_url: string | null
          published: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          summary?: string | null
          body?: string | null
          cover_url?: string | null
          tech?: string[] | null
          repo_url?: string | null
          live_url?: string | null
          published?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          summary?: string | null
          body?: string | null
          cover_url?: string | null
          tech?: string[] | null
          repo_url?: string | null
          live_url?: string | null
          published?: boolean
          user_id?: string | null
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          email?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          email: string
          created_at: string
          updated_at: string
        }
      }
      update_user_profile: {
        Args: {
          user_id: string
          new_username: string | null
          new_display_name: string | null
          new_avatar_url: string | null
          new_bio: string | null
          new_website: string | null
          new_location: string | null
        }
        Returns: boolean
      }
    }
  }
}

export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Project = Database['public']['Tables']['projects']['Row']

// Supabase Auth User 타입 (auth.users에서 직접 사용)
export interface AuthUser {
  id: string
  email?: string
  user_metadata: {
    full_name?: string
    name?: string
    username?: string
    display_name?: string
    avatar_url?: string
    [key: string]: any
  }
  app_metadata: {
    provider?: string
    [key: string]: any
  }
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}

// 확장된 타입 정의
export interface CommentWithAuthor extends Comment {
  author: AuthUser | null
}

export interface PostWithAuthor extends Post {
  author: AuthUser | null
}

export interface ProjectWithAuthor extends Project {
  author: AuthUser | null
}

// 유틸리티 함수들
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Anonymous'

  return (
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    'User'
  )
}

export function getUserAvatar(user: AuthUser | null): string | null {
  if (!user) return null

  return user.user_metadata?.avatar_url || null
}

export function isEmailVerified(user: AuthUser | null): boolean {
  return !!(user?.email_confirmed_at)
}

// 프로필 관련 타입들
export interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  location: string | null
  email: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  username?: string
  display_name?: string
  avatar_url?: string
  bio?: string
  website?: string
  location?: string
}

// 프로필 관련 함수들 - 단순화된 버전 (RPC 함수 대신 직접 테이블 접근)
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // auth.users에서 직접 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return null
    }

    // public.users 테이블에서 추가 정보 가져오기 (있는 경우)
    const { data: publicUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    const publicUserData = publicUser as Database['public']['Tables']['users']['Row'] | null

    return {
      id: user.id,
      username: publicUserData?.username || user.user_metadata?.username || null,
      display_name: publicUserData?.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || null,
      avatar_url: publicUserData?.avatar_url || user.user_metadata?.avatar_url || null,
      bio: publicUserData?.bio || user.user_metadata?.bio || null,
      website: publicUserData?.website || user.user_metadata?.website || null,
      location: publicUserData?.location || user.user_metadata?.location || null,
      email: user.email || '',
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: ProfileUpdateData): Promise<boolean> {
  try {
    // auth.users 메타데이터 업데이트
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...updates,
        updated_at: new Date().toISOString()
      }
    })

    if (authError) {
      console.error('Error updating auth user:', authError)
      return false
    }

    // public.users 테이블 업데이트 (있는 경우)
    const { error: publicError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        username: updates.username || null,
        display_name: updates.display_name || null,
        avatar_url: updates.avatar_url || null,
        bio: updates.bio || null,
        website: updates.website || null,
        location: updates.location || null,
        email: '', // 기본값 제공
        updated_at: new Date().toISOString()
      })

    if (publicError) {
      console.warn('Error updating public user profile:', publicError)
      // public.users 업데이트 실패는 치명적이지 않음
    }

    return true
  } catch (error) {
    console.error('Error updating user profile:', error)
    return false
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return await getUserProfile(user.id)
  } catch (error) {
    console.error('Error fetching current user profile:', error)
    return null
  }
}