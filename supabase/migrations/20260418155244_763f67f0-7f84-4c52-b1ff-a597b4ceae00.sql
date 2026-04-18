-- ============ STORIES ============
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image','text','voice','video','emoji')),
  content TEXT,
  media_url TEXT,
  background_color TEXT DEFAULT '#5227ff',
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX idx_stories_expires ON public.stories(expires_at);
CREATE INDEX idx_stories_user ON public.stories(user_id);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stories" ON public.stories
  FOR SELECT USING (expires_at > now());
CREATE POLICY "Users can create own stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Story views tracking
CREATE TABLE public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can record own views" ON public.story_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "Story owners and viewers can see views" ON public.story_views
  FOR SELECT USING (
    auth.uid() = viewer_id OR
    EXISTS (SELECT 1 FROM public.stories WHERE stories.id = story_views.story_id AND stories.user_id = auth.uid())
  );

-- ============ VIBE ROOMS (live audio) ============
CREATE TABLE public.vibe_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  mood TEXT DEFAULT 'chill',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
ALTER TABLE public.vibe_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active vibe rooms" ON public.vibe_rooms
  FOR SELECT USING (true);
CREATE POLICY "Users can create vibe rooms" ON public.vibe_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own rooms" ON public.vibe_rooms
  FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete own rooms" ON public.vibe_rooms
  FOR DELETE USING (auth.uid() = host_id);

CREATE TABLE public.vibe_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.vibe_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_speaking BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);
ALTER TABLE public.vibe_room_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view participants" ON public.vibe_room_participants
  FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.vibe_room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.vibe_room_participants
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.vibe_room_participants
  FOR DELETE USING (auth.uid() = user_id);

-- ============ POST REACTIONS ============
CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reactions" ON public.post_reactions
  FOR SELECT USING (true);
CREATE POLICY "Users can add own reactions" ON public.post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.post_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============ ENABLE RLS ON CALLS ============
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own calls" ON public.calls
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = callee_id);
CREATE POLICY "Users can create calls" ON public.calls
  FOR INSERT WITH CHECK (auth.uid() = caller_id);
CREATE POLICY "Participants can update calls" ON public.calls
  FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = callee_id);
CREATE POLICY "Participants can delete calls" ON public.calls
  FOR DELETE USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Realtime
ALTER TABLE public.calls REPLICA IDENTITY FULL;
ALTER TABLE public.stories REPLICA IDENTITY FULL;
ALTER TABLE public.vibe_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.vibe_room_participants REPLICA IDENTITY FULL;
ALTER TABLE public.post_reactions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vibe_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vibe_room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;

-- ============ STORIES STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Story media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'stories');
CREATE POLICY "Users can upload own story media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own story media" ON storage.objects
  FOR DELETE USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============ CLEANUP FUNCTION FOR EXPIRED STORIES ============
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.stories WHERE expires_at < now();
END;
$$;