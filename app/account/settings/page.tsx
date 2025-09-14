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
      const p = (user?.identities?.[0]?.provider || user?.app_metadata?.provider || "EMAIL").toUpperCase();
      setProvider(p);
      if (user?.id) {
        // 프로필 테이블에서 정보 가져오기
        const { data: prof } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        
        // auth user metadata에서 display_name 가져오기 (프로필 테이블에 없을 경우 대비)
        const displayNameFromAuth = user.user_metadata?.display_name;
        
        setDisplayName(prof?.display_name || displayNameFromAuth || "");
        setAvatarUrl(prof?.avatar_url ?? null);
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
    
    // 프로필 테이블 업데이트
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName.trim() });
    
    // Auth user metadata 업데이트
    const { error: authError } = await supabase.auth.updateUser({ 
      data: { display_name: displayName.trim() } 
    });
    
    setSavingProfile(false);
    
    if (profileError || authError) {
      setMessage(`오류: ${profileError?.message || authError?.message}`);
    } else {
      setMessage("프로필이 저장되었습니다.");
    }
  };

  const onAvatarUploaded = async (url: string) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, avatar_url: url });
    if (!error) setAvatarUrl(url);
    setMessage(error ? error.message : "아바타가 업데이트되었습니다.");
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

  if (loading) return null;

  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 glass-effect rounded-2xl p-4 md:p-6 hover-glow transition-all duration-300">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-lg">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-lg font-bold text-primary bg-primary/10">{displayName ? displayName[0] : "?"}</div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">계정 설정</h1>
              <p className="text-sm md:text-base text-muted-foreground truncate">프로필, 이메일, 보안을 관리하세요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm rounded-full px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary whitespace-nowrap shadow-md">
            {provider === "DISCORD" ? (
              <FaDiscord className="w-4 h-4" />
            ) : provider === "GITHUB" ? (
              <Github className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span className="font-medium">{providerLabel}</span>
            <span>·</span>
            <span className="truncate max-w-[180px]">{email || "-"}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              aria-current={active === id ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 hover-lift ${
                active === id
                  ? "bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30 text-primary shadow-md"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Panels */}
        {active === "profile" && (
          <section className="rounded-3xl p-6 md:p-8 glass-effect border border-primary/20 shadow-xl ring-1 ring-primary/10 hover:ring-primary/30 transition-all duration-300 hover-lift">
            <h2 className="text-lg font-semibold tracking-tight mb-1 flex items-center gap-2"><User className="w-4 h-4" /> 프로필</h2>
            <p className="text-sm text-muted-foreground mb-4">프로필 이미지와 표시 이름을 설정하세요.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div>
                <AvatarUploader onUploaded={onAvatarUploaded} />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">표시 이름</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="예: 릿시"
                  />
                </div>
                <Button onClick={onSaveProfile} disabled={!displayName.trim() || savingProfile} className="mt-2 rounded-xl px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md transition-all duration-300 hover-lift">
                  {savingProfile ? "저장 중..." : "프로필 저장"}
                </Button>
              </div>
            </div>
          </section>
        )}

        {active === "account" && (
          <section className="rounded-3xl p-6 md:p-8 glass-effect border border-primary/20 shadow-xl ring-1 ring-primary/10 hover:ring-primary/30 transition-all duration-300 hover-lift">
            <h2 className="text-lg font-semibold tracking-tight mb-1 flex items-center gap-2"><Mail className="w-4 h-4" /> 이메일</h2>
            <p className="text-sm text-muted-foreground mb-4">새 이메일로 변경 시 인증 메일이 전송됩니다.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">새 이메일</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              <div>
                <Button onClick={onUpdateEmail} disabled={!newEmail.trim() || sendingEmail} className="rounded-xl px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md transition-all duration-300 hover-lift">
                  {sendingEmail ? "전송 중..." : "변경 링크 보내기"}
                </Button>
              </div>
            </div>
          </section>
        )}

        {active === "security" && (
          <section className="rounded-3xl p-6 md:p-8 glass-effect border border-primary/20 shadow-xl ring-1 ring-primary/10 hover:ring-primary/30 transition-all duration-300 hover-lift">
            <h2 className="text-lg font-semibold tracking-tight mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> 보안</h2>
            <p className="text-sm text-muted-foreground mb-4">비밀번호를 안전하게 변경하세요.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">새 비밀번호</label>
                <input
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">새 비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
            <Button onClick={onUpdatePassword} disabled={!newPassword || !confirmPassword || updatingPw} className="mt-4 rounded-xl px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md transition-all duration-300 hover-lift">
              {updatingPw ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </section>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 glass-effect rounded-xl p-4">
          <Link href="/" className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-2 hover:underline-offset-4">홈으로</Link>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }} className="rounded-xl px-4 py-2 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 hover-lift">
            로그아웃
          </Button>
        </div>

        {message && <p className="mt-3 text-xs text-muted-foreground">{message}</p>}
      </div>
    </section>
  );
}
