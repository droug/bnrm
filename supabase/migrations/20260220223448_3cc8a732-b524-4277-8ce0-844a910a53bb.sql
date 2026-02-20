-- Fix RLS: allow admins and comptables to insert notifications for any user
DROP POLICY IF EXISTS "Admins can insert notifications for any user" ON public.notifications;

CREATE POLICY "Admins can insert notifications for any user"
ON public.notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'comptable', 'librarian')
  )
  OR auth.uid() = user_id
);