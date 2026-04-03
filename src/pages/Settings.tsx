import { type FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Zap, Plus, Trash2, Key, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TFASettings } from '@/components/settings/TFASettings';
import { useAuth } from '@/contexts/AuthContext';
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
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCredentials();
      fetchUsage();
    }
  }, [user]);

  const fetchCredentials = async () => {
    setIsLoadingCreds(true);
    const { data, error } = await supabase
      .from('user_credentials')
      .select('id, name, type, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) setCredentials(data);
    setIsLoadingCreds(false);
  };

  const fetchUsage = async () => {
    if (!user) return;
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
    if (!user || !newCredName.trim() || !newCredValue.trim()) return;
    setIsSaving(true);

    const { error } = await supabase.from('user_credentials').insert({
      user_id: user.id,
      name: newCredName.trim(),
      type: newCredType,
      encrypted_data: { value: newCredValue },
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Credential added' });
      setNewCredName('');
      setNewCredValue('');
      setShowAddCred(false);
      fetchCredentials();
    }
    setIsSaving(false);
  };

  const handleDeleteCredential = async (id: string) => {
    const { error } = await supabase.from('user_credentials').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Credential deleted' });
      fetchCredentials();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Flow2Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled><User className="w-4 h-4 mr-2" />{user?.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard">
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
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
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
