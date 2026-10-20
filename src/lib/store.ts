import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type {
  WorkflowNode,
  WorkflowEdge,
  Workflow,
  WorkflowSettings,
  CredentialDependency,
  ExecutionLogEntry,
  NodeExecutionStatus,
} from '@/types/workflow';
import { autoLayoutWorkflow } from '@/lib/importer/n8nAdapter';
import { validateAndRepairWorkflow } from '@/lib/copilot/aiEngine';
import { executeWorkflowDAG, type WorkflowExecutionSummary } from '@/lib/runtime/executionEngine';

export interface WorkflowState {
  // Current workflow & graph topology
  workflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isDirty: boolean;

  // Credentials & Environment
  missingCredentials: CredentialDependency[];
  envSecrets: Record<string, string>;

  // Sandboxed Task Runner & Telemetry State
  isRunning: boolean;
  executionLogs: ExecutionLogEntry[];
  lastExecutionSummary: WorkflowExecutionSummary | null;
  isTelemetryConsoleOpen: boolean;

  // Modal & Drawer States
  isImportModalOpen: boolean;
  isTemplateHubOpen: boolean;
  isCopilotOpen: boolean;

  // Core Graph Actions
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

  // Advanced Blueprint Engine Actions
  autoLayout: () => void;
  repairGraph: () => string[];
  runWorkflowSandboxed: (initialInput?: Record<string, unknown>) => Promise<WorkflowExecutionSummary>;
  resetExecutionState: () => void;
  setMissingCredentials: (creds: CredentialDependency[]) => void;
  setEnvSecret: (key: string, value: string) => void;
  setTelemetryConsoleOpen: (open: boolean) => void;
  setImportModalOpen: (open: boolean) => void;
  setTemplateHubOpen: (open: boolean) => void;
  setCopilotOpen: (open: boolean) => void;
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
      missingCredentials: [],
      envSecrets: {},
      isRunning: false,
      executionLogs: [],
      lastExecutionSummary: null,
      isTelemetryConsoleOpen: false,
      isImportModalOpen: false,
      isTemplateHubOpen: false,
      isCopilotOpen: false,

      setWorkflow: (workflow) =>
        set({
          workflow,
          nodes: workflow.nodes,
          edges: workflow.edges,
          missingCredentials: workflow.missingCredentials || [],
          isDirty: false,
          executionLogs: [],
          lastExecutionSummary: null,
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
        const isFalseHandle =
          connection.sourceHandle === 'output_1' || connection.sourceHandle === 'false';
        set({
          edges: addEdge(
            {
              ...connection,
              sourceHandle: connection.sourceHandle || 'output_0',
              type: 'custom',
              animated: true,
              label: isFalseHandle ? 'False' : undefined,
              style: {
                stroke: isFalseHandle ? '#EF4444' : 'hsl(var(--electric))',
                strokeWidth: 2,
              },
            },
            get().edges
          ),
          isDirty: true,
        });
      },

      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
          isDirty: true,
        })),

      updateNode: (nodeId, data) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
          ),
          isDirty: true,
        })),

      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
          isDirty: true,
        })),

      updateWorkflowMeta: (meta) =>
        set((state) => ({
          workflow: state.workflow
            ? { ...state.workflow, ...meta, updatedAt: new Date().toISOString() }
            : null,
          isDirty: true,
        })),

      clearWorkflow: () =>
        set({
          workflow: null,
          nodes: [],
          edges: [],
          missingCredentials: [],
          executionLogs: [],
          lastExecutionSummary: null,
          isDirty: false,
        }),

      markClean: () => set({ isDirty: false }),

      autoLayout: () => {
        const { nodes, edges } = get();
        const layouted = autoLayoutWorkflow(nodes, edges);
        set({ nodes: layouted, isDirty: true });
      },

      repairGraph: () => {
        const { nodes, edges } = get();
        const report = validateAndRepairWorkflow(nodes, edges);
        set({
          nodes: report.nodes,
          edges: report.edges,
          isDirty: true,
        });
        return report.repairsApplied;
      },

      resetExecutionState: () => {
        set((state) => ({
          isRunning: false,
          executionLogs: [],
          lastExecutionSummary: null,
          nodes: state.nodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              executionStatus: 'idle' as NodeExecutionStatus,
              executionDurationMs: undefined,
              executionOutput: undefined,
              executionError: undefined,
            },
          })),
        }));
      },

      runWorkflowSandboxed: async (initialInput) => {
        const { nodes, edges, envSecrets } = get();

        set((state) => ({
          isRunning: true,
          isTelemetryConsoleOpen: true,
          executionLogs: [],
          nodes: state.nodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              executionStatus: 'queued' as NodeExecutionStatus,
              executionDurationMs: undefined,
              executionOutput: undefined,
              executionError: undefined,
            },
          })),
        }));

        const summary = await executeWorkflowDAG(nodes, edges, {
          initialInput,
          env: envSecrets,
          stepDelayMs: 120,
          onNodeStatusChange: ({ nodeId, status, durationMs, output, error }) => {
            set((state) => ({
              nodes: state.nodes.map((n) =>
                n.id === nodeId
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        executionStatus: status,
                        executionDurationMs: durationMs ?? n.data.executionDurationMs,
                        executionOutput: output ?? n.data.executionOutput,
                        executionError: error,
                      },
                    }
                  : n
              ),
            }));
          },
          onLogEntry: (entry) => {
            set((state) => ({
              executionLogs: [...state.executionLogs, entry],
            }));
          },
        });

        set({
          isRunning: false,
          lastExecutionSummary: summary,
        });

        return summary;
      },

      setMissingCredentials: (creds) => set({ missingCredentials: creds }),

      setEnvSecret: (key, value) =>
        set((state) => {
          const nextSecrets = { ...state.envSecrets, [key]: value };
          const nextCreds = state.missingCredentials.map((c) =>
            c.envVarName === key ? { ...c, isConfigured: Boolean(value.trim()) } : c
          );
          return { envSecrets: nextSecrets, missingCredentials: nextCreds };
        }),

      setTelemetryConsoleOpen: (open) => set({ isTelemetryConsoleOpen: open }),
      setImportModalOpen: (open) => set({ isImportModalOpen: open }),
      setTemplateHubOpen: (open) => set({ isTemplateHubOpen: open }),
      setCopilotOpen: (open) => set({ isCopilotOpen: open }),
    }),
    { name: 'workflow-store' }
  )
);

export const useFlowStore = useWorkflowStore;

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
