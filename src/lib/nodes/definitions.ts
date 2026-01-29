import type { NodeDefinition } from '@/types/workflow';

export const nodeDefinitions: NodeDefinition[] = [
  // Triggers
  {
    type: 'webhook-trigger',
    label: 'Webhook',
    description: 'Trigger workflow via HTTP request',
    category: 'triggers',
    icon: 'Webhook',
    color: 'hsl(var(--electric))',
    inputs: 0,
    outputs: 1,
    defaultData: {
      method: 'POST',
      path: '/webhook',
      headers: {},
    },
  },
  {
    type: 'schedule-trigger',
    label: 'Schedule',
    description: 'Run on a time-based schedule',
    category: 'triggers',
    icon: 'Clock',
    color: 'hsl(var(--electric))',
    inputs: 0,
    outputs: 1,
    defaultData: {
      cron: '0 * * * *',
      timezone: 'UTC',
    },
  },
  {
    type: 'manual-trigger',
    label: 'Manual',
    description: 'Trigger manually on demand',
    category: 'triggers',
    icon: 'Play',
    color: 'hsl(var(--electric))',
    inputs: 0,
    outputs: 1,
    defaultData: {},
  },
  
  // Actions
  {
    type: 'http-request',
    label: 'HTTP Request',
    description: 'Make HTTP requests to any API',
    category: 'actions',
    icon: 'Globe',
    color: 'hsl(var(--neon))',
    inputs: 1,
    outputs: 1,
    defaultData: {
      method: 'GET',
      url: '',
      headers: {},
      body: '',
    },
  },
  {
    type: 'code-node',
    label: 'Code',
    description: 'Execute custom JavaScript code',
    category: 'actions',
    icon: 'Code',
    color: 'hsl(var(--neon))',
    inputs: 1,
    outputs: 1,
    defaultData: {
      code: '// Your code here\nreturn input;',
      language: 'javascript',
    },
  },
  {
    type: 'data-transform',
    label: 'Transform',
    description: 'Map, filter, and format data',
    category: 'actions',
    icon: 'Shuffle',
    color: 'hsl(var(--neon))',
    inputs: 1,
    outputs: 1,
    defaultData: {
      operation: 'map',
      expression: '',
    },
  },
  
  // Logic
  {
    type: 'if-else',
    label: 'If/Else',
    description: 'Branch based on conditions',
    category: 'logic',
    icon: 'GitBranch',
    color: 'hsl(var(--cyber))',
    inputs: 1,
    outputs: 2,
    defaultData: {
      condition: '',
      operator: 'equals',
      value: '',
    },
  },
  {
    type: 'switch',
    label: 'Switch',
    description: 'Multiple condition branches',
    category: 'logic',
    icon: 'ArrowRightLeft',
    color: 'hsl(var(--cyber))',
    inputs: 1,
    outputs: 3,
    defaultData: {
      cases: [],
      defaultOutput: 0,
    },
  },
  {
    type: 'loop',
    label: 'Loop',
    description: 'Iterate over arrays',
    category: 'logic',
    icon: 'Repeat',
    color: 'hsl(var(--cyber))',
    inputs: 1,
    outputs: 1,
    defaultData: {
      arrayPath: '',
      batchSize: 1,
    },
  },
  {
    type: 'merge',
    label: 'Merge',
    description: 'Combine multiple data streams',
    category: 'logic',
    icon: 'Merge',
    color: 'hsl(var(--cyber))',
    inputs: 2,
    outputs: 1,
    defaultData: {
      mode: 'append',
    },
  },
  
  // AI
  {
    type: 'ai-chat',
    label: 'AI Chat',
    description: 'Send prompts to AI models',
    category: 'ai',
    icon: 'MessageSquare',
    color: 'hsl(var(--glow))',
    inputs: 1,
    outputs: 1,
    defaultData: {
      model: 'google/gemini-2.5-flash',
      systemPrompt: '',
      userPrompt: '',
      temperature: 0.7,
    },
  },
  {
    type: 'ai-extract',
    label: 'AI Extract',
    description: 'Extract structured data with AI',
    category: 'ai',
    icon: 'FileSearch',
    color: 'hsl(var(--glow))',
    inputs: 1,
    outputs: 1,
    defaultData: {
      schema: {},
      instructions: '',
    },
  },
  {
    type: 'ai-summarize',
    label: 'AI Summarize',
    description: 'Summarize content with AI',
    category: 'ai',
    icon: 'FileText',
    color: 'hsl(var(--glow))',
    inputs: 1,
    outputs: 1,
    defaultData: {
      maxLength: 200,
      style: 'concise',
    },
  },
];

export const getNodeDefinition = (type: string): NodeDefinition | undefined => {
  return nodeDefinitions.find(n => n.type === type);
};

export const getNodesByCategory = (category: string): NodeDefinition[] => {
  return nodeDefinitions.filter(n => n.category === category);
};

export const nodeCategories = [
  { id: 'triggers', label: 'Triggers', icon: 'Zap', description: 'Start your workflow' },
  { id: 'actions', label: 'Actions', icon: 'Play', description: 'Perform operations' },
  { id: 'logic', label: 'Logic', icon: 'GitBranch', description: 'Control flow' },
  { id: 'ai', label: 'AI', icon: 'Sparkles', description: 'AI-powered nodes' },
] as const;
