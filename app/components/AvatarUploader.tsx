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
      const fileName = `${Date.now()}-${file.name}`.replace(/\s+/g, "_");
      const path = `public/${fileName}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setUrl(data.publicUrl);
      onUploaded?.(data.publicUrl, path);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
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

