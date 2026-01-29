import { type FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, RotateCcw, Trash2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WorkflowNode, WorkflowEdge, Workflow } from '@/types/workflow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Version {
  id: string;
  version_number: number;
  name: string;
  description: string | null;
  nodes: unknown;
  edges: unknown;
  settings: unknown;
  created_at: string;
  created_by: string;
  change_summary: string | null;
}

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId: string | null;
  currentWorkflow: Workflow | null;
  onRestore: (name: string, description: string, nodes: WorkflowNode[], edges: WorkflowEdge[], settings: Workflow['settings']) => void;
}

const VersionHistory: FC<VersionHistoryProps> = ({ 
  isOpen, 
  onClose, 
  workflowId,
  currentWorkflow,
  onRestore 
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && workflowId) {
      fetchVersions();
    }
  }, [isOpen, workflowId]);

  const fetchVersions = async () => {
    if (!workflowId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading versions',
        description: error.message,
      });
    } else {
      setVersions(data || []);
    }
    setIsLoading(false);
  };

  const handleRestore = (version: Version) => {
    const nodes = Array.isArray(version.nodes) 
      ? version.nodes as unknown as WorkflowNode[] 
      : [];
    const edges = Array.isArray(version.edges) 
      ? version.edges as unknown as WorkflowEdge[] 
      : [];
    const settings = typeof version.settings === 'object' && version.settings !== null
      ? version.settings as Workflow['settings']
      : currentWorkflow?.settings || {
          timezone: 'UTC',
          retryOnFailure: true,
          maxRetries: 3,
          errorNotification: true,
        };
    
    onRestore(version.name, version.description || '', nodes, edges, settings);
    onClose();
    
    toast({
      title: 'Version restored',
      description: `Restored to version ${version.version_number}`,
    });
  };

  const handleDelete = async () => {
    if (!versionToDelete) return;
    
    const { error } = await supabase
      .from('workflow_versions')
      .delete()
      .eq('id', versionToDelete.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error deleting version',
        description: error.message,
      });
    } else {
      toast({
        title: 'Version deleted',
        description: `Version ${versionToDelete.version_number} has been deleted`,
      });
      fetchVersions();
    }
    setVersionToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Version History</h2>
                    <p className="text-sm text-muted-foreground">
                      {versions.length} saved version{versions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Versions List */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No versions yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Versions are automatically saved when you save your workflow
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {versions.map((version, index) => {
                    const nodeCount = Array.isArray(version.nodes) ? version.nodes.length : 0;
                    
                    return (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">v{version.version_number}</Badge>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">Latest</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestore(version)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setVersionToDelete(version)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h4 className="font-medium mb-1">{version.name}</h4>
                        
                        {version.change_summary && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {version.change_summary}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(version.created_at)}
                          </span>
                          <span>{nodeCount} nodes</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!versionToDelete} onOpenChange={() => setVersionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete version {versionToDelete?.version_number}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VersionHistory;
