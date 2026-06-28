-- Migration 069: Create system settings table & promote super admin
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.system_settings;
CREATE POLICY "Authenticated users can view settings" 
  ON public.system_settings 
  FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Super admins can manage settings" ON public.system_settings;
CREATE POLICY "Super admins can manage settings" 
  ON public.system_settings 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Seed default settings
INSERT INTO public.system_settings (key, value)
VALUES 
  ('fallback_whatsapp_account_id', 'null'::jsonb),
  ('feature_toggles', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Promote praneethpvrealty@gmail.com to super admin role
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'praneethpvrealty@gmail.com';
