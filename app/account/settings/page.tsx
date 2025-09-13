"use client";

import React, { useEffect, useMemo, useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import AvatarUploader from "@/app/components/AvatarUploader";
import {
  Mail,
  Shield,
  User,
  Github,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa";

/* ============================== */
/* Reusable UI (module scope)     */
/* ============================== */
const Card = ({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-gray-900/80 border border-gray-800 rounded-lg">
    <div className="p-4 border-b border-gray-800">
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
    {children}
  </div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 space-y-4">{children}</div>
);

const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-3 bg-gray-950/50 border-t border-gray-800 rounded-b-lg flex items-center justify-end">
    {children}
  </div>
);

const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`w-full bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${className}`}
    {...props}
  />
);

/* ============================== */
/* Grapheme helpers (module scope)*/
/* ============================== */
const splitGraphemes = (s: string): string[] => {
  // @ts-ignore
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    // @ts-ignore
    const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
    return Array.from(seg.segment(s), (it: any) => it.segment);
  }
  return Array.from(s);
};
const countGraphemes = (s: string) => splitGraphemes(s).length;
const clipGraphemes = (s: string, max: number) => {
  const arr = splitGraphemes(s);
  return arr.length > max ? arr.slice(0, max).join("") : s;
};

/* ============================== */
/* Panels (module scope, memoized)*/
/* ============================== */

type ProfilePanelProps = {
  avatarUrl: string | null;
  displayName: string;
  displayNameError: string;
  MAX_NAME: number;
  onAvatarUploaded: (url: string) => Promise<void>;
  handleDisplayNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void;
  onSaveProfile: () => Promise<void>;
  savingProfile: boolean;
  validateDisplayName: (v: string) => string;
};
const ProfilePanel = memo(function ProfilePanel({
  avatarUrl,
  displayName,
  displayNameError,
  MAX_NAME,
  onAvatarUploaded,
  handleDisplayNameChange,
  handleCompositionStart,
  handleCompositionEnd,
  onSaveProfile,
  savingProfile,
  validateDisplayName,
}: ProfilePanelProps) {
  return (
    <Card title="프로필" description="프로필 이미지와 표시 이름을 관리하세요.">
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1 flex flex-col items-center text-center">
            {/* displayName prop 미전달 → 내부에서 닉네임 렌더링 방지 */}
            <AvatarUploader
              onUploaded={onAvatarUploaded}
              currentAvatarUrl={avatarUrl}
              className="-mt-1"
            />
            <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF. 최대 5MB.</p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="displayName">
                표시 이름
              </label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={handleDisplayNameChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                className={displayNameError ? "border-red-500 focus:ring-red-500" : ""}
                placeholder="예: 릿시"
              />
              {displayNameError && (
                <p className="text-xs text-red-500 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {displayNameError}
                </p>
              )}
              <p className="text-xs text-gray-500 text-right">
                {countGraphemes(displayName)}/{MAX_NAME}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSaveProfile} disabled={savingProfile || !!validateDisplayName(displayName)}>
          {savingProfile ? "저장 중..." : "변경사항 저장"}
        </Button>
      </CardFooter>
    </Card>
  );
});

type AccountPanelProps = {
  provider: string;
  providerLabel: string;
  email: string;
  newEmail: string;
  setNewEmail: (v: string) => void;
  emailError: string;
  sendingEmail: boolean;
  onUpdateEmail: () => Promise<void>;
};
const AccountPanel = memo(function AccountPanel({
  provider,
  providerLabel,
  email,
  newEmail,
  setNewEmail,
  emailError,
  sendingEmail,
  onUpdateEmail,
}: AccountPanelProps) {
  return (
    <Card title="계정" description="이메일 주소를 관리하고 계정을 연결하세요.">
      <CardContent>
        {provider !== "EMAIL" && (
          <div className="p-4 rounded-md bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{providerLabel} 계정으로 로그인하셨습니다. 이메일 변경이 제한될 수 있습니다.</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">현재 이메일</label>
            <div className="w-full rounded-md bg-gray-800/50 border border-gray-700 px-3 py-2 text-sm text-gray-400">
              {email}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="newEmail">
              새 이메일
            </label>
            <Input
              id="newEmail"
              type="email"
              placeholder="example@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={emailError ? "border-red-500 focus:ring-red-500" : ""}
            />
            {emailError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {emailError}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onUpdateEmail} disabled={!newEmail || sendingEmail || !!emailError}>
          {sendingEmail ? "전송 중..." : "이메일 변경"}
        </Button>
      </CardFooter>
    </Card>
  );
});

type SecurityPanelProps = {
  provider: string;
  providerLabel: string;
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  passwordError: string;
  showNewPassword: boolean;
  setShowNewPassword: (b: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (b: boolean) => void;
  updatingPw: boolean;
  onUpdatePassword: () => Promise<void>;
};
const SecurityPanel = memo(function SecurityPanel({
  provider,
  providerLabel,
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  passwordError,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  updatingPw,
  onUpdatePassword,
}: SecurityPanelProps) {
  return (
    <Card title="보안" description="비밀번호를 변경하고 계정 보안을 강화하세요.">
      <CardContent>
        {provider !== "EMAIL" && (
          <div className="p-4 rounded-md bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{providerLabel} 계정으로 로그인하셨습니다. 비밀번호 변경이 불가능할 수 있습니다.</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="newPassword">
                새 비밀번호
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="●●●●●●●●"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`pr-10 ${passwordError ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="confirmPassword">
                비밀번호 확인
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="●●●●●●●●"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pr-10 ${passwordError ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {passwordError && (
            <p className="text-xs text-red-500 flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {passwordError}
            </p>
          )}

          <div className="text-xs text-gray-400 space-y-1 pt-2">
            <p className={newPassword.length >= 6 ? "text-green-400" : "text-gray-500"}>- 최소 6자 이상</p>
            <p className={/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword) ? "text-green-400" : "text-gray-500"}>- 영문과 숫자 포함</p>
            <p className={newPassword && confirmPassword && newPassword === confirmPassword ? "text-green-400" : "text-gray-500"}>- 비밀번호 확인 일치</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onUpdatePassword} disabled={!newPassword || !confirmPassword || updatingPw || !!passwordError}>
          {updatingPw ? "변경 중..." : "비밀번호 변경"}
        </Button>
      </CardFooter>
    </Card>
  );
});

/* ============================== */
/* Main Page Component            */
/* ============================== */

type TabId = "profile" | "account" | "security";
type MessageType = "success" | "error" | "info";
interface Message {
  text: string;
  type: MessageType;
}

export default function AccountSettingsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<string>("EMAIL");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  // IME & 덮어쓰기 방지
  const [isComposing, setIsComposing] = useState(false);
  const [didTouchDisplayName, setDidTouchDisplayName] = useState(false);

  const MAX_NAME = 20;
  const MIN_NAME = 2;

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

  const validateEmail = (v: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v) return "이메일을 입력해주세요.";
    if (!emailRegex.test(v)) return "유효한 이메일 형식이 아닙니다.";
    return "";
  };
  const validatePassword = (v: string) => {
    if (!v) return "비밀번호를 입력해주세요.";
    if (v.length < 6) return "비밀번호는 최소 6자 이상이어야 합니다.";
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(v)) return "영문과 숫자를 포함해야 합니다.";
    return "";
  };
  const validateDisplayName = (v: string) => {
    const n = countGraphemes(v.trim());
    if (n === 0) return "표시 이름을 입력해주세요.";
    if (n < MIN_NAME) return `표시 이름은 최소 ${MIN_NAME}자 이상이어야 합니다.`;
    if (n > MAX_NAME) return `표시 이름은 최대 ${MAX_NAME}자까지 가능합니다.`;
    return "";
  };

  // 메시지 자동 닫힘
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (newEmail) setEmailError("");
  }, [newEmail]);
  useEffect(() => {
    if (newPassword) setPasswordError("");
  }, [newPassword]);
  useEffect(() => {
    if (displayName) setDisplayNameError("");
  }, [displayName]);

  // 세션/프로필 로딩 (입력값 덮어쓰기 방지)
  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login?next=/account/settings");
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (user) {
        setEmail(user.email ?? "");
        const providerName = user.app_metadata?.provider?.toUpperCase() || "EMAIL";
        setProvider(providerName);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (!profileError && profileData && !didTouchDisplayName) {
          setDisplayName(profileData.display_name ?? "");
          setAvatarUrl(profileData.avatar_url ?? null);
        }
      }
      setLoading(false);
    })();
  }, [router, didTouchDisplayName]);

  // 핸들러들을 useCallback으로 고정 (자식 메모 컴포넌트에 안정 전달)
  const handleDisplayNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDidTouchDisplayName(true);
      const next = e.target.value;
      if (isComposing) {
        setDisplayName(next);
        return;
      }
      const clipped = clipGraphemes(next, MAX_NAME);
      setDisplayName(clipped);
      if (displayNameError) setDisplayNameError("");
    },
    [isComposing, displayNameError]
  );

  const handleCompositionStart = useCallback(() => setIsComposing(true), []);
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const final = (e.target as HTMLInputElement).value;
    const clipped = clipGraphemes(final, MAX_NAME);
    setDisplayName(clipped);
    setDisplayNameError(validateDisplayName(clipped));
  }, []);

  const [sendingEmail, setSendingEmail] = useState(false);
  const onUpdateEmail = useCallback(async () => {
    const error = validateEmail(newEmail);
    if (error) {
      setEmailError(error);
      return;
    }
    setMessage(null);
    setEmailError("");
    setSendingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setMessage({ text: "인증 메일을 보냈습니다. 메일함을 확인해주세요.", type: "success" });
      setNewEmail("");
    } catch (err: any) {
      setMessage({ text: err.message || "이메일 변경 중 오류가 발생했습니다.", type: "error" });
    } finally {
      setSendingEmail(false);
    }
  }, [newEmail]);

  const [updatingPw, setUpdatingPw] = useState(false);
  const onUpdatePassword = useCallback(async () => {
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setMessage(null);
    setPasswordError("");
    setUpdatingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ text: "비밀번호가 성공적으로 변경되었습니다.", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ text: err.message || "비밀번호 변경 중 오류가 발생했습니다.", type: "error" });
    } finally {
      setUpdatingPw(false);
    }
  }, [newPassword, confirmPassword]);

  const [savingProfile, setSavingProfile] = useState(false);
  const onSaveProfile = useCallback(async () => {
    const err = validateDisplayName(displayName);
    if (err) {
      setDisplayNameError(err);
      return;
    }
    setMessage(null);
    setDisplayNameError("");
    setSavingProfile(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      if (!user) throw new Error("사용자 정보를 찾을 수 없습니다.");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, display_name: displayName.trim() });
      if (error) throw error;
      await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
      setMessage({ text: "프로필이 성공적으로 저장되었습니다.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "프로필 저장 중 오류가 발생했습니다.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  }, [displayName]);

  const onAvatarUploaded = useCallback(async (publicUrl: string) => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      if (!user) throw new Error("사용자 정보를 찾을 수 없습니다.");
      const { error } = await supabase.from("profiles").upsert({ id: user.id, avatar_url: publicUrl });
      if (error) throw error;
      setAvatarUrl(publicUrl);
      setMessage({ text: "아바타가 성공적으로 업데이트되었습니다.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "아바타 업데이트 중 오류가 발생했습니다.", type: "error" });
    }
  }, []);

  const onSignOut = async () => {
    if (confirm("정말 로그아웃하시겠습니까?")) {
      await supabase.auth.signOut();
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="text-gray-300 font-sans">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="md:flex md:space-x-8 lg:space-x-12">
          {/* Sidebar */}
          <aside className="md:w-1/4 lg:w-1/5 mb-6 md:mb-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">계정 설정</h1>
              <p className="text-sm text-gray-400">프로필과 설정을 관리하세요.</p>
            </div>

            <nav className="space-y-2">
              {[
                { id: "profile", label: "프로필", icon: User },
                { id: "account", label: "계정", icon: Mail },
                { id: "security", label: "보안", icon: Shield },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabId)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === (id as TabId)
                      ? "bg-purple-600/20 text-purple-300"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="md:w-3/4 lg:w-4/5">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg border flex items-start gap-4 text-sm ${
                  message.type === "success"
                    ? "bg-green-900/20 border-green-700/50 text-green-300"
                    : message.type === "error"
                    ? "bg-red-900/20 border-red-700/50 text-red-300"
                    : "bg-blue-900/20 border-blue-700/50 text-blue-300"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {message.type === "success" && <Check className="w-5 h-5" />}
                  {message.type === "error" && <AlertCircle className="w-5 h-5" />}
                  {message.type === "info" && <AlertCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p>{message.text}</p>
                </div>
                <button onClick={() => setMessage(null)} className="text-current/70 hover:text-current">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {activeTab === "profile" && (
              <ProfilePanel
                avatarUrl={avatarUrl}
                displayName={displayName}
                displayNameError={displayNameError}
                MAX_NAME={MAX_NAME}
                onAvatarUploaded={onAvatarUploaded}
                handleDisplayNameChange={handleDisplayNameChange}
                handleCompositionStart={handleCompositionStart}
                handleCompositionEnd={handleCompositionEnd}
                onSaveProfile={onSaveProfile}
                savingProfile={savingProfile}
                validateDisplayName={validateDisplayName}
              />
            )}

            {activeTab === "account" && (
              <AccountPanel
                provider={provider}
                providerLabel={providerLabel}
                email={email}
                newEmail={newEmail}
                setNewEmail={setNewEmail}
                emailError={emailError}
                sendingEmail={sendingEmail}
                onUpdateEmail={onUpdateEmail}
              />
            )}

            {activeTab === "security" && (
              <SecurityPanel
                provider={provider}
                providerLabel={providerLabel}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                setNewPassword={setNewPassword}
                setConfirmPassword={setConfirmPassword}
                passwordError={passwordError}
                showNewPassword={showNewPassword}
                setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                updatingPw={updatingPw}
                onUpdatePassword={onUpdatePassword}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
