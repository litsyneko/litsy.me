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

function sanitizeFileName(name: string) {
  // 허용 문자만 남기고 나머지는 '_'로 치환, 길이 제한
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 200);
}

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
      // 현재 로그인한 사용자 확인
      const { data: userData, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) throw getUserError;
      const user = userData.user;
      if (!user?.id) throw new Error("인증된 사용자를 찾을 수 없습니다.");

      const userId = user.id;

      // avatars 버킷이 존재하는지 확인하고, 없으면 생성 (실패시 무시)
      try {
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
      } catch (err) {
        console.warn("버킷 확인 중 경고:", err);
      }

      // 안전한 파일명 생성
      const safeName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const tempFileName = `temp_${timestamp}_${safeName}`;
      const tempPath = `temp/${userId}/${tempFileName}`;

      // 1. 임시 파일 업로드
      const { error: tempUploadErr } = await supabase.storage.from("avatars").upload(tempPath, file, { upsert: true });

      if (tempUploadErr) throw tempUploadErr;

      console.log("임시 파일 업로드 완료:", tempPath);

      // 2. 파일 처리 (검증)
      await processUploadedFile(userId, tempFileName);

      // 3. 최종 경로로 복사
      const finalFileName = `${timestamp}_${safeName}`;
      const finalPath = `public/${userId}/${finalFileName}`;

      // Supabase Storage의 native copy 메서드 사용 (v2 SDK 기준)
      const { error: copyErr } = await supabase.storage
        .from("avatars")
        .copy(tempPath, finalPath);

      if (copyErr) {
        // 일부 환경에서는 copy가 지원되지 않을 수 있으므로 fallback: download + upload
        console.warn("copy failed, trying fallback:", copyErr.message || copyErr);
        // 다운로드 후 다시 업로드 (간단한 fallback)
        const { data: downloadData, error: downloadErr } = await supabase.storage.from("avatars").download(tempPath);
        if (downloadErr || !downloadData) throw downloadErr || new Error("임시 파일 다운로드 실패");
        const blob = await downloadData.arrayBuffer();
        const fallbackFile = new File([blob], finalFileName, { type: file.type });
        const { error: fallbackUploadErr } = await supabase.storage.from("avatars").upload(finalPath, fallbackFile, { upsert: true });
        if (fallbackUploadErr) throw fallbackUploadErr;
      }

      console.log("최종 파일 생성 완료:", finalPath);

      // 4. 임시 파일 삭제 (user temp 하위)
      try {
        await supabase.storage.from("avatars").remove([tempPath]);
        console.log("임시 파일 삭제 완료:", tempPath);
      } catch (removeErr) {
        console.warn("임시 파일 삭제 실패:", removeErr);
      }

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

  // 파일 처리 함수: temp/{userId} 내부에 tempFileName 존재 여부 확인
  const processUploadedFile = async (userId: string, tempFileName: string): Promise<void> => {
    try {
      console.log("파일 처리 중:", `temp/${userId}/${tempFileName}`);

      const { data: files, error: listErr } = await supabase.storage.from("avatars").list(`temp/${userId}`);
      if (listErr) throw listErr;

      const tempFileExists = files?.some(file => file.name === tempFileName);

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
