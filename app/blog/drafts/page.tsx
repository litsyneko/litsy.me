import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '임시글 목록 | Litsy Portfolio',
}

export default async function DraftsPage() {
  // 서버 컴포넌트로서 fetch API 사용
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/blog?mode=drafts`, { cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  const drafts = json.posts || []

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
}
