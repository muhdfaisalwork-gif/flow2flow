import { type FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';

import { useWorkflowStore, createNewWorkflow } from '@/stores/workflowStore';
import { useUIStore } from '@/stores/uiStore';
import FlowCanvas from '@/components/workflow/Canvas/FlowCanvas';
import NodeLibrary from '@/components/workflow/Sidebar/NodeLibrary';
import NodeConfigPanel from '@/components/workflow/Panel/NodeConfigPanel';
import EditorToolbar from '@/components/workflow/Toolbar/EditorToolbar';
import AIAssistant from '@/components/ai/AIAssistant';
import { useToast } from '@/hooks/use-toast';

const WorkflowEditor: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const { setWorkflow, workflow } = useWorkflowStore();
  const { isNodeLibraryOpen, isConfigPanelOpen, isAIAssistantOpen } = useUIStore();

  useEffect(() => {
    // Load workflow or create new one
    if (id === 'new' || !id) {
      setWorkflow(createNewWorkflow());
    } else {
      // TODO: Load from database
      setWorkflow(createNewWorkflow());
    }
  }, [id, setWorkflow]);

  const handleSave = () => {
    // TODO: Save to database
    toast({
      title: 'Workflow saved',
      description: `${workflow?.name} has been saved successfully.`,
    });
  };

  const handleRun = () => {
    toast({
      title: 'Workflow started',
      description: 'Your workflow is now running...',
    });
  };

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
