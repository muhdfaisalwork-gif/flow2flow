import { type FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';

import { useWorkflowStore, createNewWorkflow } from '@/stores/workflowStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { d1Api } from '@/lib/api';
import FlowCanvas from '@/components/workflow/Canvas/FlowCanvas';
import NodeLibrary from '@/components/workflow/Sidebar/NodeLibrary';
import NodeConfigPanel from '@/components/workflow/Panel/NodeConfigPanel';
import EditorToolbar from '@/components/workflow/Toolbar/EditorToolbar';
import AIAssistant from '@/components/ai/AIAssistant';
import TemplatesGallery from '@/components/workflow/TemplatesGallery';
import ShareDialog from '@/components/workflow/ShareDialog';
import VersionHistory from '@/components/workflow/VersionHistory';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { WorkflowNode, WorkflowEdge, Workflow } from '@/types/workflow';

const WorkflowEditor: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const demo = useDemo();
  const [isLoading, setIsLoading] = useState(true);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  
  // Dialog states
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  
  const { setWorkflow, workflow, nodes, edges, markClean, updateWorkflowMeta } = useWorkflowStore();
  const { isNodeLibraryOpen, isConfigPanelOpen, isAIAssistantOpen } = useUIStore();

  useEffect(() => {
    loadWorkflow();
  }, [id, user]);

  const loadWorkflow = async () => {
    if (demo) {
      if (id && id !== 'new') {
        const foundDemo = demo.workflows.find((w) => w.id === id);
        if (foundDemo) {
          setWorkflow({
            ...createNewWorkflow(),
            id: foundDemo.id,
            name: foundDemo.name,
            description: foundDemo.description,
            nodes: foundDemo.nodes,
            edges: foundDemo.edges,
            isActive: foundDemo.is_active,
          });
          setWorkflowId(foundDemo.id);
          setIsLoading(false);
          return;
        }
      }
      setWorkflow(createNewWorkflow());
      setWorkflowId(null);
      setIsLoading(false);
      return;
    }
    if (!user) return;
    
    setIsLoading(true);
    
    if (id === 'new' || !id) {
      // Create new workflow
      setWorkflow(createNewWorkflow());
      setWorkflowId(null);
      setShareToken(null);
      setIsPublic(false);
    } else {
      // Load existing workflow
      interface LoadedWorkflow {
        id: string;
        name: string;
        description?: string | null;
        nodes?: unknown;
        edges?: unknown;
        settings?: unknown;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        share_token?: string | null;
        is_public?: boolean;
      }

      let data: LoadedWorkflow | null = null;
      if (d1Api.getToken()) {
        try {
          const d1Wf = await d1Api.getWorkflow(id);
          data = {
            id: d1Wf.id,
            name: d1Wf.name,
            description: d1Wf.description,
            nodes: d1Wf.nodes,
            edges: d1Wf.edges,
            settings: d1Wf.settings,
            is_active: d1Wf.is_active,
            created_at: d1Wf.created_at,
            updated_at: d1Wf.updated_at,
            share_token: null,
            is_public: false,
          };
        } catch {
          data = null;
        }
      }

      if (!data) {
        const { data: sbData } = await supabase
          .from('workflows')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        if (sbData) {
          data = sbData as LoadedWorkflow;
        }
      }

      if (!data) {
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
      setShareToken(data.share_token || null);
      setIsPublic(data.is_public || false);
    }
    
    setIsLoading(false);
  };

  const saveVersion = async (wfId: string) => {
    if (!user || !workflow) return;

    // Get the latest version number
    const { data: versions } = await supabase
      .from('workflow_versions')
      .select('version_number')
      .eq('workflow_id', wfId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Save version
    await supabase
      .from('workflow_versions')
      .insert([{
        workflow_id: wfId,
        version_number: nextVersion,
        name: workflow.name,
        description: workflow.description,
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        settings: JSON.parse(JSON.stringify(workflow.settings)),
        created_by: user.id,
        change_summary: `Saved at ${new Date().toLocaleTimeString()}`,
      }]);
  };

  const handleSave = async () => {
    if (demo) {
      toast({ title: 'Demo mode', description: 'Sign up to save workflows.' });
      return;
    }
    if (!user || !workflow) return;

    try {
      if (d1Api.getToken()) {
        if (workflowId) {
          await d1Api.updateWorkflow(workflowId, {
            name: workflow.name,
            description: workflow.description,
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            settings: JSON.parse(JSON.stringify(workflow.settings)),
            is_active: workflow.isActive,
            change_summary: `Saved at ${new Date().toLocaleTimeString()}`,
          });
        } else {
          const created = await d1Api.createWorkflow({
            name: workflow.name,
            description: workflow.description,
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            settings: JSON.parse(JSON.stringify(workflow.settings)),
            is_active: workflow.isActive,
          });
          setWorkflowId(created.id);
          window.history.replaceState(null, '', `/workflow/${created.id}`);
        }
        markClean();
        toast({
          title: 'Workflow saved',
          description: `${workflow.name} has been saved successfully to Cloudflare D1.`,
        });
        return;
      }

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
        
        // Save version
        await saveVersion(workflowId);
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
        
        // Save initial version
        await saveVersion(data.id);
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
    if (demo || !workflowId) {
      return;
    }

    try {
      await supabase.functions.invoke('run-workflow', {
        body: { workflowId },
      });
    } catch (error) {
      console.error('Background run sync error:', error);
    }
  };

  const handleTemplateImport = (name: string, description: string, templateNodes: WorkflowNode[], templateEdges: WorkflowEdge[]) => {
    setWorkflow({
      ...createNewWorkflow(),
      name,
      description,
      nodes: templateNodes,
      edges: templateEdges,
    });
    setWorkflowId(null);
    window.history.replaceState(null, '', '/workflow/new');
  };

  const handleShareUpdate = (newToken: string | null, newIsPublic: boolean) => {
    setShareToken(newToken);
    setIsPublic(newIsPublic);
  };

  const handleVersionRestore = (name: string, description: string, versionNodes: WorkflowNode[], versionEdges: WorkflowEdge[], settings: Workflow['settings']) => {
    if (!workflow) return;
    
    setWorkflow({
      ...workflow,
      name,
      description,
      nodes: versionNodes,
      edges: versionEdges,
      settings,
    });
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
        <EditorToolbar 
          onSave={handleSave} 
          onRun={handleRun}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenVersions={() => setIsVersionsOpen(true)}
          workflowId={workflowId}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <NodeLibrary isOpen={isNodeLibraryOpen} />
          
          <div className="flex-1 relative">
            <FlowCanvas />
          </div>
          
          <NodeConfigPanel isOpen={isConfigPanelOpen} />
        </div>

        <AIAssistant isOpen={isAIAssistantOpen} />
        
        {/* Dialogs */}
        <TemplatesGallery 
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          onImport={handleTemplateImport}
        />
        
        <ShareDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          workflowId={workflowId}
          workflowName={workflow?.name || 'Untitled Workflow'}
          currentShareToken={shareToken}
          isPublic={isPublic}
          onUpdate={handleShareUpdate}
        />
        
        <VersionHistory
          isOpen={isVersionsOpen}
          onClose={() => setIsVersionsOpen(false)}
          workflowId={workflowId}
          currentWorkflow={workflow}
          onRestore={handleVersionRestore}
        />
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;
