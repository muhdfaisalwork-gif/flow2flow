import { type FC, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  LayoutGrid,
  Sparkles,
  MessageSquare,
  Mail,
  Database,
  Terminal,
  Briefcase,
  Key,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowStore, createNewWorkflow } from '@/lib/store';
import {
  TEMPLATE_CATEGORIES,
  searchTemplates,
  TEMPLATE_SEEDS,
} from '@/lib/templates/templateRegistry';
import type { WorkflowNode, WorkflowEdge, WorkflowTemplate } from '@/types/workflow';

export interface TemplateHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (
    name: string,
    description: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ) => void;
}

const categoryIconMap: Record<string, typeof Sparkles> = {
  'AI & Autonomous Agents': Sparkles,
  'Messaging & Bots': MessageSquare,
  'Email & CRM': Mail,
  'Databases & Storage': Database,
  'DevOps & Webhooks': Terminal,
  'Industry Verticals': Briefcase,
};

const categoryColorMap: Record<string, string> = {
  'AI & Autonomous Agents': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Messaging & Bots': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Email & CRM': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'Databases & Storage': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'DevOps & Webhooks': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Industry Verticals': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
};

const TemplateHubModal: FC<TemplateHubModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { setWorkflow } = useWorkflowStore();
  const { toast } = useToast();

  const filteredTemplates = useMemo(() => {
    if (!isOpen) return [];
    return searchTemplates({
      query: searchQuery,
      category: selectedCategory === 'All' ? null : selectedCategory,
    });
  }, [isOpen, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleCloneTemplate = (template: WorkflowTemplate) => {
    if (onImport) {
      onImport(template.name, template.description, template.nodes, template.edges);
    } else {
      setWorkflow({
        ...createNewWorkflow(),
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
      });
    }

    toast({
      title: 'Production Template Cloned to Canvas',
      description: `Loaded "${template.name}" (${template.nodes.length} nodes).`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[86vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold">Enterprise Template Ecosystem</h2>
                  <Badge variant="default" className="text-xs">
                    {TEMPLATE_SEEDS.length} Production Templates
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Powered by awesome-n8n-templates & n8n-free-templates • 1-click clone to canvas with topological layout
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search & Category Filter Pills */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search 120+ templates by name, service (Slack, Claude, Supabase, Shopify), or vertical..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 text-sm bg-background/70"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('All')}
                  className="h-9 text-xs"
                >
                  <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                  All ({TEMPLATE_SEEDS.length})
                </Button>
                {TEMPLATE_CATEGORIES.map((category) => {
                  const Icon = categoryIconMap[category] || LayoutGrid;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="h-9 text-xs"
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1 p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-semibold mb-1">No matching templates</h3>
                <p className="text-xs text-muted-foreground">
                  Try searching for another service or selecting "All" categories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = categoryIconMap[template.category] || LayoutGrid;
                  const badgeStyle =
                    categoryColorMap[template.category] ||
                    'bg-primary/10 text-primary border-primary/20';

                  return (
                    <div
                      key={template.id}
                      onClick={() => handleCloneTemplate(template)}
                      className="group p-4 rounded-xl border border-border/70 bg-background/40 hover:border-primary/60 hover:bg-card/90 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className={`p-2 rounded-lg border ${badgeStyle}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {template.vertical || template.category}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>

                        {template.targetOutcome && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md mb-3">
                            <TrendingUp className="w-3 h-3 shrink-0" />
                            <span className="truncate">{template.targetOutcome}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {template.nodes.length} nodes
                          </span>
                          {template.requiredCredentials &&
                            template.requiredCredentials.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-amber-400">
                                <Key className="w-3 h-3" />
                                {template.requiredCredentials.length} keys
                              </span>
                            )}
                        </div>
                        <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Clone to Canvas
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TemplateHubModal;
