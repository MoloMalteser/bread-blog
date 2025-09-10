-- Fix the search path issue for the vote_on_poll function
CREATE OR REPLACE FUNCTION vote_on_poll(poll_id uuid, option_index integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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