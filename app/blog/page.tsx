"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  main_image_url: string | null;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error, count } = await supabase
        .from("posts")
        .select("*, profiles(display_name, avatar_url)", { count: "exact" })
        .eq("published", true)
        .order("created_at", { ascending: false })
        .range((page - 1) * postsPerPage, page * postsPerPage - 1);

      if (error) {
        console.error("Error fetching blog posts:", error);
      } else {
        setPosts(data as Post[]);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [page]);

  const totalPages = Math.ceil(totalCount / postsPerPage);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 pt-12 pb-16">
        <div className="mx-auto max-w-4xl text-center text-muted-foreground">로딩 중...</div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text mb-8">블로그</h1>

        {posts.length === 0 ? (
          <div className="text-center text-muted-foreground p-8 border border-dashed border-white/20 rounded-xl">
            <p>아직 게시된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`} className="block">
                <div className="glass-effect rounded-xl p-4 md:p-6 border border-white/10 shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
                  {post.main_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.main_image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{post.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {post.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.profiles.avatar_url}
                        alt={post.profiles.display_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 grid place-items-center text-xs">
                        {post.profiles?.display_name ? post.profiles.display_name[0] : "?"}
                      </div>
                    )}
                    <span>{post.profiles?.display_name || "알 수 없는 작성자"}</span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  페이지 {page} / {totalPages}
                </span>
                <Button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
