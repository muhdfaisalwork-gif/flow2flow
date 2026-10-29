import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Mail, MessageSquare, Check, Loader2, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTFA } from '@/hooks/useTFA';
import { supabase } from '@/integrations/supabase/client';
import { d1Api } from '@/lib/api';
import type { TFAMethod } from '@/types/tfa';

export function TFASettings() {
  const { settings, isLoading, initializeTFA, enableTFA, disableTFA, generateBackupCodes, refetch } = useTFA();
  const { toast } = useToast();
  
  const [setupMethod, setSetupMethod] = useState<TFAMethod | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const handleSetupTOTP = async () => {
    await initializeTFA();
    setSetupMethod('totp');
    
    try {
      if (d1Api.getToken()) {
        const response = await d1Api.setupTFA();
        setTotpSecret(response.secret);
        setTotpUri(response.totp_uri);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('tfa-setup-totp', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      if (response.error) throw response.error;
      
      setTotpSecret(response.data.secret);
      setTotpUri(response.data.totp_uri);
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: 'Could not generate authenticator secret',
      });
    }
  };

  const handleSetupEmail = async () => {
    await initializeTFA();
    setSetupMethod('email');
    await sendCode('email');
  };

  const handleSetupSMS = async () => {
    await initializeTFA();
    setSetupMethod('sms');
  };

  const sendCode = async (method: 'email' | 'sms') => {
    setIsSendingCode(true);
    setDemoCode(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('tfa-send-code', {
        body: { method, phone_number: phoneNumber },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      if (response.error) throw response.error;
      
      // If demo code is returned (SMS not configured), show it
      if (response.data.demo_code) {
        setDemoCode(response.data.demo_code);
      }
      
      toast({
        title: 'Code sent',
        description: response.data.message,
      });
    } catch (error) {
      console.error('Error sending code:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to send code',
        description: 'Please try again',
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!setupMethod) return;
    
    setIsVerifying(true);
    
    try {
      if (d1Api.getToken()) {
        const response = await d1Api.verifyAndEnableTFA(verificationCode, setupMethod);
        if (response.success) {
          if (response.backupCodes && response.backupCodes.length > 0) {
            setBackupCodes(response.backupCodes);
            setShowBackupCodes(true);
          }
          
          toast({
            title: '2FA enabled!',
            description: `${setupMethod.toUpperCase()} verification is now active`,
          });
          
          setSetupMethod(null);
          setVerificationCode('');
          setTotpSecret(null);
          setTotpUri(null);
          setDemoCode(null);
          refetch();
        } else {
          toast({
            variant: 'destructive',
            title: 'Invalid code',
            description: 'Please check your code and try again',
          });
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('tfa-verify', {
        body: { code: verificationCode, method: setupMethod },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      if (response.error) throw response.error;
      
      if (response.data.valid) {
        await enableTFA(setupMethod);
        const { codes } = await generateBackupCodes();
        
        if (codes) {
          setBackupCodes(codes);
          setShowBackupCodes(true);
        }
        
        toast({
          title: '2FA enabled!',
          description: `${setupMethod.toUpperCase()} verification is now active`,
        });
        
        setSetupMethod(null);
        setVerificationCode('');
        setTotpSecret(null);
        setTotpUri(null);
        setDemoCode(null);
        refetch();
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid code',
          description: response.data.error || 'Please check your code and try again',
        });
      }
    } catch (error) {
      console.error('Error verifying:', error);
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: 'Please try again',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisableTFA = async () => {
    await disableTFA();
    toast({
      title: '2FA disabled',
      description: 'Two-factor authentication has been turned off',
    });
    refetch();
  };

  const handleRegenerateBackupCodes = async () => {
    const { codes, error } = await generateBackupCodes();
    if (error || !codes) {
      toast({
        variant: 'destructive',
        title: 'Failed to generate codes',
        description: 'Could not generate backup codes',
      });
      return;
    }
    setBackupCodes(codes);
    setShowBackupCodes(true);
    toast({
      title: 'Backup codes regenerated',
      description: 'Make sure to save your new backup codes.',
    });
    refetch();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading security settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings?.enabled && (
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-success">2FA is enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Using {settings.preferred_method?.toUpperCase()} verification
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisableTFA}>
                Disable
              </Button>
            </div>
          )}

          <div className="grid gap-4">
            {/* TOTP Method */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">
                    Use Google Authenticator, Authy, or similar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings?.totp_verified && (
                  <Badge variant="secondary">Configured</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetupTOTP}
                  disabled={settings?.enabled && settings?.preferred_method === 'totp'}
                >
                  {settings?.totp_verified ? 'Reconfigure' : 'Set up'}
                </Button>
              </div>
            </motion.div>

            {/* Email Method */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Receive codes via email
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetupEmail}
                disabled={settings?.enabled && settings?.preferred_method === 'email'}
              >
                Set up
              </Button>
            </motion.div>

            {/* SMS Method */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">SMS Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Receive codes via text message
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings?.phone_verified && (
                  <Badge variant="secondary">Configured</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetupSMS}
                  disabled={settings?.enabled && settings?.preferred_method === 'sms'}
                >
                  Set up
                </Button>
              </div>
            </motion.div>
          </div>

          {settings?.backup_codes && settings.backup_codes.length > 0 && (
            <div className="pt-4 border-t flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Backup Codes</p>
                <p className="text-xs text-muted-foreground">
                  {settings.backup_codes.length} codes remaining
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerateBackupCodes}>
                  Regenerate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowBackupCodes(true)}>
                  View backup codes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={!!setupMethod} onOpenChange={() => setSetupMethod(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Set up {setupMethod === 'totp' ? 'Authenticator App' : setupMethod === 'email' ? 'Email' : 'SMS'} Verification
            </DialogTitle>
            <DialogDescription>
              {setupMethod === 'totp' 
                ? 'Scan the QR code with your authenticator app or enter the secret manually'
                : setupMethod === 'email'
                ? 'Enter the verification code sent to your email'
                : 'Enter your phone number to receive verification codes'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {setupMethod === 'totp' && totpSecret && (
              <>
                <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                    {totpUri && (
                      <QRCodeSVG 
                        value={totpUri} 
                        size={180}
                        level="M"
                        includeMargin={false}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan with Google Authenticator, Authy, or similar app
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Manual entry code</Label>
                  <div className="flex gap-2">
                    <Input value={totpSecret} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(totpSecret)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {setupMethod === 'sms' && !demoCode && (
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Button 
                    onClick={() => sendCode('sms')} 
                    disabled={isSendingCode || !phoneNumber}
                  >
                    {isSendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                  </Button>
                </div>
              </div>
            )}

            {demoCode && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm font-medium text-warning">Demo Mode</p>
                <p className="text-sm text-muted-foreground">
                  SMS not configured. Your code is: <span className="font-mono font-bold">{demoCode}</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupMethod(null)}>
              Cancel
            </Button>
            <Button 
              onClick={verifyCode} 
              disabled={verificationCode.length !== 6 || isVerifying}
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a secure place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
            {(backupCodes || settings?.backup_codes)?.map((code, i) => (
              <div key={i} className="p-2 bg-background rounded text-center">
                {code}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => copyToClipboard((backupCodes || settings?.backup_codes)?.join('\n') || '')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy all
            </Button>
            <Button onClick={() => setShowBackupCodes(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
