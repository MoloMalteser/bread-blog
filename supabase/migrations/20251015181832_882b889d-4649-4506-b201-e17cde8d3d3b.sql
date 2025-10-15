-- Add show_ads column to user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS show_ads boolean DEFAULT false;

COMMENT ON COLUMN public.user_subscriptions.show_ads IS 'Whether user wants to support Bread by showing ads';