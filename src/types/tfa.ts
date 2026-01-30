export type TFAMethod = 'totp' | 'email' | 'sms';

export interface TFASettings {
  id: string;
  user_id: string;
  enabled: boolean;
  preferred_method: TFAMethod | null;
  totp_secret: string | null;
  totp_verified: boolean;
  phone_number: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  backup_codes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TFAPendingVerification {
  id: string;
  user_id: string;
  method: TFAMethod;
  code: string;
  expires_at: string;
  created_at: string;
  used: boolean;
}
