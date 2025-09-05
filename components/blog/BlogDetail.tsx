import HeartButton from './HeartButton'
import CommentForm from './CommentForm'
import CommentList from './CommentList'

interface BlogDetailProps {
  post: {
    slug: string
    title: string
    content: string
    date: string
    tags: string[]
    author: string
    cover: string
  }
}

export default function BlogDetail({ post }: BlogDetailProps) {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img src={post.cover} alt={post.title} className="w-full h-80 object-cover rounded-lg mb-6 shadow-sm" />
          <h1 className="text-4xl font-extrabold leading-tight mb-3">{post.title}</h1>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">{post.author[0]?.toUpperCase()}</div>
              <div>
                <div className="font-medium">{post.author}</div>
                <div className="text-xs">{new Date(post.date).toLocaleDateString('ko-KR')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HeartButton slug={post.slug} />
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8 whitespace-pre-line">
            {post.content}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">댓글</h3>
            <CommentForm slug={post.slug} onNewComment={() => {}} />
            <div className="mt-4">
              <CommentList slug={post.slug} />
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold mb-2">태그</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(t => (
                  <span key={t} className="px-2 py-1 bg-muted rounded text-xs">#{t}</span>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold mb-2">공유</h4>
              <div className="flex gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noreferrer" className="px-3 py-2 bg-muted rounded">트위터</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  )
}
