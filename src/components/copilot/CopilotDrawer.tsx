import { type FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  Loader2,
  Wand2,
  ShieldCheck,
  Key,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUIStore } from '@/stores/uiStore';
import { useWorkflowStore, createNewWorkflow } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  COPILOT_MODELS,
  synthesizeWorkflowWithAI,
  validateAndRepairWorkflow,
  type CopilotProvider,
} from '@/lib/copilot/aiEngine';
import { graphMemory } from '@/lib/copilot/graphMemory';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  nodeCount?: number;
  repairs?: string[];
  modeUsed?: string;
  matchedMemoryNodes?: string[];
}

export interface CopilotDrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  initialPrompt?: string;
}

const PROMPT_SUGGESTIONS = [
  'When a Stripe webhook arrives, check if amount > 100, summarize with Claude 3.5, save to Supabase, else alert Slack',
  'Connect to MCP server tool and process incoming webhook payload',
  'Trigger Activepieces Slack piece when GitHub star arrives',
  'Create an autonomous deep research workflow with Firecrawl, Perplexity, and Claude 3.5 Sonnet',
  'Insert a filter node between step 1 and step 2',
];

const CopilotDrawer: FC<CopilotDrawerProps> = ({ isOpen, onClose, initialPrompt }) => {
  const [provider, setProvider] = useState<CopilotProvider>('builtin');
  const [apiKey, setApiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<{ plan: string; limit: number | string; used: number; remaining: number | string } | null>(null);
  const initialTriggerRef = useRef<string | null>(null);

  const fetchQuota = async () => {
    try {
      const res = await fetch('https://shadowflow.work/api/copilot/usage');
      if (res.ok) {
        const data = (await res.json()) as { plan: string; limit: number | string; used: number; remaining: number | string };
        setQuotaInfo(data);
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuota();
    }
  }, [isOpen]);

  const [showMemoryInspector, setShowMemoryInspector] = useState(false);
  const [memoryNodesCount, setMemoryNodesCount] = useState(() => graphMemory.getNodeCount());

  const loadSavedMessages = (): Message[] => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('shadowflow_copilot_messages');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hi! I'm your **Shadow Flow AI Copilot**.\n\n• **Shared Graph Memory**: Persists workflow knowledge, rules, and component graphs across all 3 engines.\n• **Zero-Cost Heuristic Mode**: Synthesizes and refactors multi-branch workflows 100% offline.\n• **Built-in Cloud AI**: Powered by Groq LPU with zero API keys needed!\n• **Local Ollama**: Connect Gemma 4 for private offline inference.\n• **Try Prompts**: *\"Lead generation pipeline with validation and CRM sync\"* or *\"Autonomous deep research with Firecrawl and Perplexity\"*.",
      },
    ];
  };

  const [messages, setMessages] = useState<Message[]>(loadSavedMessages);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('shadowflow_copilot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleClearChat = () => {
    const defaultMsg: Message[] = [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared. What workflow would you like to build or refactor?",
      },
    ];
    setMessages(defaultMsg);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('shadowflow_copilot_messages', JSON.stringify(defaultMsg));
    }
  };
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const { toggleAIAssistant } = useUIStore();
  const {
    workflow,
    nodes,
    edges,
    setWorkflow,
    setNodes,
    setEdges,
    updateWorkflowMeta,
    setCopilotOpen,
  } = useWorkflowStore();
  const { toast } = useToast();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      toggleAIAssistant();
      setCopilotOpen(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && initialPrompt && initialTriggerRef.current !== initialPrompt) {
      initialTriggerRef.current = initialPrompt;
      handleSynthesize(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSynthesize = async (promptOverride?: string) => {
    const promptText = (promptOverride || input).trim();
    if (!promptText || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await synthesizeWorkflowWithAI(
        promptText,
        {
          provider,
          apiKey: apiKey.trim() || undefined,
          ollamaBaseUrl: ollamaUrl,
        },
        nodes,
        edges
      );

      if (!workflow) {
        setWorkflow({
          ...createNewWorkflow(),
          name: result.name,
          description: result.explanation,
          nodes: result.nodes,
          edges: result.edges,
        });
      } else {
        setNodes(result.nodes);
        setEdges(result.edges);
        if (result.name && result.name !== 'Refactored Workflow') {
          updateWorkflowMeta({ name: result.name });
        }
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.explanation,
        nodeCount: result.nodes.length,
        repairs: result.repairedIssues,
        modeUsed: COPILOT_MODELS[result.modeUsed]?.label || result.modeUsed,
        matchedMemoryNodes: result.matchedMemoryNodes,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setMemoryNodesCount(graphMemory.getNodeCount());

      toast({
        title: '✨ Workflow Topology Synthesized',
        description: `Applied ${result.nodes.length} nodes and ${result.edges.length} connections to canvas.`,
      });
      fetchQuota();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Synthesis failed';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Could not synthesize workflow: ${errMsg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfHealGraph = () => {
    const report = validateAndRepairWorkflow(nodes, edges);
    setNodes(report.nodes);
    setEdges(report.edges);

    const summaryMsg: Message = {
      id: `heal-${Date.now()}`,
      role: 'assistant',
      content: `**Self-Healing Graph Validation Complete**:\n${report.repairsApplied.map((r) => `- ${r}`).join('\n')}`,
      nodeCount: report.nodes.length,
      repairs: report.repairsApplied,
    };
    setMessages((prev) => [...prev, summaryMsg]);

    toast({
      title: 'Graph Validated & Self-Healed',
      description: `${report.repairsApplied.length} optimization(s) applied.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSynthesize();
    }
  };

  const panelBody = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border/60 bg-gradient-to-r from-primary/15 via-purple-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Prompt-to-Flow AI Copilot</h3>
              <p className="text-[11px] text-muted-foreground">
                Multi-turn conversational builder & self-healing graph engine
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Engine Mode Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={provider}
              onChange={(e) => {
                const next = e.target.value as CopilotProvider;
                setProvider(next);
                setShowKeyInput(COPILOT_MODELS[next].requiresKey);
              }}
              className="flex-1 h-7 px-2 rounded-md border border-border bg-background/80 text-xs font-medium"
            >
              {Object.entries(COPILOT_MODELS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] gap-1"
              onClick={handleSelfHealGraph}
              title="Run validateAndRepairWorkflow on current canvas"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Heal
            </Button>
          </div>

          {COPILOT_MODELS[provider].requiresKey && showKeyInput && (
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter ${provider.toUpperCase()} API Key (or leave blank for offline fallback)`}
                className="h-7 text-xs bg-background/80"
              />
            </div>
          )}

          {provider === 'ollama' && (
            <div className="flex items-center gap-1.5">
              <Input
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="h-7 text-xs font-mono bg-background/80"
              />
            </div>
          )}

          {provider === 'builtin' && quotaInfo && (
            <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Groq LPU Active (No Key Required)
              </span>
              <span className="font-mono text-muted-foreground text-[10px]">
                {quotaInfo.remaining === 'unlimited'
                  ? 'Unlimited (Max Plan)'
                  : `${quotaInfo.remaining}/${quotaInfo.limit} left today (${quotaInfo.plan.toUpperCase()})`}
              </span>
            </div>
          )}

          {/* Graph Memory Status Banner */}
          <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300 font-medium">
                🧠 Graph Memory: Active ({memoryNodesCount} nodes)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-purple-300 hover:text-purple-200"
                onClick={() => setShowMemoryInspector(!showMemoryInspector)}
              >
                {showMemoryInspector ? 'Hide' : 'Inspect'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={handleClearChat}
                title="Clear conversational transcript"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Memory Inspector Drawer */}
          {showMemoryInspector && (
            <div className="p-2.5 rounded-md bg-background/95 border border-purple-500/30 text-[11px] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                <span>Knowledge Graph Subgraphs</span>
                <a
                  href="/graph.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  View Graph (graph.html) ↗
                </a>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                {graphMemory.getAllNodes().map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-1 rounded bg-muted/40 border border-border/40">
                    <span className="font-medium text-foreground truncate max-w-[200px]" title={node.label}>
                      {node.label}
                    </span>
                    <Badge variant="outline" className="text-[9px] h-3.5 px-1 capitalize">
                      {node.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat & Synthesis Transcript */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3.5">
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
                  'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted/80 text-foreground rounded-bl-sm border border-border/50'
                )}
              >
                <div className="prose prose-xs dark:prose-invert max-w-none [&>p]:mb-1.5 [&>ul]:my-1.5">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {message.nodeCount !== undefined && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[10px] text-emerald-400">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {message.nodeCount} nodes active on canvas
                    </span>
                    {message.modeUsed && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1">
                        {message.modeUsed}
                      </Badge>
                    )}
                  </div>
                )}

                {message.matchedMemoryNodes && message.matchedMemoryNodes.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-border/30 text-[10px] text-purple-300/90 flex items-center gap-1 flex-wrap">
                    <span>🧠 Memory context:</span>
                    {message.matchedMemoryNodes.slice(0, 3).map((nodeId) => (
                      <span key={nodeId} className="font-mono text-[9px] bg-purple-950/40 px-1 py-0.5 rounded border border-purple-800/40">
                        {nodeId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Prompt Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <div className="space-y-1.5 pt-2">
              <p className="text-[11px] text-muted-foreground font-semibold">
                Prompt-to-Flow & Conversational Edits:
              </p>
              {PROMPT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSynthesize(s)}
                  className="w-full text-left text-[11px] px-3 py-2 rounded-lg border border-border/50 bg-background/40 hover:bg-muted/70 hover:border-primary/40 transition-colors flex items-start gap-2"
                >
                  <Wand2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  Synthesizing & validating workflow graph...
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Composer */}
      <div className="p-3.5 border-t border-border/60 bg-card">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a new workflow or refactor the active canvas..."
            className="min-h-[64px] max-h-[120px] pr-20 text-xs resize-none bg-background/60"
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="default"
              className="h-7 w-7"
              onClick={() => handleSynthesize()}
              disabled={!input.trim() || isLoading}
              title="Synthesize or Refactor Workflow"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-50 bg-card flex flex-col"
          >
            {panelBody}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.98 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="fixed bottom-4 right-4 w-[410px] h-[590px] rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden z-50"
        >
          {panelBody}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CopilotDrawer;
