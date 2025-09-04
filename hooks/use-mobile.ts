import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkDevice = () => {
      // 화면 크기 확인
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
      
      // 터치 지원 확인 (모바일/태블릿 주요 특징)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // 호버 지원 확인 (데스크톱/랩톱 주요 특징)
      const hasHover = window.matchMedia('(hover: hover)').matches
      
      // 포인터 정밀도 확인 (마우스 vs 터치)
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches
      
      // User Agent를 통한 모바일 기기 감지
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // 컴퓨터/MAC/DESKTOP 환경 판단 로직
      // 1. 호버와 정밀한 포인터가 있으면 데스크톱 (마우스 환경)
      // 2. 터치가 지원되지 않거나 주요 입력이 아닌 경우 데스크톱
      // 3. 모바일 User Agent가 없고 화면이 충분히 큰 경우 데스크톱
      const isDesktop = (hasHover && hasFinePointer) || 
                       (!isTouchDevice) || 
                       (!mobileUserAgent && window.innerWidth >= 1024)
      
      // 최종 모바일 판단: 작은 화면이면서 데스크톱이 아닌 경우
      setIsMobile(isSmallScreen && !isDesktop)
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const hoverMql = window.matchMedia('(hover: hover)')
    const pointerMql = window.matchMedia('(pointer: fine)')
    
    const onChange = () => checkDevice()
    
    mql.addEventListener("change", onChange)
    hoverMql.addEventListener("change", onChange)
    pointerMql.addEventListener("change", onChange)
    
    checkDevice()
    
    return () => {
      mql.removeEventListener("change", onChange)
      hoverMql.removeEventListener("change", onChange)
      pointerMql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
