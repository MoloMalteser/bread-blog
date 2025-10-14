-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'supporter')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name text NOT NULL,
  device_type text,
  last_active timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON public.user_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.user_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.user_devices FOR DELETE
  USING (auth.uid() = user_id);

-- Create post_reports table
CREATE TABLE IF NOT EXISTS public.post_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.post_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.post_reports FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
  ON public.post_reports FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Create feature_requests table
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supporters can create feature requests"
  ON public.feature_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_subscriptions
      WHERE user_id = auth.uid() AND plan = 'supporter'
    )
  );

CREATE POLICY "Users can view own requests"
  ON public.feature_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
  ON public.feature_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
  ON public.feature_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Update breadgpt_cooldowns to check for supporter status
CREATE OR REPLACE FUNCTION public.get_breadgpt_cooldown_seconds(user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM public.user_subscriptions
      WHERE user_subscriptions.user_id = get_breadgpt_cooldown_seconds.user_id
      AND plan = 'supporter'
    ) THEN 0
    ELSE 3600
  END;
$$;

-- Add is_supporter field to profiles for badge display
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';

-- Function to update supporter badge
CREATE OR REPLACE FUNCTION public.update_supporter_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan = 'supporter' THEN
    UPDATE public.profiles
    SET badges = array_append(COALESCE(badges, '{}'), 'supporter')
    WHERE id = NEW.user_id
    AND NOT ('supporter' = ANY(COALESCE(badges, '{}')));
  ELSE
    UPDATE public.profiles
    SET badges = array_remove(COALESCE(badges, '{}'), 'supporter')
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to update supporter badge
DROP TRIGGER IF EXISTS update_supporter_badge_trigger ON public.user_subscriptions;
CREATE TRIGGER update_supporter_badge_trigger
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supporter_badge();

-- Add admin badge for Marlin
DO $$
DECLARE
  marlin_id uuid;
BEGIN
  SELECT id INTO marlin_id FROM public.profiles WHERE username = 'Marlin' LIMIT 1;
  
  IF marlin_id IS NOT NULL THEN
    UPDATE public.profiles
    SET badges = array_append(COALESCE(badges, '{}'), 'admin')
    WHERE id = marlin_id
    AND NOT ('admin' = ANY(COALESCE(badges, '{}')));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (marlin_id, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;