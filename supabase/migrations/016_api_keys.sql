-- Migration: API Keys for public API access
-- Enables third-party programmatic access to the application

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT ARRAY['read']::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  request_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Index for fast key lookup
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON public.api_keys(is_active);

-- Admin-only access to api_keys table
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_api_keys ON public.api_keys
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Add audit log table for API requests (optional but useful)
CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_request_logs_api_key_id ON public.api_request_logs(api_key_id);
CREATE INDEX idx_api_request_logs_created_at ON public.api_request_logs(created_at);

-- Admin-only access to logs
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_logs ON public.api_request_logs
  FOR ALL
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
