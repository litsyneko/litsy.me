import Link from 'next/link'
import { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { supabaseServiceRole } from '@/lib/supabase-server'
 
export const metadata: Metadata = {
  title: '임시글 목록 | Litsy Portfolio',
}
 
export default async function DraftsPage() {
  // Server-side: use Clerk auth() to get userId and query Supabase directly.
  try {
    const { userId } = auth()
    if (!userId) {
      // Not signed in: render a friendly message (server-rendered)
      return (
        <main className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">내 임시글</h1>
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">임시글을 확인하려면 로그인이 필요합니다.</div>
            <Link href="/blog" className="px-4 py-2 bg-primary text-primary-foreground rounded">블로그 홈으로</Link>
          </div>
        </main>
      )
    }
 
    const { data, error } = await supabaseServiceRole
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .eq('published', false)
      .order('updated_at', { ascending: false })
 
    if (error) {
      console.error('Error fetching drafts in DraftsPage:', error)
      return (
        <main className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">내 임시글</h1>
          <div className="text-muted-foreground">임시글을 불러오는 중 오류가 발생했습니다.</div>
        </main>
      )
    }
 
    const drafts = data ?? []
 
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">내 임시글</h1>
        {drafts.length === 0 ? (
          <div className="text-muted-foreground">임시글이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {drafts.map((d: any) => (
              <div key={d.id} className="p-4 border rounded-lg bg-card flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.title || '(제목 없음)'}</div>
                  <div className="text-sm text-muted-foreground">{d.summary || ''}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/blog/new?postId=${d.id}`} className="px-3 py-1 bg-primary text-primary-foreground rounded">이어쓰기</Link>
                  <Link href={`/blog/${d.slug || ''}`} className="px-3 py-1 bg-muted rounded">미리보기</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    )
  } catch (err) {
    console.error('Unexpected error in DraftsPage:', err)
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">내 임시글</h1>
        <div className="text-muted-foreground">알 수 없는 오류가 발생했습니다.</div>
      </main>
    )
  }
}
