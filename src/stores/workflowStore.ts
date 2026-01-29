import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WorkflowNode, WorkflowEdge, Workflow, WorkflowSettings } from '@/types/workflow';
import { addEdge, applyNodeChanges, applyEdgeChanges, type Connection, type NodeChange, type EdgeChange } from '@xyflow/react';

interface WorkflowState {
  // Current workflow
  workflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isDirty: boolean;
  
  // Actions
  setWorkflow: (workflow: Workflow) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  removeNode: (nodeId: string) => void;
  updateWorkflowMeta: (meta: Partial<Pick<Workflow, 'name' | 'description' | 'settings'>>) => void;
  clearWorkflow: () => void;
  markClean: () => void;
}

const defaultSettings: WorkflowSettings = {
  timezone: 'UTC',
  retryOnFailure: true,
  maxRetries: 3,
  errorNotification: true,
};

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      workflow: null,
      nodes: [],
      edges: [],
      isDirty: false,

      setWorkflow: (workflow) => set({ 
        workflow, 
        nodes: workflow.nodes, 
        edges: workflow.edges,
        isDirty: false 
      }),

      setNodes: (nodes) => set({ nodes, isDirty: true }),
      
      setEdges: (edges) => set({ edges, isDirty: true }),

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
          isDirty: true,
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
          isDirty: true,
        });
      },

      onConnect: (connection) => {
        set({
          edges: addEdge(
            { 
              ...connection, 
              animated: true,
              style: { stroke: 'hsl(var(--electric))', strokeWidth: 2 }
            }, 
            get().edges
          ),
          isDirty: true,
        });
      },

      addNode: (node) => set((state) => ({ 
        nodes: [...state.nodes, node],
        isDirty: true,
      })),

      updateNode: (nodeId, data) => set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        ),
        isDirty: true,
      })),

      removeNode: (nodeId) => set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        isDirty: true,
      })),

      updateWorkflowMeta: (meta) => set((state) => ({
        workflow: state.workflow 
          ? { ...state.workflow, ...meta, updatedAt: new Date().toISOString() }
          : null,
        isDirty: true,
      })),

      clearWorkflow: () => set({
        workflow: null,
        nodes: [],
        edges: [],
        isDirty: false,
      }),

      markClean: () => set({ isDirty: false }),
    }),
    { name: 'workflow-store' }
  )
);

// Helper to create a new empty workflow
export const createNewWorkflow = (): Workflow => ({
  id: crypto.randomUUID(),
  name: 'Untitled Workflow',
  description: '',
  nodes: [],
  edges: [],
  settings: defaultSettings,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
