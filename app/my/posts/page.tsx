"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client"; // 클라이언트용 supabase 인스턴스
import { User } from "@supabase/supabase-js";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function MyPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace("/login?next=/my/posts");
        return;
      }
      setUser(authUser);

      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(display_name, avatar_url)")
        .eq("author_id", authUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data as Post[]);
      }
      setLoading(false);
    };

    fetchUserAndPosts();
  }, [router]);

  const handleDelete = async (postId: string) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    const { data: deletedPost, error } = await supabase.from("posts").delete().eq("id", postId).select().single();

    if (!error && deletedPost) {
      await supabase.from("logs").insert({
        user_id: user!.id,
        event_type: "POST_DELETED",
        entity_id: deletedPost.id,
        details: { title: deletedPost.title, slug: deletedPost.slug },
      });
    }

    if (error) {
      console.error("Error deleting post:", error);
      alert("게시글 삭제에 실패했습니다.");
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
      alert("게시글이 삭제되었습니다.");
    }
  };

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">내 게시글 관리</h1>
          <Link href="/my/posts/new">
            <Button className="rounded-xl px-4 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md transition-all duration-300 hover-lift">
              <PlusCircle className="w-4 h-4 mr-2" /> 새 게시글 작성
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center text-muted-foreground p-8 border border-dashed border-white/20 rounded-xl">
            <p className="mb-4">아직 작성한 게시글이 없습니다.</p>
            <Link href="/my/posts/new">
              <Button variant="outline" className="rounded-xl">
                첫 게시글 작성하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="glass-effect rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{post.title}</h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {post.published ? "게시됨" : "임시 저장"} | {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/my/posts/${post.slug}/edit`}>
                    <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="destructive" size="icon" className="rounded-full w-9 h-9" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
