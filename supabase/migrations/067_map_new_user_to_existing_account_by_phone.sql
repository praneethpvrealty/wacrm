-- ============================================================
-- 067_map_new_user_to_existing_account_by_phone.sql
-- Updates handle_new_user trigger to search for existing profiles 
-- with matching phone number (last 10 digits) and map the new
-- user to that profile's existing account and role.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
  v_account_role TEXT;
  v_existing_profile RECORD;
  v_clean_phone TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  -- Clean the new user's phone number to get the last 10 digits for matching
  IF NEW.phone IS NOT NULL AND NEW.phone <> '' THEN
    v_clean_phone := regexp_replace(NEW.phone, '\D', '', 'g');
    IF length(v_clean_phone) >= 10 THEN
      v_clean_phone := right(v_clean_phone, 10);
    END IF;
  END IF;

  -- Try to find an existing profile where the phone number matches the last 10 digits
  IF v_clean_phone IS NOT NULL AND v_clean_phone <> '' THEN
    SELECT * INTO v_existing_profile 
    FROM public.profiles 
    WHERE regexp_replace(phone, '\D', '', 'g') LIKE '%' || v_clean_phone
    LIMIT 1;
  END IF;

  IF v_existing_profile.account_id IS NOT NULL THEN
    -- Map to the existing account and role
    v_account_id := v_existing_profile.account_id;
    v_account_role := COALESCE(v_existing_profile.account_role, 'agent');
    
    -- If new user has no full name, inherit from existing profile
    IF v_full_name = '' THEN
      v_full_name := COALESCE(v_existing_profile.full_name, '');
    END IF;
  ELSE
    -- Create a new account
    INSERT INTO public.accounts (name, owner_user_id)
    VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'), NEW.id)
    RETURNING id INTO v_account_id;
    
    v_account_role := 'owner';
  END IF;

  -- Create the profile linked to the resolved account and save phone
  INSERT INTO public.profiles (user_id, full_name, email, phone, account_id, account_role, avatar_url)
  VALUES (
    NEW.id, 
    v_full_name, 
    COALESCE(NEW.email, ''), 
    NEW.phone, 
    v_account_id, 
    v_account_role,
    CASE WHEN v_existing_profile.account_id IS NOT NULL THEN v_existing_profile.avatar_url ELSE NULL END
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
