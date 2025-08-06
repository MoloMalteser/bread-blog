-- Create notification subscriptions table
CREATE TABLE public.notification_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own subscriptions"
ON public.notification_subscriptions
FOR ALL
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_notification_subscriptions_user_id ON public.notification_subscriptions(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_public ON public.posts(is_public) WHERE is_public = true;