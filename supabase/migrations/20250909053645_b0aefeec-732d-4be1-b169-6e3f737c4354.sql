-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Create policies for image uploads
CREATE POLICY "Anyone can view uploaded images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own uploads" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create polls table
CREATE TABLE public.polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  title text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  votes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

-- Enable RLS for polls
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Create policies for polls
CREATE POLICY "Anyone can view polls" 
ON public.polls 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create polls" 
ON public.polls 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Poll creators can update their polls" 
ON public.polls 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM posts 
  WHERE posts.id = polls.post_id 
  AND posts.author_id = auth.uid()
));

-- Create function to vote on polls
CREATE OR REPLACE FUNCTION vote_on_poll(poll_id uuid, option_index integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_str text;
  current_votes jsonb;
  updated_votes jsonb;
BEGIN
  -- Get current user ID as string
  user_id_str := auth.uid()::text;
  
  -- Check if user is authenticated
  IF user_id_str IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get current votes
  SELECT votes INTO current_votes FROM polls WHERE id = poll_id;
  
  -- Initialize votes if null
  IF current_votes IS NULL THEN
    current_votes := '{}'::jsonb;
  END IF;
  
  -- Update vote (overwrite previous vote if exists)
  updated_votes := jsonb_set(current_votes, ARRAY[user_id_str], to_jsonb(option_index));
  
  -- Update the poll
  UPDATE polls 
  SET votes = updated_votes 
  WHERE id = poll_id;
  
  RETURN updated_votes;
END;
$$;