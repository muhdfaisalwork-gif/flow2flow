import { type FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, PlayCircle, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUIStore } from '@/stores/uiStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { getNodeDefinition } from '@/lib/nodes/definitions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NodeConfigPanelProps {
  isOpen: boolean;
}

const NodeConfigPanel: FC<NodeConfigPanelProps> = ({ isOpen }) => {
  const { selectedNodeId, setConfigPanelOpen } = useUIStore();
  const { nodes, updateNode } = useWorkflowStore();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [testInput, setTestInput] = useState('{"key": "value"}');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const nodeDefinition = selectedNode ? getNodeDefinition(selectedNode.data.type) : null;

  const handleConfigChange = (key: string, value: unknown) => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, {
      config: { ...selectedNode?.data.config, [key]: value },
    });
  };

  const handleLabelChange = (label: string) => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, { label });
  };

  const markConfigured = () => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, { isConfigured: true });
  };

  const handleRunTest = async () => {
    if (!selectedNode) return;
    setIsTesting(true);
    setTestOutput(null);

    try {
      let parsedInput: unknown;
      try { parsedInput = JSON.parse(testInput); } catch { parsedInput = testInput; }

      // Simulate node execution locally for simple types
      const { type, config } = selectedNode.data;
      let result: unknown;

      switch (type) {
        case 'webhook-trigger':
        case 'schedule-trigger':
        case 'manual-trigger':
          result = { output: parsedInput, message: 'Trigger passes input through' };
          break;
        case 'set-variable':
          result = { ...parsedInput as object, variables: config.variables || {} };
          break;
        case 'delay':
          result = { output: parsedInput, message: `Would delay ${config.seconds || 5}s` };
          break;
        case 'webhook-response':
          result = { statusCode: config.statusCode || 200, body: config.body || parsedInput };
          break;
        default: {
          // For complex nodes, call the edge function
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) { result = { error: 'Not authenticated' }; break; }

          const response = await supabase.functions.invoke('run-workflow', {
            body: { workflowId: 'test', inputData: parsedInput },
          });

          if (response.error) {
            result = { error: response.error.message };
          } else {
            result = response.data;
          }
          break;
        }
      }

      setTestOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setTestOutput(JSON.stringify({ error: err instanceof Error ? err.message : 'Test failed' }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  // Mobile: Bottom sheet style
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && selectedNode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setConfigPanelOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] rounded-t-2xl border-t border-border/50 bg-card flex flex-col"
            >
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${selectedNode.data.color}20` }}>
                    <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: selectedNode.data.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{selectedNode.data.label}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{selectedNode.data.category}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setConfigPanelOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 max-h-[60vh]">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="node-label-mobile">Node Name</Label>
                    <Input id="node-label-mobile" value={selectedNode.data.label} onChange={(e) => handleLabelChange(e.target.value)} placeholder="Enter node name" className="bg-background/50" />
                  </div>
                  {renderNodeConfig(selectedNode.data.type, selectedNode.data.config, handleConfigChange)}
                  <Button onClick={markConfigured} className="w-full mt-4">Mark as Configured</Button>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Side panel
  return (
    <AnimatePresence>
      {isOpen && selectedNode && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-80 h-full border-l border-border/50 bg-card/50 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${selectedNode.data.color}20` }}>
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: selectedNode.data.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedNode.data.label}</h3>
                <p className="text-xs text-muted-foreground capitalize">{selectedNode.data.category}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setConfigPanelOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="settings" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-4 pt-2 bg-transparent">
              <TabsTrigger value="settings" className="gap-1.5"><Settings className="w-3.5 h-3.5" />Settings</TabsTrigger>
              <TabsTrigger value="test" className="gap-1.5"><PlayCircle className="w-3.5 h-3.5" />Test</TabsTrigger>
              <TabsTrigger value="info" className="gap-1.5"><Info className="w-3.5 h-3.5" />Info</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="settings" className="p-4 space-y-4 m-0">
                <div className="space-y-2">
                  <Label htmlFor="node-label">Node Name</Label>
                  <Input id="node-label" value={selectedNode.data.label} onChange={(e) => handleLabelChange(e.target.value)} placeholder="Enter node name" className="bg-background/50" />
                </div>
                {renderNodeConfig(selectedNode.data.type, selectedNode.data.config, handleConfigChange)}
                <Button onClick={markConfigured} className="w-full mt-4">Mark as Configured</Button>
              </TabsContent>

              <TabsContent value="test" className="p-4 m-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Input</Label>
                    <Textarea
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder='{"key": "value"}'
                      className="font-mono text-sm bg-background/50 min-h-[120px]"
                    />
                  </div>
                  <Button className="w-full" onClick={handleRunTest} disabled={isTesting}>
                    {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                    {isTesting ? 'Running...' : 'Run Test'}
                  </Button>
                  <div className="space-y-2">
                    <Label>Output</Label>
                    <div className="p-3 rounded-lg bg-background/50 border border-border min-h-[80px]">
                      {testOutput ? (
                        <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">{testOutput}</pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">Run a test to see the output</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="info" className="p-4 m-0">
                {nodeDefinition && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{nodeDefinition.description}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Inputs</h4>
                      <p className="text-sm text-muted-foreground">{nodeDefinition.inputs} input connection(s)</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Outputs</h4>
                      <p className="text-sm text-muted-foreground">{nodeDefinition.outputs} output connection(s)</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function renderNodeConfig(
  type: string,
  config: Record<string, unknown>,
  onChange: (key: string, value: unknown) => void
) {
  switch (type) {
    case 'webhook-trigger':
      return (
        <>
          <div className="space-y-2">
            <Label>HTTP Method</Label>
            <select value={(config.method as string) || 'POST'} onChange={(e) => onChange('method', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
              <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Webhook Path</Label>
            <Input value={(config.path as string) || ''} onChange={(e) => onChange('path', e.target.value)} placeholder="/webhook" className="bg-background/50" />
          </div>
        </>
      );

    case 'schedule-trigger':
      return (
        <div className="space-y-2">
          <Label>Cron Expression</Label>
          <Input value={(config.cron as string) || ''} onChange={(e) => onChange('cron', e.target.value)} placeholder="0 * * * *" className="font-mono bg-background/50" />
          <p className="text-xs text-muted-foreground">e.g., "0 * * * *" runs every hour</p>
        </div>
      );

    case 'http-request':
      return (
        <>
          <div className="space-y-2">
            <Label>Method</Label>
            <select value={(config.method as string) || 'GET'} onChange={(e) => onChange('method', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
              <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="PATCH">PATCH</option><option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={(config.url as string) || ''} onChange={(e) => onChange('url', e.target.value)} placeholder="https://api.example.com/..." className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Request Body</Label>
            <Textarea value={(config.body as string) || ''} onChange={(e) => onChange('body', e.target.value)} placeholder='{"key": "value"}' className="font-mono text-sm bg-background/50" />
          </div>
        </>
      );

    case 'code-node':
      return (
        <div className="space-y-2">
          <Label>JavaScript Code</Label>
          <Textarea value={(config.code as string) || ''} onChange={(e) => onChange('code', e.target.value)} placeholder="// Your code here&#10;return input;" className="font-mono text-sm bg-background/50 min-h-[200px]" />
        </div>
      );

    case 'ai-chat':
      return (
        <>
          <div className="space-y-2">
            <Label>Model</Label>
            <select value={(config.model as string) || 'google/gemini-2.5-flash'} onChange={(e) => onChange('model', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
              <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="openai/gpt-5">GPT-5</option>
              <option value="openai/gpt-5-mini">GPT-5 Mini</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>System Prompt</Label>
            <Textarea value={(config.systemPrompt as string) || ''} onChange={(e) => onChange('systemPrompt', e.target.value)} placeholder="You are a helpful assistant..." className="bg-background/50 min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <Label>User Prompt</Label>
            <Textarea value={(config.userPrompt as string) || ''} onChange={(e) => onChange('userPrompt', e.target.value)} placeholder="Use {{input}} to reference input data" className="bg-background/50 min-h-[80px]" />
          </div>
        </>
      );

    case 'if-else':
    case 'filter':
      return (
        <>
          <div className="space-y-2">
            <Label>Condition Field</Label>
            <Input value={(config.condition as string) || ''} onChange={(e) => onChange('condition', e.target.value)} placeholder="input.status" className="font-mono bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Operator</Label>
            <select value={(config.operator as string) || 'equals'} onChange={(e) => onChange('operator', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
              <option value="equals">Equals</option><option value="not_equals">Not Equals</option><option value="contains">Contains</option><option value="greater_than">Greater Than</option><option value="less_than">Less Than</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input value={(config.value as string) || ''} onChange={(e) => onChange('value', e.target.value)} placeholder="success" className="bg-background/50" />
          </div>
        </>
      );

    case 'email-send':
      return (
        <>
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={(config.to as string) || ''} onChange={(e) => onChange('to', e.target.value)} placeholder="recipient@example.com" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={(config.subject as string) || ''} onChange={(e) => onChange('subject', e.target.value)} placeholder="Email subject" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <Textarea value={(config.body as string) || ''} onChange={(e) => onChange('body', e.target.value)} placeholder="Email content..." className="bg-background/50 min-h-[80px]" />
          </div>
        </>
      );

    case 'slack-message':
      return (
        <>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Input value={(config.channel as string) || ''} onChange={(e) => onChange('channel', e.target.value)} placeholder="#general" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={(config.message as string) || ''} onChange={(e) => onChange('message', e.target.value)} placeholder="Message text..." className="bg-background/50 min-h-[80px]" />
          </div>
        </>
      );

    case 'db-query':
      return (
        <>
          <div className="space-y-2">
            <Label>Table</Label>
            <Input value={(config.table as string) || ''} onChange={(e) => onChange('table', e.target.value)} placeholder="table_name" className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Operation</Label>
            <select value={(config.operation as string) || 'select'} onChange={(e) => onChange('operation', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
              <option value="select">Select</option><option value="insert">Insert</option><option value="update">Update</option><option value="delete">Delete</option>
            </select>
          </div>
        </>
      );

    case 'delay':
      return (
        <div className="space-y-2">
          <Label>Delay (seconds)</Label>
          <Input type="number" value={String(config.seconds || 5)} onChange={(e) => onChange('seconds', Number(e.target.value))} min={1} max={300} className="bg-background/50" />
          <p className="text-xs text-muted-foreground">Max 300 seconds (5 minutes)</p>
        </div>
      );

    case 'set-variable':
      return (
        <div className="space-y-2">
          <Label>Variables (JSON)</Label>
          <Textarea
            value={JSON.stringify(config.variables || {}, null, 2)}
            onChange={(e) => { try { onChange('variables', JSON.parse(e.target.value)); } catch { /* ignore invalid JSON */ } }}
            placeholder='{"key": "value"}'
            className="font-mono text-sm bg-background/50 min-h-[120px]"
          />
        </div>
      );

    case 'data-transform':
      return (
        <>
          <div className="space-y-2">
            <Label>Operation</Label>
            <select value={(config.operation as string) || 'map'} onChange={(e) => onChange('operation', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
              <option value="map">Map</option><option value="filter">Filter</option><option value="reduce">Reduce</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Expression</Label>
            <Textarea value={(config.expression as string) || ''} onChange={(e) => onChange('expression', e.target.value)} placeholder="input.map(item => item.name)" className="font-mono text-sm bg-background/50 min-h-[100px]" />
          </div>
        </>
      );

    case 'switch':
      return (
        <div className="space-y-2">
          <Label>Cases (JSON array)</Label>
          <Textarea
            value={JSON.stringify(config.cases || [], null, 2)}
            onChange={(e) => { try { onChange('cases', JSON.parse(e.target.value)); } catch { /* ignore invalid JSON */ } }}
            placeholder='[{"condition": "input.type === \"a\"", "label": "Case A"}]'
            className="font-mono text-sm bg-background/50 min-h-[120px]"
          />
        </div>
      );

    case 'loop':
      return (
        <>
          <div className="space-y-2">
            <Label>Array Path</Label>
            <Input value={(config.arrayPath as string) || ''} onChange={(e) => onChange('arrayPath', e.target.value)} placeholder="input.items" className="font-mono bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Batch Size</Label>
            <Input type="number" value={String(config.batchSize || 1)} onChange={(e) => onChange('batchSize', Number(e.target.value))} min={1} className="bg-background/50" />
          </div>
        </>
      );

    case 'merge':
      return (
        <div className="space-y-2">
          <Label>Merge Mode</Label>
          <select value={(config.mode as string) || 'append'} onChange={(e) => onChange('mode', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
            <option value="append">Append</option><option value="zip">Zip</option><option value="combine">Combine</option>
          </select>
        </div>
      );

    case 'webhook-response':
      return (
        <>
          <div className="space-y-2">
            <Label>Status Code</Label>
            <Input type="number" value={String(config.statusCode || 200)} onChange={(e) => onChange('statusCode', Number(e.target.value))} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Response Body</Label>
            <Textarea value={(config.body as string) || ''} onChange={(e) => onChange('body', e.target.value)} placeholder='{"success": true}' className="font-mono text-sm bg-background/50 min-h-[80px]" />
          </div>
        </>
      );

    case 'ai-extract':
      return (
        <>
          <div className="space-y-2">
            <Label>Schema (JSON)</Label>
            <Textarea
              value={JSON.stringify(config.schema || {}, null, 2)}
              onChange={(e) => { try { onChange('schema', JSON.parse(e.target.value)); } catch { /* ignore invalid JSON */ } }}
              placeholder='{"name": "string", "email": "string"}'
              className="font-mono text-sm bg-background/50 min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea value={(config.instructions as string) || ''} onChange={(e) => onChange('instructions', e.target.value)} placeholder="Extract contact info from..." className="bg-background/50 min-h-[60px]" />
          </div>
        </>
      );

    case 'ai-summarize':
      return (
        <>
          <div className="space-y-2">
            <Label>Max Length (words)</Label>
            <Input type="number" value={String(config.maxLength || 200)} onChange={(e) => onChange('maxLength', Number(e.target.value))} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>Style</Label>
            <select value={(config.style as string) || 'concise'} onChange={(e) => onChange('style', e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm">
              <option value="concise">Concise</option><option value="detailed">Detailed</option><option value="bullet_points">Bullet Points</option>
            </select>
          </div>
        </>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          Configure this node to customize its behavior.
        </p>
      );
  }
}

export default NodeConfigPanel;
