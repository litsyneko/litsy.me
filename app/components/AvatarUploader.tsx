"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

type Props = {
  onUploaded?: (publicUrl: string, path: string) => void;
  className?: string;
  currentAvatarUrl?: string | null;
  displayName?: string;
};

export default function AvatarUploader({ onUploaded, className, currentAvatarUrl, displayName }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      // avatars 버킷이 존재하는지 확인하고, 없으면 생성
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarsBucket = buckets?.find((bucket) => bucket.name === "avatars");

      if (!avatarsBucket) {
        const { error: createBucketError } = await supabase.storage.createBucket("avatars", {
          public: true,
        });
        if (createBucketError) {
          console.log("avatars 버킷 생성 시도:", createBucketError.message);
        }
      }

      // 1. 임시 파일 업로드
      const tempFileName = `temp_${Date.now()}-${file.name}`.replace(/\s+/g, "_");
      const tempPath = `temp/${tempFileName}`;
      const { error: tempUploadErr } = await supabase.storage.from("avatars").upload(tempPath, file, { upsert: true });

      if (tempUploadErr) throw tempUploadErr;

      console.log("임시 파일 업로드 완료:", tempPath);

      // 2. 파일 처리 (현재는 간단한 검증만 수행)
      await processUploadedFile(tempPath);

      // 3. 최종 경로로 복사 (native copy 사용)
      const finalFileName = `${Date.now()}-${file.name}`.replace(/\s+/g, "_");
      const finalPath = `public/${finalFileName}`;

      // Supabase Storage의 native copy 메서드 사용
      const { error: copyErr } = await supabase.storage
        .from("avatars")
        .copy(tempPath, finalPath);

      if (copyErr) throw copyErr;

      console.log("최종 파일 복사 완료:", finalPath);

      // 4. 임시 파일 삭제
      await supabase.storage.from("avatars").remove([tempPath]);
      console.log("임시 파일 삭제 완료:", tempPath);

      // 5. 퍼블릭 URL 얻기
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(finalPath);

      if (publicUrlData) {
        setUrl(publicUrlData.publicUrl);
        onUploaded?.(publicUrlData.publicUrl, finalPath);
      } else {
        throw new Error("퍼블릭 URL을 생성할 수 없습니다");
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "업로드 실패");
      console.error("업로드 에러:", err);
    } finally {
      setUploading(false);
    }
  };

  // 파일 처리 함수
  const processUploadedFile = async (tempPath: string): Promise<void> => {
    try {
      // 현재는 간단한 검증만 수행
      // 향후 이미지 리사이즈, 최적화, 형식 변환 등 추가 가능
      console.log("파일 처리 중:", tempPath);

      // 임시 파일 존재 확인
      const { data: files } = await supabase.storage.from("avatars").list("temp");
      const tempFileExists = files?.some(file => file.name === tempPath.split('/')[1]);

      if (!tempFileExists) {
        throw new Error("임시 파일이 존재하지 않습니다");
      }

      console.log("파일 검증 완료");
    } catch (err) {
      console.error("파일 처리 에러:", err);
      throw err;
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {(url || currentAvatarUrl) ? (
            <Image src={url ?? currentAvatarUrl ?? ''} alt={displayName ?? 'avatar'} width={80} height={80} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-sm text-gray-300">No image</div>
          )}
          <div className="text-sm text-gray-300">{displayName}</div>
        </div>
        <label className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm cursor-pointer hover:bg-white/10">
        <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
        {uploading ? "업로드 중…" : "프로필 이미지 업로드"}
      </label>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {url && (
        <div className="mt-3">
          <p className="mt-1 text-xs text-muted-foreground break-all">{url}</p>
        </div>
      )}
    </div>
  </div>
  );
}
