import { type FC, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Play, MoreVertical, 
  Zap, Clock, CheckCircle,
  LogOut, User, Loader2, Trash2, Settings, Sparkles, Wand2, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { d1Api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import RunHistory from '@/components/dashboard/RunHistory';
import { DemoBanner } from '@/components/demo/DemoBanner';

interface WorkflowFromDB {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  updated_at: string;
  nodes: unknown;
}

const WORKFLOWS_PER_PAGE = 12;

const Dashboard: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [workflows, setWorkflows] = useState<WorkflowFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user, signOut } = useAuth();
  const demo = useDemo();
  const { toast } = useToast();
  const navigate = useNavigate();

  const linkPrefix = demo ? '/demo' : '';

  const handleBuildWithAI = (promptText?: string) => {
    const text = (promptText || aiPrompt).trim();
    if (!text) {
      navigate(`${linkPrefix}/workflow/new?openCopilot=true`);
      return;
    }
    navigate(`${linkPrefix}/workflow/new?prompt=${encodeURIComponent(text)}`);
  };

  useEffect(() => {
    if (demo) {
      setWorkflows(demo.workflows.map(w => ({
        id: w.id, name: w.name, description: w.description, is_active: w.is_active, updated_at: w.updated_at, nodes: w.nodes,
      })));
      setIsLoading(false);
      return;
    }
    fetchWorkflows();
  }, [user, demo]);

  const fetchWorkflows = async () => {
    if (!user) return;
    setIsLoading(true);

    if (d1Api.getToken()) {
      try {
        const d1Workflows = await d1Api.getWorkflows();
        setWorkflows(d1Workflows as unknown as WorkflowFromDB[]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast({ variant: 'destructive', title: 'Error loading workflows', description: msg });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('id, name, description, is_active, updated_at, nodes')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error loading workflows', description: error.message });
    } else {
      setWorkflows(data || []);
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => { if (demo) { navigate('/'); return; } await signOut(); navigate('/'); };

  const handleDeleteWorkflow = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (demo) {
      toast({ title: 'Demo mode', description: 'Sign up to manage workflows.' });
      return;
    }

    if (d1Api.getToken()) {
      try {
        await d1Api.deleteWorkflow(id);
        toast({ title: 'Workflow deleted', description: 'The workflow has been removed from Cloudflare D1.' });
        fetchWorkflows();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast({ variant: 'destructive', title: 'Error deleting workflow', description: msg });
      }
      return;
    }

    const { error } = await supabase.from('workflows').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error deleting workflow', description: error.message });
    } else {
      toast({ title: 'Workflow deleted', description: 'The workflow has been removed.' });
      fetchWorkflows();
    }
  };

  const filteredWorkflows = useMemo(() => workflows.filter(
    (w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  ), [workflows, searchQuery]);

  const totalPages = Math.ceil(filteredWorkflows.length / WORKFLOWS_PER_PAGE);
  const paginatedWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * WORKFLOWS_PER_PAGE,
    currentPage * WORKFLOWS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const stats = [
    { label: 'Total Workflows', value: workflows.length, icon: Zap },
    { label: 'Active', value: workflows.filter((w) => w.is_active).length, icon: CheckCircle },
    { label: 'Draft', value: workflows.filter((w) => !w.is_active).length, icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background">
      {demo && <DemoBanner />}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary"><Zap className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-lg">Shadow Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                  <span className="hidden sm:inline">{demo ? demo.demoUser.display_name : user?.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled><User className="w-4 h-4 mr-2" />{demo ? demo.demoUser.email : user?.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Workflows</h1>
            <p className="text-muted-foreground mt-1">Create and manage your automation workflows</p>
          </div>
          <Link to={`${linkPrefix}/workflow/new`}>
            <Button className="gradient-primary text-white gap-2"><Plus className="w-4 h-4" />New Workflow</Button>
          </Link>
        </div>

        {/* AI Workflow Builder Prompt Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 sm:p-6 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Build Workflow with AI Chat
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/40 text-primary bg-primary/10">
                    Copilot
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Describe what you want to automate in plain English. The AI Copilot builds nodes, sets up triggers, and wires connections.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBuildWithAI()}
              className="gap-1.5 text-xs self-start md:self-auto border-primary/30 hover:bg-primary/10"
            >
              <Bot className="w-3.5 h-3.5 text-primary" />
              Open Copilot Chat
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBuildWithAI();
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Wand2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. When a Stripe webhook arrives, filter amount > 100, summarize with AI, and alert Activepieces Slack..."
                className="pl-10 h-11 bg-background/80 border-border/70 text-sm focus-visible:ring-primary shadow-inner"
              />
            </div>
            <Button
              type="submit"
              className="gradient-primary text-white h-11 px-6 gap-2 text-sm font-medium shadow-md hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Generate Workflow
            </Button>
          </form>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
            <span className="text-muted-foreground text-[11px] font-medium">Quick Prompts:</span>
            {[
              'Stripe webhook -> Activepieces Slack alert',
              'Connect MCP Server tool to process tickets',
              'Daily Google Sheets sync to PostgreSQL',
              'AI Deep Research with Firecrawl & Claude',
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setAiPrompt(suggestion);
                  handleBuildWithAI(suggestion);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-background/60 hover:bg-primary/20 hover:text-primary border border-border/60 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/50 bg-card/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-2 rounded-lg bg-primary/10"><stat.icon className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search workflows..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 max-w-md" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredWorkflows.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{searchQuery ? 'No workflows found' : 'No workflows yet'}</h3>
              <p className="text-muted-foreground text-center mb-4">{searchQuery ? 'Try a different search term' : 'Create your first workflow to get started'}</p>
              {!searchQuery && (
                <Link to={`${linkPrefix}/workflow/new`}><Button className="gap-2"><Plus className="w-4 h-4" />Create Workflow</Button></Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedWorkflows.map((workflow, i) => (
                <motion.div key={workflow.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`${linkPrefix}/workflow/${workflow.id}`}>
                    <Card className="border-border/50 bg-card/50 hover:border-primary/50 transition-colors cursor-pointer group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{workflow.name}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">{workflow.description || 'No description'}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Play className="w-4 h-4 mr-2" />Run</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => handleDeleteWorkflow(workflow.id, e as unknown as React.MouseEvent)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant={workflow.is_active ? 'default' : 'secondary'}>{workflow.is_active ? 'Active' : 'Draft'}</Badge>
                          <span className="text-xs text-muted-foreground">{Array.isArray(workflow.nodes) ? workflow.nodes.length : 0} nodes</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Updated {new Date(workflow.updated_at).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
              </div>
            )}
          </>
        )}

        <div className="mt-8">
          <RunHistory />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
