import { type FC, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Download, ArrowLeft, User, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface SharedWorkflowData {
  id: string;
  name: string;
  description: string | null;
  nodes: unknown;
  edges: unknown;
  created_at: string;
  updated_at: string;
}

const SharedWorkflow: FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<SharedWorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchWorkflow();
    }
  }, [token]);

  const fetchWorkflow = async () => {
    setIsLoading(true);
    setError(null);

    // Pass share token as header for RLS policy matching
    const { data, error } = await supabase
      .from('workflows')
      .select('id, name, description, nodes, edges, created_at, updated_at')
      .eq('share_token', token)
      .single();

    if (error || !data) {
      setError('Workflow not found or link has expired');
    } else {
      setWorkflow(data);
    }
    setIsLoading(false);
  };

  const handleImport = async () => {
    if (!workflow || !user) {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to import this workflow',
        });
        navigate('/login');
      }
      return;
    }

    setIsImporting(true);

    const { data, error } = await supabase
      .from('workflows')
      .insert([{
        user_id: user.id,
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        nodes: JSON.parse(JSON.stringify(workflow.nodes)),
        edges: JSON.parse(JSON.stringify(workflow.edges)),
        settings: {},
        is_active: false,
      }])
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Import failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Workflow imported!',
        description: 'Opening in editor...',
      });
      navigate(`/workflow/${data.id}`);
    }
    setIsImporting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Workflow Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'This workflow link is invalid or has expired.'}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nodeCount = Array.isArray(workflow.nodes) ? workflow.nodes.length : 0;
  const edgeCount = Array.isArray(workflow.edges) ? workflow.edges.length : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Shadow Flow</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl gradient-primary">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{workflow.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Shared workflow template
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {workflow.description && (
                <p className="text-muted-foreground">
                  {workflow.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-4">
                <Badge variant="secondary" className="px-3 py-1">
                  {nodeCount} nodes
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  {edgeCount} connections
                </Badge>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated {formatDate(workflow.updated_at)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1 gradient-primary text-white"
                  onClick={handleImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {user ? 'Import to My Workflows' : 'Sign In to Import'}
                </Button>
              </div>

              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  You need to sign in to import this workflow to your account
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default SharedWorkflow;
