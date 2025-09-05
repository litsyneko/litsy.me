interface BlogCardProps {
  post: {
    slug: string
    title: string
    summary: string
    date: string
    tags: string[]
    author: string // nickname or display name
    username?: string | null // optional username like 'litsy25'
    cover: string
  }
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <a href={`/blog/${post.slug}`} className="block group rounded-lg border bg-card hover:shadow-lg transition-all overflow-hidden min-h-[44px]">
      <div className="h-36 sm:h-44 w-full bg-muted overflow-hidden">
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2 leading-tight">{post.title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">{post.summary}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">{post.author ? post.author[0]?.toUpperCase() : '?'}</div>
            <div className="text-xs min-w-0 flex-1">
              <div className="font-medium truncate">{post.author}</div>
              {post.username ? <div className="text-muted-foreground text-xs truncate">@{post.username}</div> : null}
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex-shrink-0">{new Date(post.date).toLocaleDateString('ko-KR')}</div>
        </div>
      </div>
    </a>
  )
}
