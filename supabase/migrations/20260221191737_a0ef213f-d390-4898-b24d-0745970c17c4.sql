-- Add DELETE policy for tfa_pending_verifications to allow cleanup
CREATE POLICY "Users can delete their own pending verifications"
ON public.tfa_pending_verifications
FOR DELETE
USING (auth.uid() = user_id);