import type { Locale } from "./config"

export const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      projects: "Projects",
      blog: "Blog",
      contact: "Contact",
    },
    home: {
      hero: {
        greeting: "Hello, I am",
        description: "Full-stack developer passionate about creating beautiful and functional web experiences",
        viewProfile: "View Profile",
        shareProfile: "Share Profile",
      },
      stats: {
        experience: "Years Experience",
        learning: "Continuous Learning",
        userCentric: "User-Centric",
      },
      projects: {
        title: "Featured Projects",
        viewAll: "View All Projects",
      },
      skills: {
        title: "Skills",
      },
    },
    blog: {
      title: "Blog",
      readMore: "Read More",
      publishedOn: "Published on",
      by: "by",
    },
    footer: {
      rights: "All rights reserved",
    },
  },
  ko: {
    nav: {
      home: "홈",
      about: "소개",
      projects: "프로젝트",
      blog: "블로그",
      contact: "연락",
    },
    home: {
      hero: {
        greeting: "안녕하세요,",
        description: "아름답고 기능적인 웹 경험을 만드는 것에 열정을 가진 풀스택 개발자입니다",
        viewProfile: "프로필 보기",
        shareProfile: "프로필 공유",
      },
      stats: {
        experience: "년 개발 경험",
        learning: "지속적인 학습",
        userCentric: "사용자 중심",
      },
      projects: {
        title: "대표 프로젝트",
        viewAll: "모든 프로젝트 보기",
      },
      skills: {
        title: "기술 스택",
      },
    },
    blog: {
      title: "블로그",
      readMore: "더 읽기",
      publishedOn: "게시일",
      by: "작성자",
    },
    footer: {
      rights: "모든 권리 보유",
    },
  },
  ja: {
    nav: {
      home: "ホーム",
      about: "紹介",
      projects: "プロジェクト",
      blog: "ブログ",
      contact: "連絡",
    },
    home: {
      hero: {
        greeting: "こんにちは、",
        description: "美しく機能的なウェブ体験を作ることに情熱を持つフルスタック開発者です",
        viewProfile: "プロフィールを見る",
        shareProfile: "プロフィールを共有",
      },
      stats: {
        experience: "年の開発経験",
        learning: "継続的な学習",
        userCentric: "ユーザー中心",
      },
      projects: {
        title: "代表プロジェクト",
        viewAll: "すべてのプロジェクトを見る",
      },
      skills: {
        title: "スキル",
      },
    },
    blog: {
      title: "ブログ",
      readMore: "続きを読む",
      publishedOn: "公開日",
      by: "著者",
    },
    footer: {
      rights: "すべての権利を保有",
    },
  },
} as const

export function getTranslation(locale: Locale) {
  return translations[locale] || translations.ko
}
