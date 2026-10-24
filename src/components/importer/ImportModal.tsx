import { type FC, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileJson,
  Sparkles,
  CheckCircle2,
  Key,
  GitBranch,
  Bot,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  parseN8nWorkflow,
  type N8nImportResult,
} from '@/lib/importer/n8nAdapter';
import { OFFICIAL_N8N_TEST_FLOWS } from '@/lib/templates/n8nTestFlows';
import { useWorkflowStore, createNewWorkflow } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_N8N_WORKFLOW = JSON.stringify(
  {
    name: 'AI Customer Support Triage & RAG Escalation',
    nodes: [
      {
        id: '1',
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        position: [-300, -100],
        parameters: {
          content: '## Enterprise AI Support Triage\nIngests webhook tickets, attaches Claude 3.5 + Supabase Vector DB, and branches on priority.',
        },
      },
      {
        id: '2',
        name: 'Support Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [100, 200],
        parameters: { httpMethod: 'POST', path: 'support-inbound' },
      },
      {
        id: '3',
        name: 'Claude 3.5 Sonnet',
        type: '@n8n/n8n-nodes-langchain.lmChatAnthropic',
        position: [400, 40],
        parameters: { model: 'claude-3-5-sonnet-20241022' },
        credentials: { anthropicApi: { name: 'Anthropic Key' } },
      },
      {
        id: '4',
        name: 'Supabase Vector Store',
        type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
        position: [400, 360],
        parameters: { indexName: 'support_kb' },
        credentials: { supabaseApi: { name: 'Supabase Service Key' } },
      },
      {
        id: '5',
        name: 'Support RAG Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        position: [420, 200],
        parameters: { text: '{{ $json.ticketBody }}' },
      },
      {
        id: '6',
        name: 'Is Urgent Ticket?',
        type: 'n8n-nodes-base.if',
        position: [740, 200],
        parameters: { condition: 'input.urgency', operator: 'equals', value: 'high' },
      },
      {
        id: '7',
        name: 'Slack P0 Escalation',
        type: 'n8n-nodes-base.slack',
        position: [1060, 120],
        parameters: { channel: '#support-p0', text: '🚨 Urgent escalation: {{ $json.content }}' },
        credentials: { slackApi: { name: 'Slack Bot Token' } },
      },
      {
        id: '8',
        name: 'Send Auto-Resolution Email',
        type: 'n8n-nodes-base.gmail',
        position: [1060, 280],
        parameters: { subject: 'Resolved: Your support ticket', message: '{{ $json.content }}' },
        credentials: { gmailOAuth2: { name: 'Gmail OAuth' } },
      },
    ],
    connections: {
      'Support Webhook': {
        main: [[{ node: 'Support RAG Agent', type: 'main', index: 0 }]],
      },
      'Claude 3.5 Sonnet': {
        ai_languageModel: [[{ node: 'Support RAG Agent', type: 'ai_languageModel', index: 0 }]],
      },
      'Supabase Vector Store': {
        ai_tool: [[{ node: 'Support RAG Agent', type: 'ai_tool', index: 0 }]],
      },
      'Support RAG Agent': {
        main: [[{ node: 'Is Urgent Ticket?', type: 'main', index: 0 }]],
      },
      'Is Urgent Ticket?': {
        main: [
          [{ node: 'Slack P0 Escalation', type: 'main', index: 0 }],
          [{ node: 'Send Auto-Resolution Email', type: 'main', index: 0 }],
        ],
      },
    },
  },
  null,
  2
);

const ImportModal: FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [previewResult, setPreviewResult] = useState<N8nImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setWorkflow } = useWorkflowStore();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAnalyzeJson = (rawText: string) => {
    setJsonInput(rawText);
    if (!rawText.trim()) {
      setPreviewResult(null);
      setParseError(null);
      return;
    }

    try {
      const parsed = parseN8nWorkflow(rawText, { forceAutoLayout: true });
      setPreviewResult(parsed);
      setParseError(null);
    } catch (err) {
      setPreviewResult(null);
      setParseError(err instanceof Error ? err.message : 'Invalid n8n JSON structure');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    handleAnalyzeJson(text);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!previewResult) return;

    setWorkflow({
      ...createNewWorkflow(),
      name: previewResult.name,
      description: previewResult.description,
      nodes: previewResult.nodes,
      edges: previewResult.edges,
      settings: previewResult.settings,
      missingCredentials: previewResult.missingCredentials,
    });

    toast({
      title: 'Universal n8n Workflow Imported',
      description: `Loaded "${previewResult.name}" (${previewResult.stats.importedNodes} nodes, ${previewResult.stats.importedEdges} connections).`,
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
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
                <FileJson className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Universal n8n Workflow Importer</h2>
                <p className="text-xs text-muted-foreground">
                  Multi-output branch translator • LangChain AI handle wiring • Credentials analyzer • Kahn auto-layout
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden">
            {/* Left Column: Paste or Upload JSON */}
            <div className="p-5 flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Raw n8n Workflow JSON
                </span>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <select
                    onChange={(e) => {
                      const flow = OFFICIAL_N8N_TEST_FLOWS.find((x) => x.id === e.target.value);
                      if (flow) {
                        handleAnalyzeJson(JSON.stringify(flow.n8nJson, null, 2));
                      }
                    }}
                    defaultValue=""
                    className="h-7 text-xs px-2.5 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <option value="" disabled>
                      ⚡ Load Official n8n Test Fixture...
                    </option>
                    {OFFICIAL_N8N_TEST_FLOWS.map((f) => (
                      <option key={f.id} value={f.id} className="bg-popover text-popover-foreground">
                        {f.name} ({f.nodeCount} nodes)
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleAnalyzeJson(SAMPLE_N8N_WORKFLOW)}
                  >
                    <Sparkles className="w-3 h-3 text-primary" />
                    AI Triage Sample
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3" />
                    Upload .json
                  </Button>
                </div>
              </div>

              <Textarea
                value={jsonInput}
                onChange={(e) => handleAnalyzeJson(e.target.value)}
                placeholder='Paste any raw n8n workflow JSON here (from n8n.io, awesome-n8n-templates, or GitHub)...'
                className="flex-1 font-mono text-xs resize-none bg-background/60 min-h-[280px]"
              />

              {parseError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">{parseError}</span>
                </div>
              )}
            </div>

            {/* Right Column: Live Topology & Credentials Preview */}
            <ScrollArea className="p-5">
              {!previewResult ? (
                <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                  <FileJson className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Ready to Ingest n8n Topology
                  </p>
                  <p className="text-xs max-w-xs">
                    Paste an n8n JSON file or click <strong>"Load Sample n8n AI Flow"</strong> to preview multi-branch handles, AI sub-nodes, and required API keys.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-bold text-base">{previewResult.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {previewResult.description}
                    </p>
                  </div>

                  {/* Topology Metrics */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl border border-border/60 bg-background/40">
                      <p className="text-xl font-bold text-primary">
                        {previewResult.stats.importedNodes}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Executable Nodes Mapped
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-border/60 bg-background/40">
                      <p className="text-xl font-bold text-emerald-500">
                        {previewResult.stats.importedEdges}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Graph Edges & Branches
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-border/60 bg-background/40 flex items-center gap-2.5">
                      <GitBranch className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-sm font-bold">
                          {previewResult.stats.multiBranchNodes}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Multi-Output Routers
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-border/60 bg-background/40 flex items-center gap-2.5">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-sm font-bold">
                          {previewResult.stats.aiSubNodesWired}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          LangChain Sub-Nodes
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Missing Credentials Dependency Report */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      Credentials Dependency Analysis ({previewResult.missingCredentials.length})
                    </h4>
                    {previewResult.missingCredentials.length === 0 ? (
                      <p className="text-xs text-emerald-500 bg-emerald-500/10 p-2.5 rounded-lg">
                        Zero external API credentials required — runs 100% standalone!
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {previewResult.missingCredentials.map((cred) => (
                          <div
                            key={cred.envVarName}
                            className="flex items-center justify-between p-2 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs"
                          >
                            <div>
                              <span className="font-mono font-semibold text-amber-400">
                                {cred.envVarName}
                              </span>
                              <p className="text-[10px] text-muted-foreground">
                                Used by: {cred.nodeNames.join(', ')}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                              {cred.service}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-card/80 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Automatically applies Kahn's topological layout (`320px × 150px`)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!previewResult}
                onClick={handleConfirmImport}
                className="gap-1.5"
              >
                Import to Canvas
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImportModal;
