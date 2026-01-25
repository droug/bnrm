-- Table for media bookmarks (timestamps) for audio/video documents
CREATE TABLE public.media_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL,
  timestamp_seconds NUMERIC NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_media_bookmarks_user_document ON public.media_bookmarks(user_id, document_id);
CREATE INDEX idx_media_bookmarks_document ON public.media_bookmarks(document_id);

-- Enable Row Level Security
ALTER TABLE public.media_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view their own media bookmarks" 
ON public.media_bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can create their own media bookmarks" 
ON public.media_bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookmarks
CREATE POLICY "Users can update their own media bookmarks" 
ON public.media_bookmarks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own media bookmarks" 
ON public.media_bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_media_bookmarks_updated_at
BEFORE UPDATE ON public.media_bookmarks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();