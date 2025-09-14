"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-3xl glass-effect rounded-2xl p-8 shadow-xl border border-primary/10">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">개인정보처리방침</h1>

        <p className="text-sm text-muted-foreground mb-4">
          본 개인정보처리방침은 릿시네코(LitsyNeko)의 개인정보 처리 및 보호 방침을 안내합니다. 서비스 이용과 관련하여 수집되는 개인정보의 항목, 목적, 보관기간, 이용자 권리 및
          제3자 제공 등에 대해 설명합니다.
        </p>

        <p className="text-sm text-muted-foreground mb-4">
          릿시네코(LitsyNeko)는 개인이 운영하는 웹사이트로써, 블로그 포스트/게시글에 작성된 댓글을 조회 및 수집, 로그저장을 할 수 있습니다.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">1. 수집하는 개인정보</h2>
        <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
          <li>회원 가입/인증 정보: 이메일, 인증 토큰 등</li>
          <li>프로필 정보: 표시 이름(display_name), 아바타(avatar_url)</li>
          <li>댓글 및 게시글 관련 정보: 블로그 포스트/게시글에 작성된 댓글 내용 및 댓글의 메타데이터(작성자명, 작성 시간 등), 댓글 조회/수집 로그</li>
          <li>서비스 이용 기록 및 로그 (접속 기록, 오류 로그 등)</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">2. 수집 목적</h2>
        <p className="text-sm text-muted-foreground">
          수집한 개인정보는 아래 목적을 위해 사용됩니다: 회원 인증 및 계정 관리, 프로필 표시, 문의 대응, 서비스 개선 및 보안(부정사용 방지) 등.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">3. 처리 및 보관 기간</h2>
        <p className="text-sm text-muted-foreground">
          개인정보는 수집·이용 목적이 달성되면 지체 없이 파기합니다. 다만 일부 데이터는 서비스 운영·분쟁 대응·법령상 보관 의무 등을 위해 일정 기간 보관될 수 있습니다.
          예를 들어, 부정 이용 방지를 위한 접속·이용 기록 및 오류 로그는 내부 정책에 따라 회원 탈퇴 후 최대 1년간 보관될 수 있습니다. 프로필 정보(예: 표시 이름, 아바타)는 회원 탈퇴 시 삭제되며, 관련 법령에 따라 별도의 보관이 필요한 경우에는 그 기간 동안 안전하게 보관합니다.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">4. 개인정보 처리 위탁(제3자 제공)</h2>
        <p className="text-sm text-muted-foreground">
          본 서비스는 일부 개인정보 처리 업무를 외부 서비스(Supabase 등)에 위탁하여 처리합니다. 예: 회원 인증 및 데이터 저장, 백업 등.
          위탁 대상자와 위탁 업무의 범위는 서비스 운영을 위해 필요한 최소 범위로 한정되며, 위탁 시에는 개인정보가 안전하게 관리되도록 계약상 필요한 보호조치를 요구합니다.
          명시적 동의가 필요한 경우에는 사전에 안내 또는 동의를 받고 처리합니다. 제3자가 개인정보를 자체 목적으로 사용하는 경우는 없도록 관리합니다.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">5. 쿠키 및 유사 기술</h2>
        <p className="text-sm text-muted-foreground">
          일부 기능은 쿠키를 사용하거나 브라우저 저장소(localStorage 등)를 사용할 수 있습니다. 쿠키는 브라우저 설정을 통해 차단하거나 삭제할 수 있으며, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">6. 이용자 권리 및 행사 방법</h2>
        <p className="text-sm text-muted-foreground">
          이용자는 본인 개인정보에 대해 조회·수정·삭제를 요청할 권리가 있습니다. 프로필 정보(예: 표시 이름, 아바타)는 웹사이트의 <Link href="/account/settings" className="underline text-primary">계정 설정</Link>에서 직접 수정하거나 삭제할 수 있습니다.
          탈퇴·삭제 요청이나 그 외 권리 행사는 이메일(<a className="text-primary underline" href="mailto:hello@litsy.me">hello@litsy.me</a>)로 요청해 주시면 본인 확인 절차 후 관련 법령에 따라 신속하게 처리하겠습니다. 권리 행사에 필요한 경우 신원 확인을 위한 최소한의 정보 제공을 요청할 수 있습니다.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">7. 보안</h2>
        <p className="text-sm text-muted-foreground">
          개인정보 보호를 위해 가능한 기술적·관리적 조치를 적용하고 있습니다. 주요 조치 예시는 다음과 같습니다: 비밀번호 등 인증 정보는 결코 평문으로 저장하지 않으며, 해시 등 안전한 방식으로 관리합니다;
          서비스와 데이터 전송은 TLS(HTTPS)를 통해 암호화하여 전송합니다; 내부 접근 통제 및 최소 권한 원칙을 적용하며 정기적인 백업과 보안 점검을 수행합니다.
          다만 인터넷 환경의 특성상 완전한 보안은 보장할 수 없으므로 민감한 정보의 전달에는 주의를 권합니다.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">8. 변경 사항</h2>
        <p className="text-sm text-muted-foreground">
          개인정보처리방침은 법령 변경이나 서비스 정책 변경에 따라 수정될 수 있으며, 중요한 내용 변경 시 사이트 공지 또는 이메일로 안내합니다.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">9. 연락처</h2>
        <p className="text-sm text-muted-foreground">
          개인정보 관련 문의는 이메일로 연락해 주세요: <a className="text-primary underline" href="mailto:litsyneko@gmail.com">litsyneko@gmail.com</a>
        </p>

        <div className="mt-6 flex justify-between items-center">
          <Link href="/" className="text-sm text-primary underline">홈으로 돌아가기</Link>
          <Link href="/account/settings" className="text-sm text-muted-foreground underline">계정 설정</Link>
        </div>
      </div>
    </section>
  );
}
