"use client";
import Link from "next/link";

export default function Page() {
  // Supabase Auth는 보통 별도 sign-up 페이지 없이 동일 버튼로 가입/로그인을 처리합니다.
  // 사용성 유지를 위해 sign-in으로 안내합니다.
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-sm glass-effect rounded-2xl p-6 text-center space-y-3">
        <h1 className="text-xl font-semibold">회원가입</h1>
        <p className="text-sm text-muted-foreground">가입은 로그인 페이지에서 진행됩니다.</p>
        <Link href="/sign-in" className="underline">로그인 페이지로 이동</Link>
      </div>
    </div>
  );
}
