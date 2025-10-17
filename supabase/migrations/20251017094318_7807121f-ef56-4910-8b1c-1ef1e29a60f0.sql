-- Create function to update supporter badge when subscription changes
CREATE OR REPLACE FUNCTION public.update_supporter_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan = 'supporter' THEN
    -- Add supporter badge if not already present
    UPDATE public.profiles
    SET badges = array_append(COALESCE(badges, '{}'), 'supporter')
    WHERE id = NEW.user_id
    AND NOT ('supporter' = ANY(COALESCE(badges, '{}')));
  ELSE
    -- Remove supporter badge if present
    UPDATE public.profiles
    SET badges = array_remove(COALESCE(badges, '{}'), 'supporter')
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to update badges when subscription changes
DROP TRIGGER IF EXISTS on_subscription_change ON public.user_subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supporter_badge();