import { type FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Zap, Plus, Trash2, Key, Loader2, CreditCard, Sparkles, LogOut } from 'lucide-react';
import { TFASettings } from '@/components/settings/TFASettings';
import {
  SAAS_PLANS,
  getStoredSubscription,
  activateLicenseKey,
  saveSubscription,
  isDemoBillingEnabled,
  type PlanTier,
} from '@/lib/billing/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { d1Api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Credential {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

const Settings: FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoadingCreds, setIsLoadingCreds] = useState(true);
  const [showAddCred, setShowAddCred] = useState(false);
  const [newCredName, setNewCredName] = useState('');
  const [newCredType, setNewCredType] = useState('api_key');
  const [newCredValue, setNewCredValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [runCount, setRunCount] = useState(14);
  const [subscription, setSubscription] = useState(getStoredSubscription());
  const [licenseKeyInput, setLicenseKeyInput] = useState('');

  const activeUser = user || {
    id: 'demo-user-001',
    email: 'demo@shadowflow.work',
    display_name: 'Demo User',
    created_at: '2026-01-01T00:00:00Z',
  };

  const handleActivateLicense = async () => {
    const res = await activateLicenseKey(licenseKeyInput);
    if (!res.valid) {
      toast({ variant: 'destructive', title: 'Invalid License Key', description: res.message });
      return;
    }
    setSubscription(getStoredSubscription());
    setLicenseKeyInput('');
    toast({ title: 'Subscription Activated!', description: res.message });
  };

  const handleResetPlan = (tier: PlanTier) => {
    saveSubscription({
      tier,
      interval: 'monthly',
      status: 'active',
      provider: tier === 'free' ? 'free' : 'lemonsqueezy',
      activatedAt: new Date().toISOString(),
    });
    setSubscription(getStoredSubscription());
    toast({ title: `Switched to ${SAAS_PLANS[tier].name}` });
  };

  useEffect(() => {
    fetchCredentials();
    fetchUsage();
  }, [user]);

  const fetchCredentials = async () => {
    setIsLoadingCreds(true);
    if (d1Api.getToken()) {
      try {
        const d1Creds = await d1Api.getCredentials();
        setCredentials(d1Creds.map(c => ({ id: c.id, name: c.name, type: c.provider, created_at: c.created_at })));
        setIsLoadingCreds(false);
        return;
      } catch {
        // fallback
      }
    }
    if (user) {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('id, name, type, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCredentials(data);
        setIsLoadingCreds(false);
        return;
      }
    }

    // Fallback to local storage for demo/offline mode
    try {
      const local = localStorage.getItem('f2f_demo_credentials');
      if (local) {
        setCredentials(JSON.parse(local));
      } else {
        const defaultCreds: Credential[] = [
          { id: 'cred-1', name: 'OpenAI Production Key', type: 'api_key', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: 'cred-2', name: 'Slack Bot OAuth Token', type: 'oauth2', created_at: new Date(Date.now() - 86400000 * 5).toISOString() }
        ];
        setCredentials(defaultCreds);
        localStorage.setItem('f2f_demo_credentials', JSON.stringify(defaultCreds));
      }
    } catch {
      // ignore
    }
    setIsLoadingCreds(false);
  };

  const fetchUsage = async () => {
    if (!user) {
      setRunCount(18);
      return;
    }
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isUuid) {
      setRunCount(18);
      return;
    }
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: workflows } = await supabase
      .from('workflows')
      .select('id')
      .eq('user_id', user.id);

    if (workflows && workflows.length > 0) {
      const { count } = await supabase
        .from('workflow_runs')
        .select('*', { count: 'exact', head: true })
        .in('workflow_id', workflows.map(w => w.id))
        .gte('started_at', startOfMonth.toISOString());

      setRunCount(count || 0);
    }
  };

  const handleAddCredential = async () => {
    if (!newCredName.trim() || !newCredValue.trim()) return;
    setIsSaving(true);

    if (d1Api.getToken()) {
      try {
        await d1Api.saveCredential(newCredType, newCredName.trim(), { value: newCredValue });
        toast({ title: 'Credential added' });
        setNewCredName('');
        setNewCredValue('');
        setShowAddCred(false);
        setIsSaving(false);
        fetchCredentials();
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast({ variant: 'destructive', title: 'Error', description: msg });
        setIsSaving(false);
        return;
      }
    }

    if (user) {
      const { error } = await supabase.from('user_credentials').insert({
        user_id: user.id,
        name: newCredName.trim(),
        type: newCredType,
        encrypted_data: { value: newCredValue },
      });

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
        setIsSaving(false);
        return;
      }
      fetchCredentials();
    } else {
      const newCred: Credential = {
        id: `cred-${Date.now()}`,
        name: newCredName.trim(),
        type: newCredType,
        created_at: new Date().toISOString(),
      };
      const updated = [newCred, ...credentials];
      setCredentials(updated);
      try {
        localStorage.setItem('f2f_demo_credentials', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    toast({ title: 'Credential added' });
    setNewCredName('');
    setNewCredValue('');
    setShowAddCred(false);
    setIsSaving(false);
  };

  const handleDeleteCredential = async (id: string) => {
    if (d1Api.getToken()) {
      try {
        await d1Api.deleteCredential(id);
        toast({ title: 'Credential deleted' });
        fetchCredentials();
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast({ variant: 'destructive', title: 'Error', description: msg });
        return;
      }
    }
    if (user) {
      const { error } = await supabase.from('user_credentials').delete().eq('id', id);
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
        return;
      }
      fetchCredentials();
    } else {
      const updated = credentials.filter(c => c.id !== id);
      setCredentials(updated);
      try {
        localStorage.setItem('f2f_demo_credentials', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    toast({ title: 'Credential deleted' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/demo"} className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Shadow Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline">{activeUser.email.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled><User className="w-4 h-4 mr-2" />{activeUser.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Link to={user ? "/dashboard" : "/demo"}>
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>
          </div>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{activeUser.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(activeUser.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Billing */}
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Subscription &amp; Plan
                  </CardTitle>
                  <CardDescription>
                    Manage your monthly plan or activate a Lemon Squeezy / Polar.sh license key
                  </CardDescription>
                </div>
                <Badge className="gradient-primary text-white border-0">
                  {SAAS_PLANS[subscription.tier].name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-lg bg-muted/40 border border-border/60">
                <div>
                  <p className="text-sm font-semibold">
                    {SAAS_PLANS[subscription.tier].name} (${SAAS_PLANS[subscription.tier].monthlyPrice}/mo)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Monthly Quota: {runCount} / {SAAS_PLANS[subscription.tier].limits.maxMonthlyRuns.toLocaleString()} runs used
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/pricing">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      View Plans
                    </Button>
                  </Link>
                  {subscription.tier !== 'free' && (
                    <Button size="sm" variant="ghost" onClick={() => handleResetPlan('free')}>
                      Downgrade
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Activate License Key{isDemoBillingEnabled() ? ' (Demo: F2F-PRO-2026-VIP)' : ''}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    placeholder="Paste your license key..."
                    className="font-mono text-xs"
                  />
                  <Button size="sm" onClick={handleActivateLicense}>
                    Activate Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>Your workflow execution statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{runCount}</p>
                  <p className="text-sm text-muted-foreground">Workflow runs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credential Vault */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" /> Credentials
                  </CardTitle>
                  <CardDescription>Manage API keys and tokens for integrations</CardDescription>
                </div>
                <Dialog open={showAddCred} onOpenChange={setShowAddCred}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Credential</DialogTitle>
                      <DialogDescription>Store an API key or token securely</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={newCredName} onChange={(e) => setNewCredName(e.target.value)} placeholder="e.g., OpenAI API Key" />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <select value={newCredType} onChange={(e) => setNewCredType(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                          <option value="api_key">API Key</option>
                          <option value="oauth_token">OAuth Token</option>
                          <option value="smtp">SMTP Credentials</option>
                          <option value="webhook_secret">Webhook Secret</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input type="password" value={newCredValue} onChange={(e) => setNewCredValue(e.target.value)} placeholder="sk-..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddCred(false)}>Cancel</Button>
                      <Button onClick={handleAddCredential} disabled={isSaving || !newCredName.trim() || !newCredValue.trim()}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCreds ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
              ) : credentials.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No credentials stored yet. Add API keys for integrations like Slack, Email, etc.</p>
              ) : (
                <div className="space-y-2">
                  {credentials.map((cred) => (
                    <div key={cred.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{cred.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{cred.type}</Badge>
                            <span className="text-xs text-muted-foreground">Added {new Date(cred.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCredential(cred.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2FA Settings */}
          <TFASettings />
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
