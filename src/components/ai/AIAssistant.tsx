import { type FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUIStore } from '@/stores/uiStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  workflow?: {
    nodes: unknown[];
    edges: unknown[];
  };
}

interface AIAssistantProps {
  isOpen: boolean;
}

const AIAssistant: FC<AIAssistantProps> = ({ isOpen }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI workflow assistant. I can help you:\n\n• **Build workflows** from natural language\n• **Explain** what nodes do\n• **Debug** issues in your workflow\n• **Suggest** optimizations\n\nWhat would you like to create?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const isMobile = useIsMobile();
  const { toggleAIAssistant } = useUIStore();
  const { setNodes, setEdges, nodes, edges } = useWorkflowStore();
  const { toast } = useToast();

  const handleSend = async (generateWorkflow = false) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('workflow-ai', {
        body: {
          message: userMessage.content,
          type: generateWorkflow ? 'generate' : 'chat',
          context: {
            workflow: { nodes, edges },
          },
        },
      });

      if (error) throw error;

      if (data.type === 'workflow' && data.workflow) {
        // Apply generated workflow to canvas
        setNodes(data.workflow.nodes);
        setEdges(data.workflow.edges);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.explanation || "I've created a workflow for you! Check the canvas to see the nodes I've added. Click on any node to configure it.",
          workflow: data.workflow,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        toast({
          title: 'Workflow generated!',
          description: 'Check the canvas to see your new workflow.',
        });
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content || "I'm sorry, I couldn't process that request.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(false);
    }
  };

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-neon/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleAIAssistant}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:my-2">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.workflow && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    ✓ Applied {message.workflow.nodes.length} nodes to canvas
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="min-h-[60px] max-h-[120px] pr-24 resize-none bg-background/50"
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => handleSend(true)}
              disabled={!input.trim() || isLoading}
              title="Generate workflow"
            >
              <Wand2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8"
              onClick={() => handleSend(false)}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enter to chat • Click ✨ to generate workflow
        </p>
      </div>
    </>
  );

  // Mobile: Full-screen
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-card flex flex-col"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Floating panel
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 w-96 h-[500px] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden z-50"
        >
          {panelContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
