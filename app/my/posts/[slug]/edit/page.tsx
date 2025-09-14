"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/app/components/RichTextEditor";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { useToast } from "@/app/components/ToastProvider";
import { User } from "@supabase/supabase-js";

interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  main_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const postSlug = params.slug as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [initialPost, setInitialPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchUserAndPost = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace(`/login?next=/my/posts/${postSlug}/edit`);
        return;
      }
      setUser(authUser);

      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", postSlug)
        .single();

      if (error || !post) {
        console.error("Error fetching post:", error);
        toast.show({
          title: "오류",
          description: "게시글을 불러오는 데 실패했습니다.",
          variant: "error",
        });
        router.replace("/my/posts");
        return;
      }

      if (post.author_id !== authUser.id) {
        toast.show({
          title: "권한 없음",
          description: "이 게시글을 수정할 권한이 없습니다.",
          variant: "error",
        });
        router.replace("/my/posts");
        return;
      }

      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setMainImageUrl(post.main_image_url || "");
      setPublished(post.published);
      setInitialPost(post); // Store initial post data for comparison
      setLoading(false);
    };

    if (postSlug) {
      fetchUserAndPost();
    }
  }, [postSlug, router, toast]);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
    setSlug(newSlug);
  }, []);

  const handleMainImageUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMainImageUrl(e.target.value);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.show({
        title: "오류",
        description: "지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP만 가능합니다.",
        variant: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.show({
        title: "오류",
        description: "파일 크기가 너무 큽니다. 최대 5MB까지 가능합니다.",
        variant: "error",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "업로드 실패");
      }

      setMainImageUrl(result.url);
      toast.show({
        title: "성공",
        description: "이미지가 성공적으로 업로드되었습니다.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.show({
        title: "오류",
        description: error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.show({
        title: "오류",
        description: "제목, 슬러그, 내용은 필수 입력 항목입니다.",
        variant: "error",
      });
      return;
    }

    if (!user || !initialPost) {
      toast.show({
        title: "오류",
        description: "사용자 정보 또는 게시글 정보가 없습니다.",
        variant: "error",
      });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        main_image_url: mainImageUrl.trim() || null,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", initialPost.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error("Error updating post:", error);
      toast.show({
        title: "오류",
        description: `게시글 업데이트에 실패했습니다: ${error.message}`,
        variant: "error",
      });
    } else {
      toast.show({
        title: "성공",
        description: "게시글이 성공적으로 업데이트되었습니다.",
      });
      // If slug changed, redirect to new slug's edit page
      if (data.slug !== postSlug) {
        router.replace(`/my/posts/${data.slug}/edit`);
      } else {
        setInitialPost(data); // Update initial post state
      }
      // Log post update
      await supabase.from("logs").insert({
        user_id: user.id,
        event_type: "POST_UPDATED",
        entity_id: data.id,
        details: {
          old_title: initialPost.title,
          new_title: data.title,
          old_slug: initialPost.slug,
          new_slug: data.slug,
          old_published: initialPost.published,
          new_published: data.published,
        },
      });
    }
  };

  if (loading || !user) {
    return (
      <section className="px-4 sm:px-6 pt-12 pb-16">
        <div className="mx-auto max-w-4xl text-center text-muted-foreground">로딩 중...</div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text mb-8">게시글 수정</h1>

        <div className="glass-effect rounded-xl p-6 md:p-8 border border-white/10 shadow-xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="게시글 제목"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">슬러그 (URL)</Label>
            <Input
              id="slug"
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="url-friendly-slug"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainImageUrl">대표 이미지</Label>
            <div className="space-y-3">
              <Input
                id="mainImageUrl"
                type="text"
                value={mainImageUrl}
                onChange={handleMainImageUrlChange}
                placeholder="이미지 URL을 입력하거나 파일을 선택하세요"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
              />
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-sm cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "업로드 중..." : "파일 선택"}
                </label>
                <span className="text-xs text-muted-foreground">
                  JPEG, PNG, GIF, WebP (최대 5MB)
                </span>
              </div>
              {mainImageUrl && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">미리보기:</p>
                  <img
                    src={mainImageUrl}
                    alt="대표 이미지 미리보기"
                    className="max-w-full h-32 object-cover rounded-lg border border-white/10"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>내용</Label>
            <RichTextEditor content={content} onUpdate={setContent} editable={true} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published-mode"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="published-mode">게시하기</Label>
          </div>

          <Button
            onClick={handleUpdatePost}
            disabled={saving || !title.trim() || !slug.trim() || !content.trim()}
            className="mt-4 rounded-xl px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md transition-all duration-300 hover-lift"
          >
            {saving ? "업데이트 중..." : "게시글 업데이트"}
          </Button>
        </div>
      </div>
    </section>
  );
}
