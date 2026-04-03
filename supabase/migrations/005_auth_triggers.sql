-- Trigger to sync role from user metadata to app_metadata on auth user creation
-- This allows signUp() to set role via data: { role: 'team_member' }
-- and have it appear in app_metadata for RLS policy matching

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Copy role from raw_user_meta_data to raw_app_meta_data
  IF NEW.raw_user_meta_data ? 'role' THEN
    NEW.raw_app_meta_data = COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.raw_user_meta_data -> 'role');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire before insert so app_metadata is set before the row is committed
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
