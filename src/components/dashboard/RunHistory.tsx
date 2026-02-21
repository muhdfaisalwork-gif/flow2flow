import { type FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, Play, Loader2, ChevronDown, ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RunRecord {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  started_at: string;
  finished_at: string | null;
  error_log: string | null;
  input_data: unknown;
  output_data: unknown;
  workflow_name?: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  running: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Running' },
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Success' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' },
};

const RunHistory: FC = () => {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchRuns();
  }, [user]);

  const fetchRuns = async () => {
    if (!user) return;
    setIsLoading(true);

    // Get user's workflows first
    const { data: workflows } = await supabase
      .from('workflows')
      .select('id, name')
      .eq('user_id', user.id);

    if (!workflows || workflows.length === 0) {
      setRuns([]);
      setIsLoading(false);
      return;
    }

    const workflowIds = workflows.map(w => w.id);
    const workflowMap = Object.fromEntries(workflows.map(w => [w.id, w.name]));

    const { data, error } = await supabase
      .from('workflow_runs')
      .select('*')
      .in('workflow_id', workflowIds)
      .order('started_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setRuns(data.map(r => ({
        ...r,
        workflow_name: workflowMap[r.workflow_id] || 'Unknown',
      })));
    }
    setIsLoading(false);
  };

  const displayedRuns = showAll ? runs : runs.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Run History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No workflow runs yet. Run a workflow to see execution logs here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Run History
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {runs.filter(r => r.status === 'success').length} success
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {runs.filter(r => r.status === 'failed').length} failed
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className={showAll ? 'h-[400px]' : undefined}>
          <div className="divide-y divide-border/30">
            {displayedRuns.map((run, i) => {
              const cfg = statusConfig[run.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expandedRun === run.id;
              const duration = run.finished_at
                ? Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000)
                : null;

              return (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${cfg.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${cfg.color} ${run.status === 'running' ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{run.workflow_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(run.started_at).toLocaleString()}
                          {duration !== null && ` • ${duration}s`}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${cfg.color} border-current/20`}>
                        {cfg.label}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-2">
                          {run.error_log && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                                <pre className="text-xs text-destructive whitespace-pre-wrap font-mono">
                                  {run.error_log}
                                </pre>
                              </div>
                            </div>
                          )}
                          {run.output_data && (
                            <div className="rounded-md bg-muted/50 p-3">
                              <p className="text-xs font-medium mb-1 text-muted-foreground">Output</p>
                              <pre className="text-xs whitespace-pre-wrap font-mono max-h-32 overflow-auto">
                                {JSON.stringify(run.output_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {!run.error_log && !run.output_data && (
                            <p className="text-xs text-muted-foreground italic">No detailed logs available.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {runs.length > 5 && (
          <div className="p-3 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show less' : `Show all ${runs.length} runs`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RunHistory;
