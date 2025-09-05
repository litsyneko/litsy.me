-- Discord OAuth 안정화를 위한 개선사항

-- 1. Discord 사용자 정보 동기화 함수 개선
CREATE OR REPLACE FUNCTION public.sync_discord_user_info()
RETURNS TRIGGER AS $$
DECLARE
  discord_data jsonb;
  user_display_name text;
  user_avatar_url text;
  discord_username text;
  discord_global_name text;
BEGIN
  -- Discord 사용자인지 확인
  IF NEW.raw_app_meta_data->>'provider' = 'discord' THEN
    discord_data := NEW.raw_user_meta_data;
    
    -- Discord 사용자명 추출 (우선순위: global_name > nickname > username)
    discord_global_name := discord_data->'custom_claims'->>'global_name';
    discord_username := discord_data->>'username';
    
    IF discord_global_name IS NOT NULL AND discord_global_name != '' THEN
      user_display_name := discord_global_name;
    ELSIF discord_data->>'nickname' IS NOT NULL AND discord_data->>'nickname' != '' THEN
      user_display_name := discord_data->>'nickname';
    ELSE
      user_display_name := discord_username;
    END IF;
    
    -- 아바타 URL 추출
    user_avatar_url := discord_data->>'avatar_url';
    
    -- public.users 테이블에 정보 동기화
    INSERT INTO public.users (
      id, 
      provider, 
      username, 
      display_name, 
      avatar, 
      metadata,
      last_synced
    ) VALUES (
      NEW.id,
      'discord',
      discord_username,
      user_display_name,
      user_avatar_url,
      jsonb_build_object(
        'discord_id', discord_data->>'provider_id',
        'discriminator', discord_data->>'name',
        'global_name', discord_global_name,
        'email_verified', discord_data->>'email_verified',
        'full_name', discord_data->>'full_name'
      ),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      display_name = EXCLUDED.display_name,
      avatar = EXCLUDED.avatar,
      metadata = EXCLUDED.metadata,
      last_synced = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 기존 트리거 제거 후 새로운 트리거 생성
DROP TRIGGER IF EXISTS sync_user_info_on_auth ON auth.users;
CREATE TRIGGER sync_user_info_on_auth
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_discord_user_info();

-- 3. Discord OAuth 에러 로깅 테이블 생성
CREATE TABLE IF NOT EXISTS public.oauth_error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  error_code TEXT NOT NULL,
  error_description TEXT,
  error_details JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. OAuth 에러 로깅 함수
CREATE OR REPLACE FUNCTION public.log_oauth_error(
  p_user_id UUID DEFAULT NULL,
  p_provider TEXT DEFAULT 'discord',
  p_error_code TEXT DEFAULT 'unknown',
  p_error_description TEXT DEFAULT NULL,
  p_error_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.oauth_error_logs (
    user_id,
    provider,
    error_code,
    error_description,
    error_details
  ) VALUES (
    p_user_id,
    p_provider,
    p_error_code,
    p_error_description,
    p_error_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Discord 사용자 정보 조회 함수
CREATE OR REPLACE FUNCTION public.get_discord_user_info(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  discord_id TEXT,
  username TEXT,
  global_name TEXT,
  email_verified BOOLEAN,
  last_synced TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    au.email,
    u.display_name,
    u.avatar,
    u.metadata->>'discord_id',
    u.username,
    u.metadata->>'global_name',
    (u.metadata->>'email_verified')::boolean,
    u.last_synced
  FROM public.users u
  JOIN auth.users au ON u.id = au.id
  WHERE u.id = user_id AND u.provider = 'discord';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS 정책 설정
ALTER TABLE public.oauth_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own OAuth error logs" ON public.oauth_error_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 7. 권한 부여
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.oauth_error_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_discord_user_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_oauth_error(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- 8. 기존 Discord 사용자 정보 동기화 (수동 실행 필요)
-- 이 부분은 프로덕션에서 수동으로 실행해야 합니다.
-- UPDATE auth.users SET updated_at = NOW() WHERE raw_app_meta_data->>'provider' = 'discord';

COMMIT;