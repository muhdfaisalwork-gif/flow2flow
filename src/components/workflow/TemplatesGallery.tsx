import { type FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, LayoutGrid, Zap, MessageSquare, 
  Code, Brain, Database, ShoppingCart, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  nodes: unknown;
  edges: unknown;
  is_public: boolean;
  created_at: string;
}

interface TemplatesGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (name: string, description: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
}

const categoryIcons: Record<string, typeof Zap> = {
  communication: MessageSquare,
  development: Code,
  ai: Brain,
  data: Database,
  sales: ShoppingCart,
  general: LayoutGrid,
};

const categoryColors: Record<string, string> = {
  communication: 'bg-blue-500/10 text-blue-500',
  development: 'bg-purple-500/10 text-purple-500',
  ai: 'bg-pink-500/10 text-pink-500',
  data: 'bg-green-500/10 text-green-500',
  sales: 'bg-orange-500/10 text-orange-500',
  general: 'bg-gray-500/10 text-gray-500',
};

const TemplatesGallery: FC<TemplatesGalleryProps> = ({ isOpen, onClose, onImport }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading templates',
        description: error.message,
      });
    } else {
      setTemplates(data || []);
    }
    setIsLoading(false);
  };

  const handleImport = (template: Template) => {
    const nodes = Array.isArray(template.nodes) 
      ? template.nodes as unknown as WorkflowNode[] 
      : [];
    const edges = Array.isArray(template.edges) 
      ? template.edges as unknown as WorkflowEdge[] 
      : [];
    
    onImport(template.name, template.description || '', nodes, edges);
    onClose();
    
    toast({
      title: 'Template imported',
      description: `"${template.name}" has been loaded into the editor`,
    });
  };

  const categories = [...new Set(templates.map(t => t.category))];
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Template Gallery</h2>
                <p className="text-muted-foreground">
                  Start with a pre-built workflow and customize it
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  All
                </Button>
                {categories.map(category => {
                  const Icon = categoryIcons[category] || LayoutGrid;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'No templates available'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template, index) => {
                  const Icon = categoryIcons[template.category] || LayoutGrid;
                  const nodeCount = Array.isArray(template.nodes) ? template.nodes.length : 0;
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-all cursor-pointer"
                      onClick={() => handleImport(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${categoryColors[template.category] || categoryColors.general}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{nodeCount} nodes</span>
                        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to use →
                        </span>
                      </div>
                    </motion.div>
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

export default TemplatesGallery;
