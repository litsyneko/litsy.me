"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import AvatarUploader from "@/app/components/AvatarUploader";
import { Mail, Shield, User, Github } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

type TabId = "profile" | "account" | "security";

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "프로필", icon: User },
  { id: "account", label: "이메일", icon: Mail },
  { id: "security", label: "보안", icon: Shield },
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const [active, setActive] = useState<TabId>("profile");

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<string>("EMAIL");
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingPw, setUpdatingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // timestamps from auth user
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);

  const providerLabel = useMemo(() => {
    switch (provider) {
      case "DISCORD":
        return "디스코드";
      case "GITHUB":
        return "깃허브";
      default:
        return "이메일";
    }
  }, [provider]);

  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.replace("/login?next=/account/settings");
        return;
      }
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? "");
      const providerFromIdentities = user?.identities?.[0]?.provider;
      const providerFromAppMeta = user?.app_metadata?.provider;
      const providerFromUserMeta = user?.user_metadata?.provider;
      const detected = providerFromIdentities || providerFromAppMeta || providerFromUserMeta || (user?.email ? "EMAIL" : "UNKNOWN");
      setProvider(String(detected).toUpperCase());

      // auth timestamps
      setCreatedAt(user?.created_at ?? null);
      setLastSignIn(user?.last_sign_in_at ?? null);

      if (user?.id) {
        // Auth user metadata를 우선적으로 사용 (프로필 테이블 대신)
        const displayNameFromAuth = user.user_metadata?.display_name;
        const avatarUrlFromAuth = user.user_metadata?.avatar_url;

        // 프로필 테이블이 있을 경우 대비해 두 번째로 시도
        let displayName = displayNameFromAuth || "";
        let avatarUrl = avatarUrlFromAuth || null;

        try {
          // 프로필 테이블에서 정보 가져오기 (테이블이 없는 경우엔 오류 발생하지만 무시)
          const { data: prof } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

          // Auth metadata가 없을 경우 테이블 값을 사용
          if (!displayName && prof?.display_name) displayName = prof.display_name;
          if (!avatarUrl && prof?.avatar_url) avatarUrl = prof.avatar_url;
        } catch (error) {
          // 프로필 테이블이 없거나 접근 오류가 발생해도 무시하고 Auth metadata만 사용
          console.log("프로필 테이블 접근 오류:", error);
        }

        setDisplayName(displayName);
        setAvatarUrl(avatarUrl);
      }
      setLoading(false);
    })();
  }, [router]);

  const onSaveProfile = async () => {
    if (!displayName.trim()) {
      setMessage("표시 이름을 입력해주세요.");
      return;
    }
    setSavingProfile(true);
    setMessage(null);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    
    // 프로필 테이블 업데이트 (임시 주석 처리 - 테이블이 존재하지 않을 수 있음)
    // const { error: profileError } = await supabase
    //   .from("profiles")
    //   .upsert({ id: user.id, display_name: displayName.trim() });

    // Auth user metadata 업데이트
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() }
    });

    setSavingProfile(false);

    if (authError) {
      setMessage(`Auth 오류: ${authError.message}`);
    } else {
      setMessage("프로필이 저장되었습니다.");
    }
  };

  const onAvatarUploaded = async (url: string) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    // 1) profiles 테이블에 저장(권장)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: url,
      updated_at: new Date().toISOString(),
    });

    // 2) auth user metadata에도 저장 (optional, for convenience)
    const { error: authError } = await supabase.auth.updateUser({
      data: { avatar_url: url }
    });

    if (!profileError && !authError) {
      setAvatarUrl(url);
      setMessage("아바타가 업데이트되었습니다.");
      // refresh timestamps from auth (no harm)
      try {
        const { data: refreshed } = await supabase.auth.getUser();
        setCreatedAt(refreshed.user?.created_at ?? createdAt);
        setLastSignIn(refreshed.user?.last_sign_in_at ?? lastSignIn);
      } catch {
        // ignore
      }
    } else {
      setMessage(`오류: ${profileError?.message || authError?.message}`);
    }
  };

  const onUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    setSendingEmail(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSendingEmail(false);
    setMessage(error ? error.message : "인증 메일을 보냈습니다. 메일함을 확인해주세요.");
    if (!error) setNewEmail("");
  };

  const onUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    setUpdatingPw(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPw(false);
    setMessage(error ? error.message : "비밀번호가 변경되었습니다.");
    if (!error) {
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const onDeleteAccount = async () => {
    // simple confirmation dialog; consider replacing with modal for better UX
    if (!confirm("정말 계정을 탈퇴하시겠습니까? 이 작업은 복구할 수 없습니다.")) return;
    setDeleting(true);
    setMessage(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      setDeleting(false);
      if (!res.ok) {
        setMessage(body.error || "계정 탈퇴에 실패했습니다.");
        return;
      }
      // sign out and redirect to home
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      router.replace("/");
    } catch {
      setDeleting(false);
      setMessage("서버 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="px-4 sm:px-6 pt-32 pb-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm text-primary mb-4 border border-primary/20">
            <User className="w-4 h-4" />
            계정 관리
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">프로필 설정</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            프로필 정보, 계정 설정, 보안을 관리하세요
          </p>
        </div>

        {/* Profile Overview Card */}
        <div className="mb-8 glass-effect rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-2xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="프로필 이미지" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-2xl md:text-3xl font-bold text-primary bg-gradient-to-br from-primary/20 to-secondary/20">
                    {displayName ? displayName[0] : "?"}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                {provider === "DISCORD" ? (
                  <FaDiscord className="w-4 h-4 text-white" />
                ) : provider === "GITHUB" ? (
                  <Github className="w-4 h-4 text-white" />
                ) : (
                  <Mail className="w-4 h-4 text-white" />
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{displayName || "사용자"}</h2>
              <p className="text-muted-foreground mb-4">{email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{providerLabel}</span>
                  <span>로그인</span>
                </div>
                <div>·</div>
                <div>가입일: {createdAt ? new Date(createdAt).toLocaleDateString('ko-KR') : "-"}</div>
                <div>·</div>
                <div>최근 로그인: {lastSignIn ? new Date(lastSignIn).toLocaleDateString('ko-KR') : "-"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 font-medium transition-all duration-300 ${
                active === id
                  ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/50 text-primary shadow-lg scale-105"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content Panels */}
        <div className="space-y-6">
          {active === "profile" && (
            <div className="glass-effect rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">프로필 정보</h3>
                  <p className="text-muted-foreground">프로필 이미지와 표시 이름을 설정하세요</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <AvatarUploader onUploaded={onAvatarUploaded} />
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">표시 이름</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                      placeholder="예: 릿시"
                    />
                    <p className="text-xs text-muted-foreground">다른 사람들이 볼 수 있는 이름입니다</p>
                  </div>

                  <Button
                    onClick={onSaveProfile}
                    disabled={!displayName.trim() || savingProfile}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover-lift transition-all duration-300"
                  >
                    {savingProfile ? "저장 중..." : "프로필 저장"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {active === "account" && (
            <div className="glass-effect rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">이메일 주소</h3>
                  <p className="text-muted-foreground">계정에 연결된 이메일 주소를 변경하세요</p>
                </div>
              </div>

              <div className="max-w-md space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">현재 이메일</label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">새 이메일 주소</label>
                  <input
                    type="email"
                    placeholder="새로운 이메일 주소"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                  />
                  <p className="text-xs text-muted-foreground">변경 후 인증 메일이 전송됩니다</p>
                </div>

                <Button
                  onClick={onUpdateEmail}
                  disabled={!newEmail.trim() || sendingEmail}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover-lift transition-all duration-300"
                >
                  {sendingEmail ? "전송 중..." : "인증 메일 보내기"}
                </Button>
              </div>
            </div>
          )}

          {active === "security" && (
            <div className="glass-effect rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">보안 설정</h3>
                  <p className="text-muted-foreground">비밀번호를 안전하게 관리하세요</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">새 비밀번호</label>
                    <input
                      type="password"
                      placeholder="새 비밀번호 입력"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">비밀번호 확인</label>
                    <input
                      type="password"
                      placeholder="비밀번호 다시 입력"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                    />
                  </div>
                </div>

                <Button
                  onClick={onUpdatePassword}
                  disabled={!newPassword || !confirmPassword || updatingPw}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover-lift transition-all duration-300"
                >
                  {updatingPw ? "변경 중..." : "비밀번호 변경"}
                </Button>

                <div className="border-t border-white/10 pt-6">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-destructive mb-2">계정 탈퇴</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                          프로필, 게시물, 댓글 등 모든 관련 데이터가 제거됩니다.
                        </p>
                        <Button
                          onClick={onDeleteAccount}
                          disabled={deleting}
                          variant="destructive"
                          className="px-6 py-2 rounded-xl font-semibold"
                        >
                          {deleting ? "탈퇴 처리 중..." : "계정 탈퇴"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 glass-effect rounded-xl p-4">
          <Link href="/" className="text-primary hover:text-primary/80 transition-colors font-medium">
            ← 홈으로 돌아가기
          </Link>
          <Button
            variant="outline"
            onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}
            className="px-6 py-2 border-white/20 hover:bg-white/5 rounded-xl"
          >
            로그아웃
          </Button>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
            message.includes("오류") || message.includes("실패") || message.includes("일치하지")
              ? "bg-destructive/10 border border-destructive/20 text-destructive"
              : "bg-green-500/10 border border-green-500/20 text-green-600"
          }`}>
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
