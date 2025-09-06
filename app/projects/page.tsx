
import ProjectsClient from './ProjectsClient'

export const metadata = {
  title: '프로젝트 | 릿시 포트폴리오',
  description: '릿시의 프로젝트 모음 — 웹, 봇, 개인 프로젝트를 소개합니다.',
  keywords: ['Litsy', '릿시', '프로젝트', '포트폴리오', '웹 개발']
}

export default function ProjectsPage() {
  return <ProjectsClient />
}
