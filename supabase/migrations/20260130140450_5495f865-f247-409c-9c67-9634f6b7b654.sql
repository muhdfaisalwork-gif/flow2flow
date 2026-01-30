-- Create enum for 2FA methods
CREATE TYPE public.tfa_method AS ENUM ('totp', 'email', 'sms');

-- Create table to store user 2FA settings
CREATE TABLE public.user_tfa_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    preferred_method tfa_method,
    totp_secret TEXT,
    totp_verified BOOLEAN NOT NULL DEFAULT false,
    phone_number TEXT,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT true,
    backup_codes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tfa_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own 2FA settings"
ON public.user_tfa_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA settings"
ON public.user_tfa_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA settings"
ON public.user_tfa_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_tfa_settings_updated_at
BEFORE UPDATE ON public.user_tfa_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for pending 2FA verifications
CREATE TABLE public.tfa_pending_verifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    method tfa_method NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.tfa_pending_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending verifications
CREATE POLICY "Users can view their own pending verifications"
ON public.tfa_pending_verifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending verifications"
ON public.tfa_pending_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verifications"
ON public.tfa_pending_verifications
FOR UPDATE
USING (auth.uid() = user_id);