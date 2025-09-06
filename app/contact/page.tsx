
import ContactClient from './ContactClient'

export const metadata = {
  title: '문의 | 릿시 포트폴리오',
  description: '프로젝트 문의 및 연락처 정보 페이지 — 이메일, GitHub, Discord 정보를 제공합니다.',
  keywords: ['Litsy', '릿시', '문의', '연락처', 'contact']
}

export default function ContactPage() {
  return <ContactClient />
}
