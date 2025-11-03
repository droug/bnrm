-- Enable realtime for restoration_requests table
ALTER TABLE public.restoration_requests REPLICA IDENTITY FULL;

-- Add the table to the realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'restoration_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.restoration_requests;
  END IF;
END $$;