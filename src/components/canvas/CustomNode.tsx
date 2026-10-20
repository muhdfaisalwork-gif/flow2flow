import { memo, type FC } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Webhook,
  Clock,
  Play,
  Globe,
  Code,
  Shuffle,
  GitBranch,
  ArrowRightLeft,
  Repeat,
  Merge,
  MessageSquare,
  FileSearch,
  FileText,
  Mail,
  Hash,
  Database,
  Send,
  Filter,
  Timer,
  Variable,
  Bot,
  Sparkles,
  Brain,
  Cpu,
  Terminal,
  Layers,
  Mic,
  Search,
  Server,
  Table,
  BookOpen,
  HardDrive,
  Phone,
  Users,
  CreditCard,
  ShoppingCart,
  CheckSquare,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  Slash,
  Key,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNodeData } from '@/types/workflow';
import { useUIStore } from '@/stores/uiStore';

const iconMap: Record<string, LucideIcon> = {
  Webhook,
  Clock,
  Play,
  Globe,
  Code,
  Shuffle,
  GitBranch,
  ArrowRightLeft,
  Repeat,
  Merge,
  MessageSquare,
  FileSearch,
  FileText,
  Mail,
  Hash,
  Database,
  Send,
  Filter,
  Timer,
  Variable,
  Bot,
  Sparkles,
  Brain,
  Cpu,
  Terminal,
  Layers,
  Mic,
  Search,
  Server,
  Table,
  BookOpen,
  HardDrive,
  Phone,
  Users,
  CreditCard,
  ShoppingCart,
  CheckSquare,
  Zap,
};

const CustomNode: FC<NodeProps> = ({ id, data, selected }) => {
  const selectNode = useUIStore((state) => state.selectNode);
  const nodeData = data as WorkflowNodeData;
  const Icon = iconMap[nodeData.icon] || Zap;

  const execStatus = nodeData.executionStatus || 'idle';
  const durationMs = nodeData.executionDurationMs;
  const isTrigger =
    nodeData.category === 'triggers' || nodeData.category === 'trigger';
  const isBranching =
    nodeData.type === 'if-else' ||
    nodeData.type === 'filter' ||
    nodeData.type === 'switch' ||
    (nodeData.outputs && nodeData.outputs.length > 1);

  const aiSubNodes = nodeData.aiSubNodes || [];
  const requiredCreds = nodeData.requiredCredentials || [];

  const handleClick = () => {
    selectNode(id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative min-w-[195px] max-w-[260px] rounded-xl border bg-card/95 backdrop-blur-md shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02]',
        selected && 'ring-2 ring-primary shadow-glow',
        !selected && execStatus === 'idle' && 'border-border/60 hover:border-primary/50',
        execStatus === 'running' && 'ring-2 ring-blue-500 border-blue-500 shadow-blue-500/20',
        execStatus === 'success' && 'border-emerald-500/80 shadow-emerald-500/10',
        execStatus === 'error' && 'ring-2 ring-destructive border-destructive',
        execStatus === 'skipped' && 'opacity-55 border-dashed border-muted-foreground/40'
      )}
    >
      {/* Execution Duration Badge (Top-Right) */}
      {durationMs !== undefined && execStatus === 'success' && (
        <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-mono font-semibold shadow-sm flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" />
          {durationMs}ms
        </div>
      )}

      {execStatus === 'running' && (
        <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-mono font-semibold shadow-sm flex items-center gap-1 animate-pulse">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Running
        </div>
      )}

      {execStatus === 'skipped' && (
        <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-mono font-medium border border-border flex items-center gap-1">
          <Slash className="w-2.5 h-2.5" />
          Skipped
        </div>
      )}

      {execStatus === 'error' && (
        <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-mono font-semibold flex items-center gap-1">
          <XCircle className="w-2.5 h-2.5" />
          Error
        </div>
      )}

      {/* Target Handle (Left) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
      )}

      {/* Node Body */}
      <div className="p-3">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div
            className="p-1.5 rounded-lg shrink-0"
            style={{ backgroundColor: `${nodeData.color || '#3B82F6'}20` }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: nodeData.color || '#3B82F6' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-foreground truncate">
              {nodeData.label}
            </p>
            {nodeData.serviceName && nodeData.serviceName !== nodeData.label && (
              <p className="text-[10px] text-muted-foreground truncate">
                {nodeData.serviceName}
              </p>
            )}
          </div>
        </div>

        {/* AI Sub-Node Attachments (Model, Memory, Vector Tool, etc.) */}
        {aiSubNodes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-border/40">
            {aiSubNodes.map((sub) => (
              <span
                key={`${sub.id}-${sub.role}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 text-[9px] font-medium"
                title={`${sub.role}: ${sub.label}`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {sub.label}
              </span>
            ))}
          </div>
        )}

        {/* Footer Status & Credential Indicator */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                execStatus === 'running'
                  ? 'bg-blue-500 animate-ping'
                  : execStatus === 'success'
                    ? 'bg-emerald-500'
                    : execStatus === 'error'
                      ? 'bg-destructive'
                      : nodeData.isConfigured
                        ? 'bg-emerald-500'
                        : 'bg-amber-500 animate-pulse'
              )}
            />
            <span className="text-[10px] text-muted-foreground">
              {execStatus === 'idle'
                ? nodeData.isConfigured
                  ? 'Ready'
                  : 'Needs setup'
                : execStatus.charAt(0).toUpperCase() + execStatus.slice(1)}
            </span>
          </div>

          {requiredCreds.length > 0 && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-mono text-amber-500/90 bg-amber-500/10 px-1.5 py-0.5 rounded"
              title={`Requires: ${requiredCreds.join(', ')}`}
            >
              <Key className="w-2.5 h-2.5" />
              {requiredCreds.length}
            </span>
          )}
        </div>
      </div>

      {/* Output Handle(s) */}
      {isBranching ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="output_0"
            className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
            style={{ top: '34%' }}
          />
          <span
            className="absolute -right-7 text-[9px] font-mono font-semibold text-emerald-500 pointer-events-none select-none"
            style={{ top: '26%' }}
          >
            T
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id="output_1"
            className="!w-3 !h-3 !bg-destructive !border-2 !border-background"
            style={{ top: '72%' }}
          />
          <span
            className="absolute -right-7 text-[9px] font-mono font-semibold text-destructive pointer-events-none select-none"
            style={{ top: '64%' }}
          >
            F
          </span>
          {/* Legacy 'true' and 'false' hidden compatibility handles */}
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!opacity-0 !w-1 !h-1"
            style={{ top: '34%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!opacity-0 !w-1 !h-1"
            style={{ top: '72%' }}
          />
        </>
      ) : (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="output_0"
            className="!w-3 !h-3 !bg-primary !border-2 !border-background"
          />
        </>
      )}

      {/* Ambient Hover Glow */}
      <div
        className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity blur-xl"
        style={{ backgroundColor: nodeData.color || '#3B82F6' }}
      />
    </div>
  );
};

export default memo(CustomNode);
