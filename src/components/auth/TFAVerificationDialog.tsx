import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TFAMethod } from '@/types/tfa';

interface TFAVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  method: TFAMethod;
  userId: string;
}

export function TFAVerificationDialog({ 
  open, 
  onClose, 
  onVerified, 
  method,
  userId 
}: TFAVerificationDialogProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const { toast } = useToast();

  const sendCode = async () => {
    if (method === 'totp') return;
    
    setIsSendingCode(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.functions.invoke('tfa-send-code', {
        body: { method },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      toast({
        title: 'Code sent',
        description: `Verification code sent via ${method}`,
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
    setIsVerifying(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('tfa-verify', {
        body: { code, method },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      if (response.error) throw response.error;
      
      if (response.data.valid) {
        onVerified();
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid code',
          description: 'Please check your code and try again',
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

  const methodLabels = {
    totp: 'your authenticator app',
    email: 'your email',
    sms: 'SMS',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <DialogTitle>Two-Factor Authentication</DialogTitle>
          </div>
          <DialogDescription>
            Enter the verification code from {methodLabels[method]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {method !== 'totp' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={sendCode}
              disabled={isSendingCode}
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send code to ${method}`
              )}
            </Button>
          )}

          <div className="space-y-2">
            <Label>Verification Code</Label>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can also use a backup code
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={verifyCode} 
            disabled={code.length < 6 || isVerifying}
          >
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
