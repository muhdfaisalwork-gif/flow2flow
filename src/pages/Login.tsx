import { type FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Loader2, ArrowLeft, Shield, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 2FA Challenge state
  const [require2FA, setRequire2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [tfaMode, setTfaMode] = useState<'totp' | 'backup'>('totp');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const { signIn, complete2FA } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In failed',
        description: error.message,
      });
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn(email, password);
    
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: result.error.message,
      });
      setIsLoading(false);
    } else if (result.require2FA && result.tempToken) {
      setTempToken(result.tempToken);
      setRequire2FA(true);
      setIsLoading(false);
      toast({
        title: 'Two-Factor Authentication required',
        description: 'Please enter your authentication code or a backup code.',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken || !twoFactorCode.trim()) return;
    setIsVerifying2FA(true);

    const { error } = await complete2FA(tempToken, twoFactorCode.trim());

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: error.message,
      });
      setIsVerifying2FA(false);
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Two-factor authentication successful.',
      });
      navigate('/dashboard');
    }
  };

  const handleResetToLogin = () => {
    setRequire2FA(false);
    setTempToken(null);
    setTwoFactorCode('');
    setTfaMode('totp');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          {require2FA ? (
            // 2FA Challenge View
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl gradient-primary">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  {tfaMode === 'totp'
                    ? 'Enter the 6-digit code from your authenticator app.'
                    : 'Enter one of your single-use backup recovery codes.'}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handle2FASubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tfaCode">
                      {tfaMode === 'totp' ? 'Authenticator Code' : 'Backup Code'}
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="tfaCode"
                        type="text"
                        autoFocus
                        placeholder={tfaMode === 'totp' ? '000000' : 'A1B2C3D4'}
                        value={twoFactorCode}
                        onChange={(e) => {
                          if (tfaMode === 'totp') {
                            setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          } else {
                            setTwoFactorCode(e.target.value.trim().toUpperCase());
                          }
                        }}
                        maxLength={tfaMode === 'totp' ? 6 : 16}
                        className="pl-10 text-center tracking-widest font-mono text-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setTfaMode(tfaMode === 'totp' ? 'backup' : 'totp');
                        setTwoFactorCode('');
                      }}
                    >
                      {tfaMode === 'totp'
                        ? 'Having trouble? Use a backup code instead'
                        : 'Use authenticator app code instead'}
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full gradient-primary text-white"
                    disabled={
                      isVerifying2FA ||
                      (tfaMode === 'totp' ? twoFactorCode.length !== 6 : twoFactorCode.length < 6)
                    }
                  >
                    {isVerifying2FA ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground"
                    onClick={handleResetToLogin}
                  >
                    Cancel and return to login
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : (
            // Standard Login View
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl gradient-primary">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your Shadow Flow account
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full gradient-primary text-white"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>

                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </Button>

                  <div className="text-center space-y-2">
                    <Link to="/reset-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Forgot your password?
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-primary hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
