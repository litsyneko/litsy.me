-- 비밀번호 재설정 기능 개선

-- 1. 비밀번호 재설정 요청 로깅 테이블
CREATE TABLE IF NOT EXISTS public.password_reset_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- 2. 비밀번호 재설정 요청 제한 함수
CREATE OR REPLACE FUNCTION public.can_request_password_reset(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE (
  can_request BOOLEAN,
  reason TEXT,
  wait_time_minutes INTEGER
) AS $$
DECLARE
  recent_requests INTEGER;
  last_request_time TIMESTAMP WITH TIME ZONE;
  time_limit INTERVAL := '15 minutes';
  max_requests INTEGER := 3;
BEGIN
  -- 이메일별 최근 요청 수 확인
  SELECT COUNT(*), MAX(requested_at)
  INTO recent_requests, last_request_time
  FROM public.password_reset_logs
  WHERE email = p_email
    AND requested_at > NOW() - time_limit;
  
  -- 요청 제한 확인
  IF recent_requests >= max_requests THEN
    RETURN QUERY SELECT 
      FALSE,
      '너무 많은 비밀번호 재설정 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.',
      EXTRACT(MINUTES FROM (last_request_time + time_limit - NOW()))::INTEGER;
    RETURN;
  END IF;
  
  -- IP별 요청 제한 (선택사항)
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*)
    INTO recent_requests
    FROM public.password_reset_logs
    WHERE ip_address = p_ip_address
      AND requested_at > NOW() - INTERVAL '5 minutes';
    
    IF recent_requests >= 10 THEN
      RETURN QUERY SELECT 
        FALSE,
        'IP 주소당 요청 제한을 초과했습니다.',
        5;
      RETURN;
    END IF;
  END IF;
  
  -- 요청 가능
  RETURN QUERY SELECT TRUE, 'OK', 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 비밀번호 재설정 요청 로깅 함수
CREATE OR REPLACE FUNCTION public.log_password_reset_request(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
  user_id_val UUID;
BEGIN
  -- 사용자 ID 찾기
  SELECT id INTO user_id_val
  FROM auth.users
  WHERE email = p_email;
  
  -- 로그 기록
  INSERT INTO public.password_reset_logs (
    user_id,
    email,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    user_id_val,
    p_email,
    p_ip_address,
    p_user_agent,
    p_success,
    p_error_message
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 비밀번호 재설정 완료 로깅 함수
CREATE OR REPLACE FUNCTION public.log_password_reset_completion(
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- 최근 재설정 요청을 완료로 표시
  UPDATE public.password_reset_logs
  SET 
    success = TRUE,
    completed_at = NOW()
  WHERE user_id = p_user_id
    AND completed_at IS NULL
    AND requested_at > NOW() - INTERVAL '1 hour'
  ORDER BY requested_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 비밀번호 변경 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_password_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 비밀번호가 변경된 경우 로그 업데이트
  IF OLD.encrypted_password != NEW.encrypted_password THEN
    PERFORM public.log_password_reset_completion(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 비밀번호 변경 트리거 생성
DROP TRIGGER IF EXISTS on_password_changed ON auth.users;
CREATE TRIGGER on_password_changed
  AFTER UPDATE OF encrypted_password ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_password_change();

-- 7. 비밀번호 재설정 통계 함수
CREATE OR REPLACE FUNCTION public.get_password_reset_stats(
  p_user_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_requests INTEGER,
  successful_requests INTEGER,
  failed_requests INTEGER,
  last_request_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_requests,
    COUNT(*) FILTER (WHERE success = TRUE)::INTEGER as successful_requests,
    COUNT(*) FILTER (WHERE success = FALSE)::INTEGER as failed_requests,
    MAX(requested_at) as last_request_at,
    MAX(completed_at) as last_success_at
  FROM public.password_reset_logs
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND requested_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS 정책 설정
ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own password reset logs" ON public.password_reset_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 9. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_email ON public.password_reset_logs(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_user_id ON public.password_reset_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_requested_at ON public.password_reset_logs(requested_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_ip_address ON public.password_reset_logs(ip_address);

-- 10. 권한 부여
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.password_reset_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_request_password_reset(TEXT, INET) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_password_reset_request(TEXT, INET, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_password_reset_stats(UUID, INTEGER) TO authenticated;

-- 11. 정리 작업을 위한 함수 (오래된 로그 삭제)
CREATE OR REPLACE FUNCTION public.cleanup_old_password_reset_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 90일 이상 된 로그 삭제
  DELETE FROM public.password_reset_logs
  WHERE requested_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;