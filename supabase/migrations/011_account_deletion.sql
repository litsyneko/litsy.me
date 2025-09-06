-- 계정 삭제 기능 구현

-- 1. 계정 삭제 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.account_deletion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deletion_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  data_backup JSONB -- 삭제된 사용자 데이터의 백업 (필요시)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_account_deletion_logs_user_id ON public.account_deletion_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_logs_email ON public.account_deletion_logs(email);
CREATE INDEX IF NOT EXISTS idx_account_deletion_logs_deleted_at ON public.account_deletion_logs(deleted_at);

-- 3. RLS 정책 설정 (관리자만 접근 가능)
ALTER TABLE public.account_deletion_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 삭제 로그를 볼 수 있음
CREATE POLICY "Only admins can view deletion logs" ON public.account_deletion_logs
  FOR SELECT USING (false); -- 일반 사용자는 접근 불가

-- 4. 사용자 계정 삭제 함수
CREATE OR REPLACE FUNCTION public.delete_user_account(
  p_deletion_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  user_data JSONB;
BEGIN
  -- 현재 사용자 확인
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, '인증되지 않은 사용자입니다.';
    RETURN;
  END IF;
  
  -- 사용자 정보 가져오기
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;
  
  IF current_user_email IS NULL THEN
    RETURN QUERY SELECT FALSE, '사용자 정보를 찾을 수 없습니다.';
    RETURN;
  END IF;
  
  -- 사용자 데이터 백업 (필요한 경우)
  SELECT jsonb_build_object(
    'user_id', current_user_id,
    'email', current_user_email,
    'created_at', created_at,
    'user_metadata', raw_user_meta_data,
    'app_metadata', raw_app_meta_data
  ) INTO user_data
  FROM auth.users
  WHERE id = current_user_id;
  
  -- 삭제 로그 기록
  INSERT INTO public.account_deletion_logs (
    user_id,
    email,
    deletion_reason,
    data_backup
  ) VALUES (
    current_user_id,
    current_user_email,
    p_deletion_reason,
    user_data
  );
  
  -- 관련 데이터 삭제 (cascade로 처리되지 않는 데이터들)
  
  -- 1. public.users 테이블에서 사용자 정보 삭제
  DELETE FROM public.users WHERE id = current_user_id;
  
  -- 2. 비밀번호 재설정 요청 삭제
  DELETE FROM public.password_reset_logs WHERE user_id = current_user_id;
  
  -- 3. 비밀번호 변경 요청 삭제
  DELETE FROM public.password_change_requests WHERE user_id = current_user_id;
  
  -- 4. OAuth 에러 로그 삭제
  DELETE FROM public.oauth_error_logs WHERE user_id = current_user_id;
  
  -- 5. 이메일 인증 로그 삭제
  DELETE FROM public.email_verification_logs WHERE user_id = current_user_id;
  
  -- 6. 프로젝트 관련 데이터 삭제 (있는 경우)
  DELETE FROM public.projects WHERE author_id = current_user_id;
  
  -- 7. 댓글 삭제 (있는 경우)
  DELETE FROM public.comments WHERE author_id = current_user_id;
  
  -- 8. 마지막으로 auth.users에서 사용자 삭제
  -- 이는 모든 관련 데이터가 삭제된 후에 수행
  DELETE FROM auth.users WHERE id = current_user_id;
  
  -- 성공 응답
  RETURN QUERY SELECT TRUE, '계정이 성공적으로 삭제되었습니다.';
  
EXCEPTION
  WHEN OTHERS THEN
    -- 오류 발생 시 롤백
    RETURN QUERY SELECT FALSE, '계정 삭제 중 오류가 발생했습니다: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 계정 삭제 전 데이터 확인 함수
CREATE OR REPLACE FUNCTION public.get_account_deletion_preview()
RETURNS TABLE (
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  projects_count INTEGER,
  comments_count INTEGER,
  last_login TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- 현재 사용자 확인
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    au.email,
    au.created_at,
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.projects WHERE author_id = current_user_id), 0),
    COALESCE((SELECT COUNT(*)::INTEGER FROM public.comments WHERE author_id = current_user_id), 0),
    au.last_sign_in_at
  FROM auth.users au
  WHERE au.id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 삭제된 계정 통계 함수 (관리자용)
CREATE OR REPLACE FUNCTION public.get_deletion_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_deletions INTEGER,
  deletions_by_day INTEGER,
  avg_account_age_days NUMERIC
) AS $$
BEGIN
  -- 이 함수는 관리자만 사용할 수 있도록 제한
  -- 실제 구현에서는 적절한 권한 체크 필요
  
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_deletions,
    (COUNT(*) / GREATEST(p_days, 1))::INTEGER as deletions_by_day,
    AVG(EXTRACT(DAYS FROM (deleted_at - (data_backup->>'created_at')::TIMESTAMP WITH TIME ZONE)))::NUMERIC as avg_account_age_days
  FROM public.account_deletion_logs
  WHERE deleted_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 권한 부여
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_preview() TO authenticated;

-- 8. 정리 작업을 위한 함수 (오래된 삭제 로그 정리)
CREATE OR REPLACE FUNCTION public.cleanup_old_deletion_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 1년 이상 된 삭제 로그 정리 (법적 요구사항에 따라 조정)
  DELETE FROM public.account_deletion_logs
  WHERE deleted_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 계정 삭제 전 확인 트리거 (선택사항)
CREATE OR REPLACE FUNCTION public.before_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 삭제 전 추가 검증 로직
  -- 예: 관리자 계정 삭제 방지, 특정 조건 확인 등
  
  -- 예시: 마지막 관리자 계정 삭제 방지
  -- IF OLD.raw_app_meta_data->>'role' = 'admin' THEN
  --   IF (SELECT COUNT(*) FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin' AND id != OLD.id) = 0 THEN
  --     RAISE EXCEPTION '마지막 관리자 계정은 삭제할 수 없습니다.';
  --   END IF;
  -- END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (필요시 활성화)
-- CREATE TRIGGER before_user_deletion_trigger
--   BEFORE DELETE ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.before_user_deletion();

COMMIT;