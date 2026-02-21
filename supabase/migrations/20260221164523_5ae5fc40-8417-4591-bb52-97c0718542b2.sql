CREATE POLICY "Users can delete their own TFA settings"
ON public.user_tfa_settings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);