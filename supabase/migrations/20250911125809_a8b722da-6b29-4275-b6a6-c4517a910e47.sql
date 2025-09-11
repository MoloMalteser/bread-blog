-- Update BreadGPT edge function to be less philosophical
UPDATE storage.objects SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{prompt_style}',
  '"normal"'::jsonb
)
WHERE bucket_id = 'system_prompts' AND name = 'breadgpt_style';

-- Create system prompt override if it doesn't exist
INSERT INTO storage.objects (bucket_id, name, metadata) 
VALUES ('system_prompts', 'breadgpt_style', '{"prompt_style": "normal"}'::jsonb)
ON CONFLICT (bucket_id, name) DO UPDATE SET
metadata = jsonb_set(EXCLUDED.metadata, '{prompt_style}', '"normal"'::jsonb);