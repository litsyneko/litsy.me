import { getTagColor } from '@/lib/utils/blog'
import { BlogPostWithAuthor } from '@/lib/services/blog' // BlogPostWithAuthor 타입 가져오기
import Link from 'next/link'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'

interface BlogCardProps {
  post: BlogPostWithAuthor // post 타입을 BlogPostWithAuthor로 변경
}

export default function BlogCard({ post }: BlogCardProps) {
  const displayAuthor = post.author_display_name || post.author_username || post.author_email || 'Anonymous'
  const displayUsername = post.author_username
  const displayDate = new Date(post.published_at || post.created_at || '').toLocaleDateString('ko-KR')

  return (
    <Link href={`/blog/${post.slug}`} className="block group rounded-lg border bg-card hover:shadow-lg transition-all overflow-hidden min-h-[44px]">
      <div className="w-full bg-muted overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="relative w-full h-full">
            <Image
              src={post.cover_url || '/placeholder.jpg'}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          </div>
        </AspectRatio>
      </div>
      <div className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2 leading-tight">{post.title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">{post.summary}</p>
        
        {/* 태그 표시 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt={displayAuthor} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 object-cover" />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">{displayAuthor[0]?.toUpperCase() || '?'}</div>
            )}
            <div className="text-xs min-w-0 flex-1">
              <div className="font-medium truncate">{displayAuthor}</div>
              {displayUsername ? <div className="text-muted-foreground text-xs truncate">@{displayUsername}</div> : null}
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex-shrink-0">{displayDate}</div>
        </div>
      </div>
    </Link>
  )
}