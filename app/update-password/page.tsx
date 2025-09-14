"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "../components/ToastProvider";
import AuthCard from "@/app/components/AuthCard";

// 페이지의 상태를 명확하게 정의하는 타입
type PageStatus = "loading" | "ready" | "oauth_error" | "direct_visit_error" | "invalid_link_error";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const toast = useToast();

  // 폼 입력을 위한 상태
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  // 컴포넌트의 상태를 관리하는 단일 상태 변수
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [providerName, setProviderName] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      // 1. URL 분석 및 에러 처리
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = params.get("error_description");
        if (errorDescription) {
          toast.show({
            title: "인증 오류",
            description: decodeURIComponent(errorDescription) || "링크가 유효하지 않거나 만료되었습니다.",
            variant: "error",
          });
          window.history.replaceState(null, "", window.location.pathname);
          setPageStatus("invalid_link_error");
          return;
        }
      }

      // 2. 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      const hasAccessToken = typeof window !== "undefined" && window.location.hash.includes("access_token");

      if (session) {
        validateSession(session.user);
      } else if (hasAccessToken) {
        // Supabase가 리디렉션 후 세션을 설정할 때까지 잠시 대기
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            validateSession(session.user);
            subscription.unsubscribe();
          }
        });
      } else {
        setPageStatus("direct_visit_error");
      }
    };

    const validateSession = (user: any) => {
      const provider = user?.app_metadata?.provider || "email";
      if (provider !== "email") {
        setProviderName(provider.toUpperCase());
        setPageStatus("oauth_error");
      } else {
        setPageStatus("ready");
      }
    };

    initialize();
  }, [toast]);

  const handlePasswordUpdate = async () => {
    if (password.length < 6) {
      setFormMessage("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setFormMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    setLoading(true);
    setFormMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setFormMessage(error.message);
    } else {
      toast.show({
        title: "성공",
        description: "비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.",
      });
      await supabase.auth.signOut();
      setTimeout(() => router.replace("/login"), 1000);
    }
  };
  
  // pageStatus에 따라 적절한 UI를 렌더링하는 함수
  const renderContent = () => {
    switch (pageStatus) {
      case "loading":
        return <p className="text-center text-muted-foreground">세션을 확인 중입니다...</p>;

      case "ready":
        return (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="새 비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
            />
            <Button className="w-full" onClick={handlePasswordUpdate} disabled={loading || !password || !confirm}>
              {loading ? "변경 중..." : "비밀번호 변경"}
            </Button>
            {formMessage && <p className="text-xs text-red-400 text-center pt-2">{formMessage}</p>}
          </div>
        );

      case "oauth_error":
        return (
          <div className="space-y-4 text-center">
             <div className="inline-flex items-center justify-center gap-3 bg-white/10 px-4 py-2 rounded-full mx-auto">
               <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                 {providerName || "OAuth"}
               </span>
             </div>
            <p className="text-base text-muted-foreground break-words">
              이 계정은 소셜 로그인을 통해 생성되어 비밀번호를 변경할 수 없습니다.
            </p>
            <Button onClick={() => router.replace("/login")} className="w-full">
              로그인 페이지로 이동
            </Button>
          </div>
        );

      case "direct_visit_error":
        return (
          <div className="space-y-4 text-center">
            <p className="text-base text-muted-foreground break-words">
              정상적인 경로로 접속되지 않았습니다. 비밀번호를 재설정하시려면 이메일의 링크를 이용해주세요.
            </p>
            <Button onClick={() => router.replace("/login")} className="w-full">
              로그인 페이지로 이동
            </Button>
          </div>
        );
      
      case "invalid_link_error":
         return (
          <div className="space-y-4 text-center">
            <p className="text-base text-muted-foreground break-words">
              링크가 만료되었거나 유효하지 않습니다. 비밀번호 재설정을 다시 요청해주세요.
            </p>
            <Button onClick={() => router.replace("/login")} className="w-full">
              로그인 페이지로 이동
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // pageStatus에 따라 카드 제목을 결정하는 함수
  const getTitle = () => {
    switch (pageStatus) {
      case "ready":
        return "새 비밀번호 설정";
      case "oauth_error":
        return "소셜 로그인 계정";
      case "loading":
        return "확인 중...";
      default:
        return "오류";
    }
  };

  return (
    <AuthCard
      title={getTitle()}
      subtitle={pageStatus === "ready" ? "메일 링크를 통해 접속하셨다면 비밀번호를 변경하세요." : undefined}
    >
      {renderContent()}
    </AuthCard>
  );
}