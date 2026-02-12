-- Add account_status column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active';

-- Add deleted_at column for tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- Add deleted_by column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_by uuid DEFAULT NULL;

-- Create index for filtering active accounts
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- Mark the orphaned profile-less user (soufianeeljarid0@gmail.com) - 
-- We'll handle this in the edge function since the profile was already deleted