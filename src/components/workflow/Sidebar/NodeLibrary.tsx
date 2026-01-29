import { type FC, type DragEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Zap, Play, GitBranch, Sparkles, X, type LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { nodeDefinitions, nodeCategories } from '@/lib/nodes/definitions';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NodeCategory, NodeDefinition } from '@/types/workflow';

const categoryIcons: Record<string, LucideIcon> = {
  triggers: Zap,
  actions: Play,
  logic: GitBranch,
  ai: Sparkles,
};

interface NodeLibraryProps {
  isOpen: boolean;
}

const NodeLibrary: FC<NodeLibraryProps> = ({ isOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['triggers', 'actions', 'logic', 'ai'])
  );
  const { setNodeLibraryOpen } = useUIStore();
  const isMobile = useIsMobile();

  const filteredNodes = nodeDefinitions.filter((node) =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getNodesByCategory = (category: NodeCategory): NodeDefinition[] => {
    return filteredNodes.filter((node) => node.category === category);
  };

  // Mobile: Full-screen overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-card flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="text-lg font-semibold">Node Library</h2>
              <Button variant="ghost" size="icon" onClick={() => setNodeLibraryOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
            </div>

            {/* Node Categories */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {nodeCategories.map((category) => {
                  const Icon = categoryIcons[category.id];
                  const nodes = getNodesByCategory(category.id as NodeCategory);
                  const isExpanded = expandedCategories.has(category.id);

                  if (nodes.length === 0 && searchQuery) return null;

                  return (
                    <div key={category.id} className="space-y-2">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <Icon className="w-4 h-4" />
                        <span>{category.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {nodes.length}
                        </span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 space-y-2">
                              {nodes.map((node) => (
                                <MobileNodeItem
                                  key={node.type}
                                  node={node}
                                  onClose={() => setNodeLibraryOpen(false)}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Tap a node to add it to the canvas
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Side panel
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-72 h-full border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold mb-3">Node Library</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
          </div>

          {/* Node Categories */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {nodeCategories.map((category) => {
                const Icon = categoryIcons[category.id];
                const nodes = getNodesByCategory(category.id as NodeCategory);
                const isExpanded = expandedCategories.has(category.id);

                if (nodes.length === 0 && searchQuery) return null;

                return (
                  <div key={category.id} className="space-y-1">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Icon className="w-4 h-4" />
                      <span>{category.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {nodes.length}
                      </span>
                    </button>

                    {/* Category Nodes */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 space-y-1">
                            {nodes.map((node) => (
                              <NodeItem
                                key={node.type}
                                node={node}
                                onDragStart={onDragStart}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer hint */}
          <div className="p-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Drag nodes to the canvas to build your workflow
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface NodeItemProps {
  node: NodeDefinition;
  onDragStart: (event: DragEvent, nodeType: string) => void;
}

const NodeItem: FC<NodeItemProps> = ({ node, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg cursor-grab',
        'bg-background/50 border border-transparent',
        'hover:border-primary/50 hover:bg-background/80 hover:shadow-sm',
        'active:cursor-grabbing active:scale-95',
        'transition-all duration-150'
      )}
    >
      <div
        className="p-1.5 rounded-md"
        style={{ backgroundColor: `${node.color}20` }}
      >
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: node.color }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{node.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {node.description}
        </p>
      </div>
    </div>
  );
};

// Mobile node item - tap to add
interface MobileNodeItemProps {
  node: NodeDefinition;
  onClose: () => void;
}

const MobileNodeItem: FC<MobileNodeItemProps> = ({ node, onClose }) => {
  const { addNode } = useWorkflowStore();

  const handleTap = () => {
    // Add node at center of canvas
    const newNode = {
      id: `${node.type}-${Date.now()}`,
      type: 'custom' as const,
      position: { x: 200, y: 200 },
      data: {
        label: node.label,
        type: node.type,
        category: node.category,
        icon: node.icon,
        color: node.color,
        config: { ...node.defaultData },
        isConfigured: false,
      },
    };
    addNode(newNode);
    onClose();
  };

  return (
    <button
      onClick={handleTap}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left',
        'bg-background/50 border border-transparent',
        'hover:border-primary/50 hover:bg-background/80',
        'active:scale-[0.98]',
        'transition-all duration-150'
      )}
    >
      <div
        className="p-2 rounded-md"
        style={{ backgroundColor: `${node.color}20` }}
      >
        <div
          className="w-5 h-5 rounded-sm"
          style={{ backgroundColor: node.color }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{node.label}</p>
        <p className="text-sm text-muted-foreground truncate">
          {node.description}
        </p>
      </div>
    </button>
  );
};

// Import at component level
import { useWorkflowStore } from '@/stores/workflowStore';

export default NodeLibrary;
