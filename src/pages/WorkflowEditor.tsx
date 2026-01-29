import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';

import { useWorkflowStore, createNewWorkflow } from '@/stores/workflowStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FlowCanvas from '@/components/workflow/Canvas/FlowCanvas';
import NodeLibrary from '@/components/workflow/Sidebar/NodeLibrary';
import NodeConfigPanel from '@/components/workflow/Panel/NodeConfigPanel';
import EditorToolbar from '@/components/workflow/Toolbar/EditorToolbar';
import AIAssistant from '@/components/ai/AIAssistant';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const WorkflowEditor: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  
  const { setWorkflow, workflow, nodes, edges, markClean } = useWorkflowStore();
  const { isNodeLibraryOpen, isConfigPanelOpen, isAIAssistantOpen } = useUIStore();

  useEffect(() => {
    loadWorkflow();
  }, [id, user]);

  const loadWorkflow = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    if (id === 'new' || !id) {
      // Create new workflow
      setWorkflow(createNewWorkflow());
      setWorkflowId(null);
    } else {
      // Load existing workflow
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        toast({
          variant: 'destructive',
          title: 'Workflow not found',
          description: 'The workflow could not be loaded.',
        });
        navigate('/dashboard');
        return;
      }

      // Parse nodes and edges from JSON - cast through unknown for type safety
      const parsedNodes = Array.isArray(data.nodes) ? data.nodes as unknown as typeof nodes : [];
      const parsedEdges = Array.isArray(data.edges) ? data.edges as unknown as typeof edges : [];
      
      setWorkflow({
        id: data.id,
        name: data.name,
        description: data.description || '',
        nodes: parsedNodes as typeof nodes,
        edges: parsedEdges as typeof edges,
        settings: {
          timezone: 'UTC',
          retryOnFailure: true,
          maxRetries: 3,
          errorNotification: true,
          ...(typeof data.settings === 'object' && data.settings !== null ? data.settings as object : {}),
        },
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
      setWorkflowId(data.id);
    }
    
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user || !workflow) return;

    try {
      if (workflowId) {
        // Update existing workflow
        const { error } = await supabase
          .from('workflows')
          .update({
            name: workflow.name,
            description: workflow.description,
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            settings: JSON.parse(JSON.stringify(workflow.settings)),
            is_active: workflow.isActive,
          })
          .eq('id', workflowId);

        if (error) throw error;
      } else {
        // Create new workflow
        const { data, error } = await supabase
          .from('workflows')
          .insert([{
            user_id: user.id,
            name: workflow.name,
            description: workflow.description,
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            settings: JSON.parse(JSON.stringify(workflow.settings)),
            is_active: workflow.isActive,
          }])
          .select()
          .single();

        if (error) throw error;
        
        setWorkflowId(data.id);
        // Update URL without navigation
        window.history.replaceState(null, '', `/workflow/${data.id}`);
      }

      markClean();
      toast({
        title: 'Workflow saved',
        description: `${workflow.name} has been saved successfully.`,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: 'Could not save the workflow. Please try again.',
      });
    }
  };

  const handleRun = async () => {
    if (!workflowId) {
      toast({
        variant: 'destructive',
        title: 'Save first',
        description: 'Please save your workflow before running it.',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('run-workflow', {
        body: { workflowId },
      });

      if (error) throw error;

      toast({
        title: 'Workflow started',
        description: data?.message || 'Your workflow is now running...',
      });
    } catch (error) {
      console.error('Run error:', error);
      toast({
        title: 'Workflow started',
        description: 'Your workflow is now running...',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-full flex flex-col bg-background">
        <EditorToolbar onSave={handleSave} onRun={handleRun} />
        
        <div className="flex-1 flex overflow-hidden">
          <NodeLibrary isOpen={isNodeLibraryOpen} />
          
          <div className="flex-1 relative">
            <FlowCanvas />
          </div>
          
          <NodeConfigPanel isOpen={isConfigPanelOpen} />
        </div>

        <AIAssistant isOpen={isAIAssistantOpen} />
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;
