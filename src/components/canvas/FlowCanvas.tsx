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
import {
  LayoutGrid,
  ShieldCheck,
  Terminal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  Slash,
} from 'lucide-react';

import { useWorkflowStore } from '@/lib/store';
import { useUIStore } from '@/stores/uiStore';
import { getNodeDefinition } from '@/lib/nodes/definitions';
import CustomNode from '@/components/canvas/CustomNode';
import CustomEdge from '@/components/workflow/Canvas/CustomEdge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    autoLayout,
    repairGraph,
    resetExecutionState,
    executionLogs,
    lastExecutionSummary,
    isTelemetryConsoleOpen,
    setTelemetryConsoleOpen,
    missingCredentials,
  } = useWorkflowStore();

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

      const isBranching =
        definition.type === 'if-else' ||
        definition.type === 'filter' ||
        definition.type === 'switch';

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
          isConfigured: true,
          executionStatus: 'idle',
          outputs: isBranching
            ? [
                { id: 'output_0', label: 'True / Main', type: 'main', index: 0 },
                { id: 'output_1', label: 'False / Alt', type: 'main', index: 1 },
              ]
            : [{ id: 'output_0', label: 'Main', type: 'main', index: 0 }],
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

  const handleAutoLayout = () => {
    autoLayout();
    setTimeout(() => {
      reactFlowInstance.current?.fitView({ padding: 0.2, duration: 300 });
    }, 50);
    toast({
      title: 'Topological Auto-Layout Applied',
      description: "Aligned nodes onto Kahn's 320px × 150px coordinate grid.",
    });
  };

  const handleSelfHeal = () => {
    const repairs = repairGraph();
    setTimeout(() => {
      reactFlowInstance.current?.fitView({ padding: 0.2, duration: 300 });
    }, 50);
    toast({
      title: 'Graph Validated & Self-Healed',
      description: repairs.join(' '),
    });
  };

  const unconfiguredCreds = missingCredentials.filter((c) => !c.isConfigured);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative flex flex-col">
      {/* Missing Credentials Dependency Banner */}
      {unconfiguredCreds.length > 0 && (
        <div className="z-20 bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-medium text-amber-500">
              Missing Credentials Detected ({unconfiguredCreds.length}):
            </span>
            {unconfiguredCreds.slice(0, 5).map((cred) => (
              <Badge
                key={cred.envVarName}
                variant="outline"
                className="font-mono text-[10px] border-amber-500/40 text-amber-400"
              >
                {cred.envVarName} ({cred.service})
              </Badge>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground hidden md:inline">
            Sandboxed runner will simulate missing secrets safely
          </span>
        </div>
      )}

      <div className="flex-1 relative">
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
          <Controls className="!bg-card !border-border !rounded-lg !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" />
          <MiniMap
            className="!bg-card !border-border !rounded-lg"
            nodeColor={(node) => (node.data as WorkflowNodeData)?.color || 'hsl(var(--primary))'}
            maskColor="hsl(var(--background) / 0.8)"
          />

          {/* Top-Right Canvas Action Pills */}
          <Panel position="top-right" className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAutoLayout}
              className="h-8 text-xs gap-1.5 shadow-sm border border-border/60 bg-card/90 backdrop-blur"
              title="Kahn's Topological Auto-Layout (320px × 150px)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              Auto-Layout
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSelfHeal}
              className="h-8 text-xs gap-1.5 shadow-sm border border-border/60 bg-card/90 backdrop-blur"
              title="Validate & Self-Heal Graph Topology"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Self-Heal
            </Button>
            {executionLogs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetExecutionState}
                className="h-8 text-xs gap-1 bg-card/90 border border-border/60"
                title="Reset Execution Telemetry"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
            )}
            {onSave && (
              <Button onClick={onSave} size="sm" className="h-8 text-xs">
                Save
              </Button>
            )}
          </Panel>
        </ReactFlow>
      </div>

      {/* Live Execution Telemetry Console Drawer */}
      {(executionLogs.length > 0 || isTelemetryConsoleOpen) && (
        <div className="border-t border-border bg-card/95 backdrop-blur-md z-20 transition-all">
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer border-b border-border/50"
            onClick={() => setTelemetryConsoleOpen(!isTelemetryConsoleOpen)}
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold">
                Sandboxed Task Runner Telemetry
              </span>
              {lastExecutionSummary && (
                <Badge
                  variant={lastExecutionSummary.success ? 'default' : 'destructive'}
                  className="text-[10px] h-5"
                >
                  {lastExecutionSummary.success
                    ? `Success • ${lastExecutionSummary.totalDurationMs}ms`
                    : 'Execution Error'}
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground font-mono">
                ({executionLogs.length} events)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setTelemetryConsoleOpen(!isTelemetryConsoleOpen);
                }}
              >
                {isTelemetryConsoleOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isTelemetryConsoleOpen && (
            <div className="max-h-44 overflow-y-auto p-3 space-y-1.5 font-mono text-xs bg-background/60">
              {executionLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 px-2.5 py-1 rounded bg-card/60 border border-border/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {log.status === 'running' && (
                      <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                    )}
                    {log.status === 'success' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    {log.status === 'skipped' && (
                      <Slash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    {log.status === 'error' && (
                      <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                    )}
                    <span className="font-semibold text-foreground shrink-0">
                      [{log.nodeLabel}]
                    </span>
                    <span className="text-muted-foreground truncate">
                      {log.message}
                    </span>
                  </div>
                  {log.durationMs !== undefined && (
                    <span className="text-[10px] text-emerald-400 shrink-0">
                      {log.durationMs}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlowCanvas;
