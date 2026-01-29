import { memo, type FC } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { 
  Webhook, Clock, Play, Globe, Code, Shuffle, 
  GitBranch, ArrowRightLeft, Repeat, Merge,
  MessageSquare, FileSearch, FileText, type LucideIcon
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
};

const CustomNode: FC<NodeProps> = ({ id, data, selected }) => {
  const selectNode = useUIStore((state) => state.selectNode);
  const nodeData = data as WorkflowNodeData;
  const Icon = iconMap[nodeData.icon] || Code;

  const handleClick = () => {
    selectNode(id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative min-w-[160px] rounded-xl border bg-card/90 backdrop-blur-sm shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02]',
        selected && 'ring-2 ring-primary shadow-glow',
        !selected && 'border-border/50 hover:border-primary/50'
      )}
    >
      {/* Input Handle */}
      {nodeData.category !== 'triggers' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
      )}

      {/* Node Content */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${nodeData.color}20` }}
          >
            <Icon 
              className="w-4 h-4" 
              style={{ color: nodeData.color }}
            />
          </div>
          <span className="font-medium text-sm text-foreground truncate">
            {nodeData.label}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            nodeData.isConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
          )} />
          <span className="text-xs text-muted-foreground">
            {nodeData.isConfigured ? 'Configured' : 'Needs setup'}
          </span>
        </div>
      </div>

      {/* Output Handle(s) */}
      {nodeData.type === 'if-else' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!w-3 !h-3 !bg-destructive !border-2 !border-background"
            style={{ top: '70%' }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
      )}

      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity blur-xl"
        style={{ backgroundColor: nodeData.color }}
      />
    </div>
  );
};

export default memo(CustomNode);
