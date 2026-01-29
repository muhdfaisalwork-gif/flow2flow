import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, PlayCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUIStore } from '@/stores/uiStore';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getNodeDefinition } from '@/lib/nodes/definitions';

interface NodeConfigPanelProps {
  isOpen: boolean;
}

const NodeConfigPanel: FC<NodeConfigPanelProps> = ({ isOpen }) => {
  const { selectedNodeId, setConfigPanelOpen } = useUIStore();
  const { nodes, updateNode } = useWorkflowStore();

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
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `${selectedNode.data.color}20` }}
              >
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: selectedNode.data.color }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedNode.data.label}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedNode.data.category}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfigPanelOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <Tabs defaultValue="settings" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-4 pt-2 bg-transparent">
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="test" className="gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" />
                Test
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Info
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="settings" className="p-4 space-y-4 m-0">
                {/* Node Label */}
                <div className="space-y-2">
                  <Label htmlFor="node-label">Node Name</Label>
                  <Input
                    id="node-label"
                    value={selectedNode.data.label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    placeholder="Enter node name"
                    className="bg-background/50"
                  />
                </div>

                {/* Dynamic config based on node type */}
                {renderNodeConfig(selectedNode.data.type, selectedNode.data.config, handleConfigChange)}

                <Button onClick={markConfigured} className="w-full mt-4">
                  Mark as Configured
                </Button>
              </TabsContent>

              <TabsContent value="test" className="p-4 m-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Input</Label>
                    <Textarea
                      placeholder='{"key": "value"}'
                      className="font-mono text-sm bg-background/50 min-h-[120px]"
                    />
                  </div>
                  <Button className="w-full">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run Test
                  </Button>
                  <div className="space-y-2">
                    <Label>Output</Label>
                    <div className="p-3 rounded-lg bg-background/50 border border-border min-h-[80px]">
                      <p className="text-sm text-muted-foreground">
                        Run a test to see the output
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="info" className="p-4 m-0">
                {nodeDefinition && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {nodeDefinition.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Inputs</h4>
                      <p className="text-sm text-muted-foreground">
                        {nodeDefinition.inputs} input connection(s)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Outputs</h4>
                      <p className="text-sm text-muted-foreground">
                        {nodeDefinition.outputs} output connection(s)
                      </p>
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

// Render config fields based on node type
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
            <select
              value={(config.method as string) || 'POST'}
              onChange={(e) => onChange('method', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Webhook Path</Label>
            <Input
              value={(config.path as string) || ''}
              onChange={(e) => onChange('path', e.target.value)}
              placeholder="/webhook"
              className="bg-background/50"
            />
          </div>
        </>
      );

    case 'schedule-trigger':
      return (
        <>
          <div className="space-y-2">
            <Label>Cron Expression</Label>
            <Input
              value={(config.cron as string) || ''}
              onChange={(e) => onChange('cron', e.target.value)}
              placeholder="0 * * * *"
              className="font-mono bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              e.g., "0 * * * *" runs every hour
            </p>
          </div>
        </>
      );

    case 'http-request':
      return (
        <>
          <div className="space-y-2">
            <Label>Method</Label>
            <select
              value={(config.method as string) || 'GET'}
              onChange={(e) => onChange('method', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={(config.url as string) || ''}
              onChange={(e) => onChange('url', e.target.value)}
              placeholder="https://api.example.com/..."
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Request Body</Label>
            <Textarea
              value={(config.body as string) || ''}
              onChange={(e) => onChange('body', e.target.value)}
              placeholder='{"key": "value"}'
              className="font-mono text-sm bg-background/50"
            />
          </div>
        </>
      );

    case 'code-node':
      return (
        <div className="space-y-2">
          <Label>JavaScript Code</Label>
          <Textarea
            value={(config.code as string) || ''}
            onChange={(e) => onChange('code', e.target.value)}
            placeholder="// Your code here&#10;return input;"
            className="font-mono text-sm bg-background/50 min-h-[200px]"
          />
        </div>
      );

    case 'ai-chat':
      return (
        <>
          <div className="space-y-2">
            <Label>Model</Label>
            <select
              value={(config.model as string) || 'google/gemini-2.5-flash'}
              onChange={(e) => onChange('model', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm"
            >
              <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="openai/gpt-5">GPT-5</option>
              <option value="openai/gpt-5-mini">GPT-5 Mini</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>System Prompt</Label>
            <Textarea
              value={(config.systemPrompt as string) || ''}
              onChange={(e) => onChange('systemPrompt', e.target.value)}
              placeholder="You are a helpful assistant..."
              className="bg-background/50 min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label>User Prompt</Label>
            <Textarea
              value={(config.userPrompt as string) || ''}
              onChange={(e) => onChange('userPrompt', e.target.value)}
              placeholder="Use {{input}} to reference input data"
              className="bg-background/50 min-h-[80px]"
            />
          </div>
        </>
      );

    case 'if-else':
      return (
        <>
          <div className="space-y-2">
            <Label>Condition Field</Label>
            <Input
              value={(config.condition as string) || ''}
              onChange={(e) => onChange('condition', e.target.value)}
              placeholder="input.status"
              className="font-mono bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Operator</Label>
            <select
              value={(config.operator as string) || 'equals'}
              onChange={(e) => onChange('operator', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background/50 text-sm"
            >
              <option value="equals">Equals</option>
              <option value="not_equals">Not Equals</option>
              <option value="contains">Contains</option>
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              value={(config.value as string) || ''}
              onChange={(e) => onChange('value', e.target.value)}
              placeholder="success"
              className="bg-background/50"
            />
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
