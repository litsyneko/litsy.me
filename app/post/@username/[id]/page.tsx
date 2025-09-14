"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import RichTextEditor from "@/app/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/components/ToastProvider";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function UserPostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const username = params.username as string;
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserAndPost = async () => {
      setLoading(true);
      const { data: authUser } = await supabase.auth.getUser();
      setCurrentUser(authUser.user);

      // First, find the author_id from the username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("display_name", username)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile by username:", profileError);
        toast.show({
          title: "오류",
          description: "사용자를 찾을 수 없습니다.",
          variant: "error",
        });
        router.replace("/blog");
        return;
      }

      const authorId = profileData.id;

      // Fetch post by ID and author_id
      const { data: fetchedPost, error: postError } = await supabase
        .from("posts")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", postId)
        .eq("author_id", authorId)
        .single();

      if (postError || !fetchedPost) {
        console.error("Error fetching post:", postError);
        toast.show({
          title: "오류",
          description: "게시글을 불러오는 데 실패했습니다.",
          variant: "error",
        });
        router.replace("/blog");
        return;
      }
      setPost(fetchedPost as Post);

      // Fetch comments
      const { data: fetchedComments, error: commentsError } = await supabase
        .from("comments")
        .select("*, profiles(display_name, avatar_url)")
        .eq("post_id", fetchedPost.id)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      } else {
        setComments(fetchedComments as Comment[]);
      }

      setLoading(false);
    };

    if (username && postId) {
      fetchUserAndPost();
    }
  }, [username, postId, router, toast]);

  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) {
      toast.show({
        title: "오류",
        description: "댓글 내용을 입력해주세요.",
        variant: "error",
      });
      return;
    }
    if (!currentUser || !post) {
      toast.show({
        title: "오류",
        description: "로그인 후 댓글을 작성할 수 있습니다.",
        variant: "error",
      });
      return;
    }

    setSubmittingComment(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        author_id: currentUser.id,
        content: commentContent.trim(),
      })
      .select("*, profiles(display_name, avatar_url)")
      .single();

    setSubmittingComment(false);

    if (error) {
      console.error("Error submitting comment:", error);
      toast.show({
        title: "오류",
        description: `댓글 작성에 실패했습니다: ${error.message}`,
        variant: "error",
      });
    } else {
      setComments((prev) => [...prev, data as Comment]);
      setCommentContent("");
      toast.show({
        title: "성공",
        description: "댓글이 성공적으로 작성되었습니다.",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    if (!currentUser) {
      toast.show({
        title: "오류",
        description: "로그인 후 댓글을 삭제할 수 있습니다.",
        variant: "error",
      });
      return;
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("author_id", currentUser.id); // Only allow author to delete their own comment

    if (error) {
      console.error("Error deleting comment:", error);
      toast.show({
        title: "오류",
        description: `댓글 삭제에 실패했습니다: ${error.message}`,
        variant: "error",
      });
    } else {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.show({
        title: "성공",
        description: "댓글이 삭제되었습니다.",
      });
    }
  };

  if (loading || !post) {
    return (
      <section className="px-4 sm:px-6 pt-12 pb-16">
        <div className="mx-auto max-w-4xl text-center text-muted-foreground">로딩 중...</div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-4xl">
        {/* Post Header */}
        <div className="glass-effect rounded-xl p-6 md:p-8 border border-white/10 shadow-xl mb-8">
          {post.main_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.main_image_url}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text mb-4">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {post.profiles?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.display_name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 grid place-items-center text-xs">
                {post.profiles?.display_name ? post.profiles.display_name[0] : "?"}
              </div>
            )}
            <Link href={`/post/@${post.profiles?.display_name || 'unknown'}/${post.author_id}`} className="hover:underline">
              {post.profiles?.display_name || "알 수 없는 작성자"}
            </Link>
            <span>·</span>
            <span>작성일: {new Date(post.created_at).toLocaleDateString()}</span>
            {post.created_at !== post.updated_at && (
              <>
                <span>·</span>
                <span>수정일: {new Date(post.updated_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="glass-effect rounded-xl p-6 md:p-8 border border-white/10 shadow-xl mb-8">
          <RichTextEditor content={post.content} onUpdate={() => {}} editable={false} />
        </div>

        {/* Comments Section */}
        <div className="glass-effect rounded-xl p-6 md:p-8 border border-white/10 shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold mb-6">댓글 ({comments.length})</h2>

          {/* Comment Input */}
          {currentUser ? (
            <div className="mb-8 space-y-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 작성하세요..."
                rows={4}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
              ></textarea>
              <Button
                onClick={handleCommentSubmit}
                disabled={submittingComment || !commentContent.trim()}
                className="rounded-xl px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md transition-all duration-300 hover-lift"
              >
                {submittingComment ? "작성 중..." : "댓글 작성"}
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4 border border-dashed border-white/20 rounded-xl mb-8">
              <p className="mb-2">댓글을 작성하려면 로그인해주세요.</p>
              <Link href="/login">
                <Button variant="outline" className="rounded-xl">로그인</Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center">아직 댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  {comment.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.display_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 grid place-items-center text-xs flex-shrink-0">
                      {comment.profiles?.display_name ? comment.profiles.display_name[0] : "?"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/post/@${comment.profiles?.display_name || 'unknown'}/${comment.author_id}`} className="font-semibold text-sm hover:underline">
                        {comment.profiles?.display_name || "알 수 없는 작성자"}
                      </Link>
                      <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                    {currentUser?.id === comment.author_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-auto p-1 mt-2"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
