-- Drop existing function and recreate with correct signature
DROP FUNCTION IF EXISTS vote_on_poll(UUID, INTEGER);

CREATE OR REPLACE FUNCTION vote_on_poll(poll_id UUID, option_index INTEGER)
RETURNS VOID AS $$
DECLARE
  user_id UUID := auth.uid();
  current_votes JSONB;
BEGIN
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to vote';
  END IF;

  SELECT votes INTO current_votes FROM polls WHERE id = poll_id;
  
  current_votes := jsonb_set(
    COALESCE(current_votes, '{}'::jsonb),
    ARRAY[user_id::text],
    to_jsonb(option_index)
  );
  
  UPDATE polls SET votes = current_votes WHERE id = poll_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for messages
ALTER TABLE private_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE private_messages;