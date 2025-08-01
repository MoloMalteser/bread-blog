-- Create websites table for WebBuilder
CREATE TABLE public.websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view websites" 
ON public.websites 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create one website" 
ON public.websites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM public.websites WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own website" 
ON public.websites 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own website" 
ON public.websites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_websites_updated_at
BEFORE UPDATE ON public.websites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();