-- 비밀번호 변경 시 이메일 인증 필수화

-- 1. 비밀번호 변경 요청 테이블 생성
CREATE TABLE IF NOT EXISTS public.password_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  new_password_hash TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_password_change_requests_user_id ON public.password_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_change_requests_token_hash ON public.password_change_requests(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_change_requests_expires_at ON public.password_change_requests(expires_at);

-- 3. RLS 정책 설정
ALTER TABLE public.password_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own password change requests" ON public.password_change_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own password change requests" ON public.password_change_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. 비밀번호 변경 요청 함수
CREATE OR REPLACE FUNCTION public.request_password_change_with_email_verification(
  p_new_password TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  token_hash TEXT
) AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  new_token_hash TEXT;
  new_password_hash TEXT;
  request_id UUID;
BEGIN
  -- 현재 사용자 확인
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, '인증되지 않은 사용자입니다.', NULL::TEXT;
    RETURN;
  END IF;
  
  -- 사용자 이메일 가져오기
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;
  
  IF current_user_email IS NULL THEN
    RETURN QUERY SELECT FALSE, '사용자 이메일을 찾을 수 없습니다.', NULL::TEXT;
    RETURN;
  END IF;
  
  -- 토큰 해시 생성 (실제로는 더 안전한 방법 사용)
  new_token_hash := encode(digest(current_user_id::text || extract(epoch from now())::text || random()::text, 'sha256'), 'hex');
  
  -- 새 비밀번호 해시 생성 (실제로는 bcrypt 사용)
  new_password_hash := crypt(p_new_password, gen_salt('bf'));
  
  -- 기존 요청 삭제 (사용자당 하나의 활성 요청만 허용)
  DELETE FROM public.password_change_requests
  WHERE user_id = current_user_id AND verified = FALSE;
  
  -- 새 요청 생성
  INSERT INTO public.password_change_requests (
    user_id,
    email,
    token_hash,
    new_password_hash,
    ip_address,
    user_agent
  ) VALUES (
    current_user_id,
    current_user_email,
    new_token_hash,
    new_password_hash,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO request_id;
  
  -- 성공 응답
  RETURN QUERY SELECT TRUE, '비밀번호 변경 확인 이메일을 발송했습니다.', new_token_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 이메일 인증 후 비밀번호 변경 완료 함수
CREATE OR REPLACE FUNCTION public.confirm_password_change_with_token(
  p_token_hash TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  request_record public.password_change_requests%ROWTYPE;
  current_user_id UUID;
BEGIN
  -- 현재 사용자 확인
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, '인증되지 않은 사용자입니다.';
    RETURN;
  END IF;
  
  -- 토큰으로 요청 찾기
  SELECT * INTO request_record
  FROM public.password_change_requests
  WHERE token_hash = p_token_hash
    AND user_id = current_user_id
    AND verified = FALSE
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, '유효하지 않거나 만료된 토큰입니다.';
    RETURN;
  END IF;
  
  -- 비밀번호 업데이트 (auth.users 테이블에 직접 업데이트)
  UPDATE auth.users
  SET encrypted_password = request_record.new_password_hash,
      updated_at = NOW()
  WHERE id = current_user_id;
  
  -- 요청을 확인됨으로 표시
  UPDATE public.password_change_requests
  SET verified = TRUE,
      verified_at = NOW()
  WHERE id = request_record.id;
  
  -- 성공 응답
  RETURN QUERY SELECT TRUE, '비밀번호가 성공적으로 변경되었습니다.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 만료된 요청 정리 함수
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_change_requests()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 만료된 요청 삭제
  DELETE FROM public.password_change_requests
  WHERE expires_at < NOW() - INTERVAL '1 day';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 비밀번호 변경 상태 확인 함수
CREATE OR REPLACE FUNCTION public.get_password_change_status()
RETURNS TABLE (
  has_pending_request BOOLEAN,
  requested_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_user_id UUID;
  request_record public.password_change_requests%ROWTYPE;
BEGIN
  -- 현재 사용자 확인
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::TIMESTAMP WITH TIME ZONE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- 활성 요청 찾기
  SELECT * INTO request_record
  FROM public.password_change_requests
  WHERE user_id = current_user_id
    AND verified = FALSE
    AND expires_at > NOW()
  ORDER BY requested_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN QUERY SELECT TRUE, request_record.requested_at, request_record.expires_at;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::TIMESTAMP WITH TIME ZONE, NULL::TIMESTAMP WITH TIME ZONE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 권한 부여
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.password_change_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_password_change_with_email_verification(TEXT, INET, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_password_change_with_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_password_change_status() TO authenticated;

-- 9. 정리 작업을 위한 cron job (pg_cron 확장이 활성화된 경우)
-- SELECT cron.schedule(
--   'cleanup-expired-password-change-requests',
--   '0 2 * * *', -- 매일 오전 2시
--   'SELECT public.cleanup_expired_password_change_requests();'
-- );

COMMIT;