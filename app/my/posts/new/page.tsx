"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/app/components/RichTextEditor";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { useToast } from "@/app/components/ToastProvider";
import { User } from "@supabase/supabase-js"; // User 타입 임포트

export default function NewPostPage() {
  const router = useRouter();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace("/login?next=/my/posts/new");
        return;
      }
      setUser(authUser);
    };
    fetchUser();
  }, [router]);

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with a single hyphen
      .trim();
    setSlug(newSlug);
  }, []);

  // `e` 매개변수 타입 명시
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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("로그인 세션이 없습니다.");
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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

  const handleSavePost = async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.show({
        title: "오류",
        description: "제목, 슬러그, 내용은 필수 입력 항목입니다.",
        variant: "error",
      });
      return;
    }

    setLoading(true);
    // user가 null이 아님을 TypeScript에 알림
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user!.id,
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        main_image_url: mainImageUrl.trim() || null,
        published,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Error creating post:", error);
      toast.show({
        title: "오류",
        description: `게시글 생성에 실패했습니다: ${error.message}`,
        variant: "error",
      });
    } else {
      toast.show({
        title: "성공",
        description: "게시글이 성공적으로 생성되었습니다.",
      });
      // Log post creation
      await supabase.from("logs").insert({
        user_id: user!.id,
        event_type: "POST_CREATED",
        entity_id: data.id,
        details: { title: data.title, slug: data.slug, published: data.published, main_image_url: data.main_image_url },
      });
      router.push(`/my/posts/${data.slug}/edit`); // Redirect to edit page
    }
  };

  if (!user) {
    return (
      <section className="px-4 sm:px-6 pt-12 pb-16">
        <div className="mx-auto max-w-4xl text-center text-muted-foreground">로딩 중...</div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text mb-8">새 게시글 작성</h1>

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
            onClick={handleSavePost}
            disabled={loading || !title.trim() || !slug.trim() || !content.trim()}
            className="mt-4 rounded-xl px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md transition-all duration-300 hover-lift"
          >
            {loading ? "저장 중..." : "게시글 저장"}
          </Button>
        </div>
      </div>
    </section>
  );
}
