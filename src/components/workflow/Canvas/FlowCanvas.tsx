import { useCallback, useRef, type FC, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type ReactFlowInstance,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '@/stores/workflowStore';
import { useUIStore } from '@/stores/uiStore';
import { getNodeDefinition } from '@/lib/nodes/definitions';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import type { WorkflowNode, WorkflowNodeData } from '@/types/workflow';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface FlowCanvasProps {
  onSave?: () => void;
}

const FlowCanvas: FC<FlowCanvasProps> = ({ onSave }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useWorkflowStore();
  const { selectNode, setZoom } = useUIStore();

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance.current || !reactFlowWrapper.current) {
        return;
      }

      const definition = getNodeDefinition(type);
      if (!definition) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: WorkflowNode = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: definition.label,
          type: definition.type,
          category: definition.category,
          icon: definition.icon,
          color: definition.color,
          config: { ...definition.defaultData },
          isConfigured: false,
        } as WorkflowNodeData,
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onMoveEnd = useCallback(
    (_: unknown, viewport: { zoom: number }) => {
      setZoom(viewport.zoom);
    },
    [setZoom]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
        }}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-background"
      >
        <Background 
          color="hsl(var(--muted-foreground))" 
          gap={20} 
          size={1}
          className="opacity-30"
        />
        <Controls 
          className="!bg-card !border-border !rounded-lg !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        />
        <MiniMap 
          className="!bg-card !border-border !rounded-lg"
          nodeColor={(node) => (node.data as WorkflowNodeData)?.color || 'hsl(var(--primary))'}
          maskColor="hsl(var(--background) / 0.8)"
        />
        <Panel position="top-right" className="flex gap-2">
          {onSave && (
            <button
              onClick={onSave}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;
