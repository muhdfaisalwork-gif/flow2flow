import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowSettings,
  NodeCategory,
  NodeType,
  CredentialDependency,
  HandleDefinition,
  AISubNodeAttachment,
  HandleConnectionType,
} from '@/types/workflow';

export interface RawN8nNode {
  id?: string;
  name: string;
  type: string;
  typeVersion?: number;
  position?: [number, number];
  parameters?: Record<string, unknown>;
  credentials?: Record<string, { id?: string; name?: string } | unknown>;
  disabled?: boolean;
  notes?: string;
}

export interface RawN8nConnectionTarget {
  node: string;
  type: string;
  index: number;
}

export type RawN8nConnections = Record<
  string,
  Record<string, Array<Array<RawN8nConnectionTarget> | null>>
>;

export interface RawN8nWorkflow {
  id?: string;
  name?: string;
  description?: string;
  nodes: RawN8nNode[];
  connections?: RawN8nConnections;
  settings?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  tags?: Array<{ name: string } | string>;
}

export interface N8nImportResult {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: WorkflowSettings;
  missingCredentials: CredentialDependency[];
  stickyNotes: string[];
  stats: {
    totalRawNodes: number;
    importedNodes: number;
    importedEdges: number;
    multiBranchNodes: number;
    aiSubNodesWired: number;
    missingCredentialCount: number;
  };
  sourceFormat: 'n8n';
}

export interface ResolvedNodeMeta {
  flowType: NodeType;
  category: NodeCategory;
  canonicalCategory: 'trigger' | 'action' | 'ai' | 'logic' | 'storage';
  icon: string;
  color: string;
  serviceName: string;
  defaultCredentialEnv?: string;
}

interface ServiceMappingEntry {
  match: RegExp | string;
  flowType: NodeType;
  category: NodeCategory;
  canonicalCategory: 'trigger' | 'action' | 'ai' | 'logic' | 'storage';
  icon: string;
  color: string;
  serviceName: string;
  defaultCredentialEnv?: string;
}

/**
 * 55+ Service Icon & Category Resolver Table
 * Maps raw n8n node type strings (n8n-nodes-base.*, @n8n/n8n-nodes-langchain.*)
 * to canonical categories, Shadow Flow node types, colors, and Lucide SVG icon identifiers.
 */
export const SERVICE_RESOLVER_TABLE: ServiceMappingEntry[] = [
  // === CONNECTORS & MCP ===
  {
    match: /(mcp|model-context-protocol)/i,
    flowType: 'mcp-tool',
    category: 'connectors',
    canonicalCategory: 'action',
    icon: 'Bot',
    color: '#8B5CF6',
    serviceName: 'Model Context Protocol',
  },
  {
    match: /(activepieces|piece)/i,
    flowType: 'activepieces-action',
    category: 'connectors',
    canonicalCategory: 'action',
    icon: 'Boxes',
    color: '#EC4899',
    serviceName: 'Activepieces Piece',
  },

  // === TRIGGERS ===
  {
    match: /webhook/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'Webhook',
    color: '#3B82F6',
    serviceName: 'Webhook',
  },
  {
    match: /(scheduleTrigger|cron|interval)/i,
    flowType: 'schedule-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'Clock',
    color: '#3B82F6',
    serviceName: 'Schedule Trigger',
  },
  {
    match: /(manualTrigger|start|formTrigger|chatTrigger)/i,
    flowType: 'manual-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'Play',
    color: '#3B82F6',
    serviceName: 'Manual / Form Trigger',
  },
  {
    match: /(emailReadImap|gmailTrigger)/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'Mail',
    color: '#EA4335',
    serviceName: 'Email Trigger',
    defaultCredentialEnv: 'GMAIL_OAUTH_TOKEN',
  },
  {
    match: /stripeTrigger/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'CreditCard',
    color: '#635BFF',
    serviceName: 'Stripe Trigger',
    defaultCredentialEnv: 'STRIPE_SECRET_KEY',
  },
  {
    match: /githubTrigger/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'GitBranch',
    color: '#24292F',
    serviceName: 'GitHub Trigger',
    defaultCredentialEnv: 'GITHUB_ACCESS_TOKEN',
  },
  {
    match: /telegramTrigger/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'Send',
    color: '#26A5E4',
    serviceName: 'Telegram Trigger',
    defaultCredentialEnv: 'TELEGRAM_BOT_TOKEN',
  },
  {
    match: /slackTrigger/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'Hash',
    color: '#E01E5A',
    serviceName: 'Slack Trigger',
    defaultCredentialEnv: 'SLACK_BOT_TOKEN',
  },
  {
    match: /typeformTrigger/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'FileText',
    color: '#262627',
    serviceName: 'Typeform Trigger',
    defaultCredentialEnv: 'TYPEFORM_API_TOKEN',
  },
  {
    match: /shopifyTrigger/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'ShoppingCart',
    color: '#95BF47',
    serviceName: 'Shopify Trigger',
    defaultCredentialEnv: 'SHOPIFY_ACCESS_TOKEN',
  },
  {
    match: /s3Trigger|awsS3Trigger/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'HardDrive',
    color: '#FF9900',
    serviceName: 'AWS S3 Trigger',
    defaultCredentialEnv: 'AWS_ACCESS_KEY_ID',
  },
  {
    match: /Trigger$/i,
    flowType: 'webhook-trigger',
    category: 'triggers',
    canonicalCategory: 'trigger',
    icon: 'Zap',
    color: '#3B82F6',
    serviceName: 'Event Trigger',
  },

  // === LANGCHAIN & AI NODES ===
  {
    match: /langchain\.agent/i,
    flowType: 'ai-agent',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Bot',
    color: '#8B5CF6',
    serviceName: 'AI Autonomous Agent',
    defaultCredentialEnv: 'OPENAI_API_KEY',
  },
  {
    match: /(lmChatAnthropic|anthropic)/i,
    flowType: 'ai-chat',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Sparkles',
    color: '#D97757',
    serviceName: 'Anthropic Claude',
    defaultCredentialEnv: 'ANTHROPIC_API_KEY',
  },
  {
    match: /(lmChatGoogleGemini|lmChatGoogleVertex|googleGemini|gemini)/i,
    flowType: 'ai-chat',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Sparkles',
    color: '#4285F4',
    serviceName: 'Google Gemini',
    defaultCredentialEnv: 'GOOGLE_GEMINI_API_KEY',
  },
  {
    match: /(lmChatGroq|groq)/i,
    flowType: 'ai-chat',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Cpu',
    color: '#F55036',
    serviceName: 'Groq LPU',
    defaultCredentialEnv: 'GROQ_API_KEY',
  },
  {
    match: /(lmChatOllama|ollama)/i,
    flowType: 'ai-chat',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Terminal',
    color: '#10B981',
    serviceName: 'Ollama Local LLM',
  },
  {
    match: /(lmChatOpenAi|openAi|chatOpenAi)/i,
    flowType: 'ai-chat',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Brain',
    color: '#10A37F',
    serviceName: 'OpenAI GPT',
    defaultCredentialEnv: 'OPENAI_API_KEY',
  },
  {
    match: /(embeddingsOpenAi|embeddings)/i,
    flowType: 'ai-extract',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Layers',
    color: '#8B5CF6',
    serviceName: 'Vector Embeddings',
    defaultCredentialEnv: 'OPENAI_API_KEY',
  },
  {
    match: /(vectorStoreSupabase|vectorStorePinecone|vectorStoreQdrant|vectorStorePgvector|vectorStore)/i,
    flowType: 'db-query',
    category: 'ai',
    canonicalCategory: 'storage',
    icon: 'Database',
    color: '#3ECF8E',
    serviceName: 'Vector Store',
    defaultCredentialEnv: 'VECTOR_DB_API_KEY',
  },
  {
    match: /(memoryBufferWindow|memoryRedisChat|memoryPostgresChat|memory)/i,
    flowType: 'set-variable',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Cpu',
    color: '#EC4899',
    serviceName: 'Conversation Memory',
  },
  {
    match: /(textSplitter|documentDefaultDataLoader)/i,
    flowType: 'data-transform',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'FileText',
    color: '#A855F7',
    serviceName: 'Text Splitter / Loader',
  },
  {
    match: /(informationExtractor|outputParser|chainLlm|chainRetrievalQa)/i,
    flowType: 'ai-extract',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'FileSearch',
    color: '#8B5CF6',
    serviceName: 'AI Extractor / Chain',
    defaultCredentialEnv: 'OPENAI_API_KEY',
  },
  {
    match: /(chainSummarization|summarize)/i,
    flowType: 'ai-summarize',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'FileText',
    color: '#8B5CF6',
    serviceName: 'AI Summarizer',
    defaultCredentialEnv: 'OPENAI_API_KEY',
  },
  {
    match: /(elevenLabs|whisper|audio)/i,
    flowType: 'ai-chat',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Mic',
    color: '#6366F1',
    serviceName: 'Voice AI (Whisper/ElevenLabs)',
    defaultCredentialEnv: 'ELEVENLABS_API_KEY',
  },
  {
    match: /(perplexity|firecrawl|serpApi|tavily)/i,
    flowType: 'http-request',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Search',
    color: '#06B6D4',
    serviceName: 'AI Web Search / Crawler',
    defaultCredentialEnv: 'SEARCH_API_KEY',
  },
  {
    match: /langchain/i,
    flowType: 'ai-chat',
    category: 'ai',
    canonicalCategory: 'ai',
    icon: 'Sparkles',
    color: '#8B5CF6',
    serviceName: 'LangChain AI Node',
  },

  // === LOGIC & FLOW CONTROL ===
  {
    match: /\.if$/i,
    flowType: 'if-else',
    category: 'logic',
    canonicalCategory: 'logic',
    icon: 'GitBranch',
    color: '#06B6D4',
    serviceName: 'If / Else Condition',
  },
  {
    match: /\.switch$/i,
    flowType: 'switch',
    category: 'logic',
    canonicalCategory: 'logic',
    icon: 'ArrowRightLeft',
    color: '#06B6D4',
    serviceName: 'Switch Router',
  },
  {
    match: /(splitInBatches|itemLists|splitOut)/i,
    flowType: 'loop',
    category: 'logic',
    canonicalCategory: 'logic',
    icon: 'Repeat',
    color: '#06B6D4',
    serviceName: 'Loop Over Items',
  },
  {
    match: /\.merge$/i,
    flowType: 'merge',
    category: 'logic',
    canonicalCategory: 'logic',
    icon: 'Merge',
    color: '#06B6D4',
    serviceName: 'Merge Streams',
  },
  {
    match: /(\.filter$|removeDuplicates|limit|sort)/i,
    flowType: 'filter',
    category: 'logic',
    canonicalCategory: 'logic',
    icon: 'Filter',
    color: '#06B6D4',
    serviceName: 'Filter Items',
  },
  {
    match: /\.wait$/i,
    flowType: 'delay',
    category: 'logic',
    canonicalCategory: 'logic',
    icon: 'Timer',
    color: '#06B6D4',
    serviceName: 'Wait / Delay',
  },
  {
    match: /(\.set$|editFields)/i,
    flowType: 'set-variable',
    category: 'logic',
    canonicalCategory: 'logic',
    icon: 'Variable',
    color: '#06B6D4',
    serviceName: 'Set Fields',
  },
  {
    match: /(\.code$|\.function$|\.functionItem$|python)/i,
    flowType: 'code-node',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Code',
    color: '#F59E0B',
    serviceName: 'Code Runner',
  },

  // === DATABASES & STORAGE ===
  {
    match: /supabase/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'Database',
    color: '#3ECF8E',
    serviceName: 'Supabase',
    defaultCredentialEnv: 'SUPABASE_SERVICE_KEY',
  },
  {
    match: /(postgres|mysql|mariadb|mssql|questDb|timescaleDb)/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'Database',
    color: '#336791',
    serviceName: 'SQL Database',
    defaultCredentialEnv: 'DATABASE_URL',
  },
  {
    match: /(mongoDb|dynamodb|couchbase|firebase)/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'Database',
    color: '#47A248',
    serviceName: 'NoSQL Database',
    defaultCredentialEnv: 'MONGODB_URI',
  },
  {
    match: /redis/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'Server',
    color: '#DC382D',
    serviceName: 'Redis Cache',
    defaultCredentialEnv: 'REDIS_URL',
  },
  {
    match: /snowflake|bigQuery|clickhouse|databricks/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'Database',
    color: '#29B5E8',
    serviceName: 'Data Warehouse',
    defaultCredentialEnv: 'SNOWFLAKE_API_KEY',
  },
  {
    match: /googleSheets/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'Table',
    color: '#0F9D58',
    serviceName: 'Google Sheets',
    defaultCredentialEnv: 'GOOGLE_SHEETS_OAUTH',
  },
  {
    match: /airtable/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'Table',
    color: '#18BFFF',
    serviceName: 'Airtable',
    defaultCredentialEnv: 'AIRTABLE_API_KEY',
  },
  {
    match: /notion/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'BookOpen',
    color: '#000000',
    serviceName: 'Notion',
    defaultCredentialEnv: 'NOTION_API_KEY',
  },
  {
    match: /(googleDrive|dropbox|oneDrive|box|awsS3|\.s3$|ftp)/i,
    flowType: 'db-query',
    category: 'actions',
    canonicalCategory: 'storage',
    icon: 'HardDrive',
    color: '#4285F4',
    serviceName: 'Cloud Storage',
    defaultCredentialEnv: 'CLOUD_STORAGE_KEY',
  },

  // === MESSAGING, EMAIL & CRM ===
  {
    match: /slack/i,
    flowType: 'slack-message',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Hash',
    color: '#E01E5A',
    serviceName: 'Slack',
    defaultCredentialEnv: 'SLACK_BOT_TOKEN',
  },
  {
    match: /discord/i,
    flowType: 'slack-message',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'MessageSquare',
    color: '#5865F2',
    serviceName: 'Discord',
    defaultCredentialEnv: 'DISCORD_BOT_TOKEN',
  },
  {
    match: /telegram/i,
    flowType: 'slack-message',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Send',
    color: '#26A5E4',
    serviceName: 'Telegram',
    defaultCredentialEnv: 'TELEGRAM_BOT_TOKEN',
  },
  {
    match: /(whatsApp|twilio)/i,
    flowType: 'slack-message',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Phone',
    color: '#25D366',
    serviceName: 'WhatsApp / Twilio',
    defaultCredentialEnv: 'TWILIO_AUTH_TOKEN',
  },
  {
    match: /(gmail|emailSend|sendGrid|mailchimp|resend)/i,
    flowType: 'email-send',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Mail',
    color: '#EA4335',
    serviceName: 'Email / Gmail',
    defaultCredentialEnv: 'SMTP_OR_GMAIL_KEY',
  },
  {
    match: /(hubspot|salesforce|pipedrive|zoho|copper)/i,
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Users',
    color: '#FF7A59',
    serviceName: 'CRM (HubSpot/Salesforce)',
    defaultCredentialEnv: 'CRM_API_KEY',
  },
  {
    match: /(stripe|quickbooks|paypal|wise)/i,
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'CreditCard',
    color: '#635BFF',
    serviceName: 'Stripe / Billing',
    defaultCredentialEnv: 'STRIPE_SECRET_KEY',
  },
  {
    match: /(shopify|wooCommerce|klaviyo)/i,
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'ShoppingCart',
    color: '#95BF47',
    serviceName: 'E-Commerce',
    defaultCredentialEnv: 'SHOPIFY_ACCESS_TOKEN',
  },
  {
    match: /(jira|linear|asana|trello|monday|clickup|todoist)/i,
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'CheckSquare',
    color: '#0052CC',
    serviceName: 'Project Management',
    defaultCredentialEnv: 'JIRA_API_TOKEN',
  },
  {
    match: /(github|gitlab|bitbucket|docker|kubernetes|pagerDuty|datadog)/i,
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Terminal',
    color: '#24292F',
    serviceName: 'DevOps & Git',
    defaultCredentialEnv: 'GITHUB_ACCESS_TOKEN',
  },
  {
    match: /(wordpress|webflow|ghost|medium|twitter|linkedIn|instagram|youtube)/i,
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Globe',
    color: '#1DA1F2',
    serviceName: 'Social & CMS',
    defaultCredentialEnv: 'CMS_SOCIAL_API_KEY',
  },
  {
    match: /respondToWebhook/i,
    flowType: 'webhook-response',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Send',
    color: '#10B981',
    serviceName: 'Webhook Response',
  },
  {
    match: /(httpRequest|graphql|webhook)/i,
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Globe',
    color: '#8B5CF6',
    serviceName: 'HTTP Request',
  },
  {
    match: /(readPdf|extractFromFile|convertToFile|writeBinaryFile|compression|crypto)/i,
    flowType: 'data-transform',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'FileText',
    color: '#F59E0B',
    serviceName: 'Document / File Processor',
  },
];

/**
 * Resolves any raw n8n node type string into Shadow Flow metadata, category, and Lucide icon.
 */
export function resolveN8nNodeMeta(rawN8nType: string): ResolvedNodeMeta {
  for (const entry of SERVICE_RESOLVER_TABLE) {
    if (typeof entry.match === 'string') {
      if (rawN8nType.toLowerCase().includes(entry.match.toLowerCase())) {
        return {
          flowType: entry.flowType,
          category: entry.category,
          canonicalCategory: entry.canonicalCategory,
          icon: entry.icon,
          color: entry.color,
          serviceName: entry.serviceName,
          defaultCredentialEnv: entry.defaultCredentialEnv,
        };
      }
    } else if (entry.match.test(rawN8nType)) {
      return {
        flowType: entry.flowType,
        category: entry.category,
        canonicalCategory: entry.canonicalCategory,
        icon: entry.icon,
        color: entry.color,
        serviceName: entry.serviceName,
        defaultCredentialEnv: entry.defaultCredentialEnv,
      };
    }
  }

  // Fallback for unknown custom community nodes
  const cleanName = rawN8nType
    .replace(/^(@n8n\/)?n8n-nodes-(base|langchain)\./i, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();

  return {
    flowType: 'http-request',
    category: 'actions',
    canonicalCategory: 'action',
    icon: 'Globe',
    color: '#8B5CF6',
    serviceName: cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : 'Integration',
  };
}

/**
 * Missing Credentials Dependency Analyzer
 * Scans node credentials objects and parameter expressions across all imported nodes
 * and produces a structured list of required API keys/tokens.
 */
export function analyzeCredentials(
  rawNodes: RawN8nNode[],
  flowNodes: WorkflowNode[]
): CredentialDependency[] {
  const credMap = new Map<string, CredentialDependency>();

  const registerCred = (
    credKey: string,
    displayName: string,
    service: string,
    envVarName: string,
    nodeId: string,
    nodeName: string
  ) => {
    const existing = credMap.get(envVarName);
    if (existing) {
      if (!existing.nodeIds.includes(nodeId)) existing.nodeIds.push(nodeId);
      if (!existing.nodeNames.includes(nodeName)) existing.nodeNames.push(nodeName);
    } else {
      credMap.set(envVarName, {
        id: credKey,
        name: displayName,
        service,
        envVarName,
        nodeIds: [nodeId],
        nodeNames: [nodeName],
        isConfigured: false,
      });
    }
  };

  rawNodes.forEach((rawNode) => {
    if (rawNode.type === 'n8n-nodes-base.stickyNote') return;

    const matchingFlowNode = flowNodes.find((n) => n.data.label === rawNode.name);
    const nodeId = matchingFlowNode?.id || rawNode.id || rawNode.name;
    const meta = resolveN8nNodeMeta(rawNode.type);

    // 1. Check explicit credentials object on the n8n node
    if (rawNode.credentials && typeof rawNode.credentials === 'object') {
      Object.entries(rawNode.credentials).forEach(([credType, credVal]) => {
        const credObj = credVal as { id?: string; name?: string } | undefined;
        const envVar =
          meta.defaultCredentialEnv ||
          `${credType.replace(/([A-Z])/g, '_$1').toUpperCase()}_KEY`;
        const label = credObj?.name || `${meta.serviceName} (${credType})`;
        registerCred(credType, label, meta.serviceName, envVar, nodeId, rawNode.name);
      });
    } else if (meta.defaultCredentialEnv) {
      // 2. Infer credential requirement from service metadata if not explicitly attached
      registerCred(
        meta.defaultCredentialEnv.toLowerCase(),
        `${meta.serviceName} Credential`,
        meta.serviceName,
        meta.defaultCredentialEnv,
        nodeId,
        rawNode.name
      );
    }

    // 3. Scan parameters for $env.VAR_NAME references
    const paramStr = JSON.stringify(rawNode.parameters || {});
    const envMatches = paramStr.matchAll(/\$env\.([A-Z0-9_]+)/gi);
    for (const match of envMatches) {
      const envVar = match[1].toUpperCase();
      registerCred(
        envVar.toLowerCase(),
        `Environment Secret (${envVar})`,
        meta.serviceName,
        envVar,
        nodeId,
        rawNode.name
      );
    }
  });

  return Array.from(credMap.values());
}

/**
 * Topological Auto-Layout Algorithm (Kahn's Algorithm)
 * Evaluates in-degree and adjacency matrices to compute collision-free,
 * left-to-right horizontal coordinate planes (spacing: depth * 320px, lane * 150px).
 */
export function autoLayoutWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: { horizontalSpacing?: number; verticalSpacing?: number; startX?: number; startY?: number } = {}
): WorkflowNode[] {
  if (nodes.length === 0) return [];

  const hSpacing = options.horizontalSpacing ?? 320;
  const vSpacing = options.verticalSpacing ?? 150;
  const startX = options.startX ?? 100;
  const startY = options.startY ?? 140;

  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const depthMap = new Map<string, number>();

  nodes.forEach((node) => {
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
    depthMap.set(node.id, 0);
  });

  edges.forEach((edge) => {
    if (adj.has(edge.source) && inDegree.has(edge.target) && edge.source !== edge.target) {
      adj.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  // Kahn's queue initialization with 0 in-degree nodes (triggers first)
  const queue: string[] = [];
  nodes.forEach((node) => {
    if ((inDegree.get(node.id) || 0) === 0) {
      queue.push(node.id);
    }
  });

  // If cycle prevented any 0 in-degree node, pick the first trigger or first node
  if (queue.length === 0 && nodes.length > 0) {
    const trigger = nodes.find((n) => n.data.category === 'triggers' || n.data.category === 'trigger');
    queue.push(trigger ? trigger.id : nodes[0].id);
  }

  const visited = new Set<string>();
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    visited.add(currentId);
    const currentDepth = depthMap.get(currentId) || 0;

    for (const neighborId of adj.get(currentId) || []) {
      const nextDepth = Math.max(depthMap.get(neighborId) || 0, currentDepth + 1);
      depthMap.set(neighborId, nextDepth);

      const newDeg = (inDegree.get(neighborId) || 1) - 1;
      inDegree.set(neighborId, newDeg);
      if (newDeg <= 0 && !visited.has(neighborId) && !queue.includes(neighborId)) {
        queue.push(neighborId);
      }
    }
  }

  // Handle any unvisited nodes (e.g., in disconnected components or cycles)
  nodes.forEach((node, idx) => {
    if (!visited.has(node.id)) {
      depthMap.set(node.id, idx);
    }
  });

  // Group nodes by depth column
  const columns = new Map<number, WorkflowNode[]>();
  nodes.forEach((node) => {
    const depth = depthMap.get(node.id) || 0;
    if (!columns.has(depth)) columns.set(depth, []);
    columns.get(depth)!.push(node);
  });

  // Assign coordinates: x = startX + depth * 320, y = centered per lane * 150
  const positionedMap = new Map<string, { x: number; y: number }>();
  columns.forEach((colNodes, depth) => {
    const totalHeight = (colNodes.length - 1) * vSpacing;
    const baseOffsetY = startY + Math.max(0, (300 - totalHeight) / 2);
    colNodes.forEach((node, laneIndex) => {
      positionedMap.set(node.id, {
        x: startX + depth * hSpacing,
        y: baseOffsetY + laneIndex * vSpacing,
      });
    });
  });

  return nodes.map((node) => ({
    ...node,
    position: positionedMap.get(node.id) || node.position,
  }));
}

/**
 * Checks whether existing node positions have collisions or invalid coordinates.
 */
function needsAutoLayout(nodes: WorkflowNode[]): boolean {
  if (nodes.length <= 1) return false;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = Math.abs(nodes[i].position.x - nodes[j].position.x);
      const dy = Math.abs(nodes[i].position.y - nodes[j].position.y);
      if (dx < 80 && dy < 60) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Universal n8n Workflow JSON Importer
 * Ingests raw n8n JSON, filters sticky notes, maps 45+ services, translates multi-output
 * branches (output_0, output_1) and LangChain AI sub-node handles, analyzes missing credentials,
 * and computes collision-free topological layout.
 */
export function parseN8nWorkflow(
  input: string | RawN8nWorkflow,
  options: { forceAutoLayout?: boolean } = {}
): N8nImportResult {
  const rawData: RawN8nWorkflow =
    typeof input === 'string' ? (JSON.parse(input) as RawN8nWorkflow) : input;

  if (!rawData || !Array.isArray(rawData.nodes)) {
    throw new Error('Invalid n8n workflow JSON: missing "nodes" array.');
  }

  const stickyNotes: string[] = [];
  const executableRawNodes: RawN8nNode[] = [];

  for (const rawNode of rawData.nodes) {
    if (rawNode.type === 'n8n-nodes-base.stickyNote') {
      const noteText = String(rawNode.parameters?.content || '').trim();
      if (noteText) stickyNotes.push(noteText);
    } else {
      executableRawNodes.push(rawNode);
    }
  }

  // Normalize coordinate offset so negative n8n coordinates map cleanly to positive canvas space
  let minX = Infinity;
  let minY = Infinity;
  executableRawNodes.forEach((n) => {
    if (Array.isArray(n.position) && n.position.length >= 2) {
      if (n.position[0] < minX) minX = n.position[0];
      if (n.position[1] < minY) minY = n.position[1];
    }
  });
  const offsetX = Number.isFinite(minX) && minX < 80 ? 100 - minX : 0;
  const offsetY = Number.isFinite(minY) && minY < 80 ? 120 - minY : 0;

  const nodeByName = new Map<string, WorkflowNode>();
  let multiBranchNodes = 0;

  const nodes: WorkflowNode[] = executableRawNodes.map((rawNode, index) => {
    const meta = resolveN8nNodeMeta(rawNode.type);
    const nodeId = rawNode.id ? `n8n-${rawNode.id}` : `node-${index + 1}`;
    const posX = Array.isArray(rawNode.position) ? rawNode.position[0] + offsetX : 100 + index * 320;
    const posY = Array.isArray(rawNode.position) ? rawNode.position[1] + offsetY : 200;

    // Determine multi-output handles for branching nodes
    const isBranching =
      meta.flowType === 'if-else' ||
      meta.flowType === 'filter' ||
      meta.flowType === 'switch' ||
      /(\.if$|\.switch$|\.filter$)/i.test(rawNode.type);

    const outputs: HandleDefinition[] = isBranching
      ? [
          { id: 'output_0', label: meta.flowType === 'switch' ? 'Case 0' : 'True / Main', type: 'main', index: 0 },
          { id: 'output_1', label: meta.flowType === 'switch' ? 'Case 1' : 'False / Alt', type: 'main', index: 1 },
        ]
      : [{ id: 'output_0', label: 'Main', type: 'main', index: 0 }];

    if (isBranching) multiBranchNodes++;

    // Normalize parameters into Shadow Flow config conventions while preserving all raw parameters
    const rawParams = { ...(rawNode.parameters || {}) };
    const normalizedConfig: Record<string, unknown> = {
      ...rawParams,
      n8nType: rawNode.type,
      n8nTypeVersion: rawNode.typeVersion || 1,
    };

    if (meta.flowType === 'webhook-trigger') {
      normalizedConfig.method = rawParams.httpMethod || rawParams.method || 'POST';
      normalizedConfig.path = rawParams.path || '/webhook';
    } else if (meta.flowType === 'http-request') {
      normalizedConfig.method = rawParams.method || rawParams.requestMethod || 'GET';
      normalizedConfig.url = rawParams.url || '';
    } else if (meta.flowType === 'code-node') {
      normalizedConfig.code = rawParams.jsCode || rawParams.pythonCode || rawParams.functionCode || rawParams.code || 'return input;';
    } else if (meta.flowType === 'slack-message') {
      normalizedConfig.channel = rawParams.channel || rawParams.chatId || '#general';
      normalizedConfig.message = rawParams.text || rawParams.message || '';
    } else if (meta.flowType === 'email-send') {
      normalizedConfig.to = rawParams.toEmail || rawParams.sendTo || rawParams.to || '';
      normalizedConfig.subject = rawParams.subject || '';
      normalizedConfig.body = rawParams.text || rawParams.html || rawParams.message || '';
    } else if (meta.flowType === 'ai-agent' || meta.flowType === 'ai-chat') {
      normalizedConfig.model = rawParams.model || 'gpt-4o';
      normalizedConfig.userPrompt = rawParams.text || rawParams.prompt || rawParams.userPrompt || '';
      const opts = (rawParams.options as Record<string, unknown>) || {};
      normalizedConfig.systemPrompt = opts.systemMessage || rawParams.systemPrompt || 'You are an autonomous AI workflow agent.';
    }

    const wfNode: WorkflowNode = {
      id: nodeId,
      type: 'custom',
      position: { x: posX, y: posY },
      data: {
        label: rawNode.name || meta.serviceName,
        type: meta.flowType,
        category: meta.category,
        icon: meta.icon,
        color: meta.color,
        config: normalizedConfig,
        isConfigured: true,
        n8nType: rawNode.type,
        serviceName: meta.serviceName,
        executionStatus: 'idle',
        outputs,
        aiSubNodes: [],
      },
    };

    nodeByName.set(rawNode.name, wfNode);
    return wfNode;
  });

  // Wire connections (both standard main[0]/main[1] and specialized LangChain AI handles)
  const edges: WorkflowEdge[] = [];
  let aiSubNodesWired = 0;
  const connections = rawData.connections || {};

  Object.entries(connections).forEach(([sourceNodeName, connMatrix]) => {
    const sourceNode = nodeByName.get(sourceNodeName);
    if (!sourceNode || !connMatrix) return;

    Object.entries(connMatrix).forEach(([connectionType, branches]) => {
      if (!Array.isArray(branches)) return;

      const isAiConnection = connectionType.startsWith('ai_');

      branches.forEach((branchTargets, branchIndex) => {
        if (!Array.isArray(branchTargets)) return;

        branchTargets.forEach((targetInfo, targetIdx) => {
          if (!targetInfo || !targetInfo.node) return;
          const targetNode = nodeByName.get(targetInfo.node);
          if (!targetNode) return;

          if (isAiConnection) {
            // Wire LangChain sub-node (Model, Memory, Tool, Embedding, TextSplitter) into parent Agent/Vector node
            aiSubNodesWired++;
            const subAttachment: AISubNodeAttachment = {
              id: sourceNode.id,
              label: sourceNode.data.label,
              role: connectionType as HandleConnectionType,
              n8nType: sourceNode.data.n8nType || String(sourceNode.data.type),
              icon: sourceNode.data.icon,
              config: sourceNode.data.config,
            };
            targetNode.data.aiSubNodes = [...(targetNode.data.aiSubNodes || []), subAttachment];

            edges.push({
              id: `edge-ai-${sourceNode.id}-${targetNode.id}-${connectionType}-${targetIdx}`,
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: 'output_0',
              type: 'custom',
              animated: true,
              label: connectionType.replace('ai_', 'AI '),
              data: {
                connectionType,
                isAiSubNodeEdge: true,
              },
              style: { stroke: '#A855F7', strokeWidth: 2, strokeDasharray: '5 4' },
            });
          } else {
            // Standard or Multi-Output Branching (main[0] -> output_0, main[1] -> output_1)
            const sourceHandleId = `output_${branchIndex}`;
            const isBranchNode =
              sourceNode.data.type === 'if-else' ||
              sourceNode.data.type === 'filter' ||
              sourceNode.data.type === 'switch' ||
              branches.length > 1;

            // Ensure the source node has the handle definition if n8n has >2 outputs (e.g., Switch)
            if (
              sourceNode.data.outputs &&
              !sourceNode.data.outputs.some((h) => h.id === sourceHandleId)
            ) {
              sourceNode.data.outputs.push({
                id: sourceHandleId,
                label: `Branch ${branchIndex}`,
                type: 'main',
                index: branchIndex,
              });
            }

            const branchLabel = isBranchNode
              ? branchIndex === 0
                ? 'True'
                : branchIndex === 1
                  ? 'False'
                  : `Case ${branchIndex}`
              : undefined;

            const strokeColor = isBranchNode
              ? branchIndex === 0
                ? '#10B981'
                : '#EF4444'
              : '#3B82F6';

            edges.push({
              id: `edge-${sourceNode.id}-${targetNode.id}-${branchIndex}-${targetIdx}`,
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: sourceHandleId,
              type: 'custom',
              animated: true,
              label: branchLabel,
              data: {
                branchIndex,
                sourceHandle: sourceHandleId,
              },
              style: { stroke: strokeColor, strokeWidth: 2 },
            });
          }
        });
      });
    });
  });

  // Analyze missing credentials
  const missingCredentials = analyzeCredentials(executableRawNodes, nodes);

  // Attach credential names to corresponding nodes
  nodes.forEach((node) => {
    const nodeCreds = missingCredentials
      .filter((c) => c.nodeIds.includes(node.id))
      .map((c) => c.envVarName);
    if (nodeCreds.length > 0) {
      node.data.requiredCredentials = nodeCreds;
    }
  });

  // Apply topological auto-layout if forced or if node positions collide
  const layoutedNodes =
    options.forceAutoLayout || needsAutoLayout(nodes)
      ? autoLayoutWorkflow(nodes, edges)
      : nodes;

  const descriptionFromNotes =
    rawData.description ||
    (stickyNotes.length > 0
      ? stickyNotes[0].replace(/^#+\s*/gm, '').slice(0, 240)
      : `Imported n8n workflow (${layoutedNodes.length} nodes, ${edges.length} connections)`);

  return {
    name: rawData.name || 'Imported n8n Workflow',
    description: descriptionFromNotes,
    nodes: layoutedNodes,
    edges,
    settings: {
      timezone: String(rawData.settings?.timezone || 'UTC'),
      retryOnFailure: true,
      maxRetries: 3,
      errorNotification: true,
    },
    missingCredentials,
    stickyNotes,
    stats: {
      totalRawNodes: rawData.nodes.length,
      importedNodes: layoutedNodes.length,
      importedEdges: edges.length,
      multiBranchNodes,
      aiSubNodesWired,
      missingCredentialCount: missingCredentials.length,
    },
    sourceFormat: 'n8n',
  };
}

/**
 * Exports Shadow Flow nodes and edges back into 100% compatible n8n workflow JSON.
 */
export function serializeToN8nJson(
  name: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string {
  const n8nNodes = nodes.map((node) => ({
    id: node.id.replace(/^n8n-/, ''),
    name: node.data.label,
    type: node.data.n8nType || mapFlowTypeToN8n(node.data.type),
    typeVersion: Number(node.data.config?.n8nTypeVersion || 1),
    position: [Math.round(node.position.x), Math.round(node.position.y)] as [number, number],
    parameters: { ...(node.data.config || {}) },
  }));

  const connections: RawN8nConnections = {};

  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceName = sourceNode.data.label;
    if (!connections[sourceName]) {
      connections[sourceName] = { main: [[]] };
    }

    const connType = (edge.data?.connectionType as string) || 'main';
    if (!connections[sourceName][connType]) {
      connections[sourceName][connType] = [[]];
    }

    let branchIdx = 0;
    if (edge.sourceHandle === 'output_1' || edge.sourceHandle === 'false') {
      branchIdx = 1;
    } else if (edge.sourceHandle?.startsWith('output_')) {
      branchIdx = parseInt(edge.sourceHandle.replace('output_', ''), 10) || 0;
    }

    while (connections[sourceName][connType].length <= branchIdx) {
      connections[sourceName][connType].push([]);
    }

    connections[sourceName][connType][branchIdx]!.push({
      node: targetNode.data.label,
      type: connType,
      index: 0,
    });
  });

  return JSON.stringify(
    {
      name,
      nodes: n8nNodes,
      connections,
      active: false,
      settings: { executionOrder: 'v1' },
    },
    null,
    2
  );
}

export function mapFlowTypeToN8n(type: NodeType): string {
  const typeMap: Record<string, string> = {
    'webhook-trigger': 'n8n-nodes-base.webhook',
    'schedule-trigger': 'n8n-nodes-base.scheduleTrigger',
    'manual-trigger': 'n8n-nodes-base.manualTrigger',
    'http-request': 'n8n-nodes-base.httpRequest',
    'code-node': 'n8n-nodes-base.code',
    'data-transform': 'n8n-nodes-base.set',
    'email-send': 'n8n-nodes-base.emailSend',
    'slack-message': 'n8n-nodes-base.slack',
    'db-query': 'n8n-nodes-base.postgres',
    'webhook-response': 'n8n-nodes-base.respondToWebhook',
    'if-else': 'n8n-nodes-base.if',
    switch: 'n8n-nodes-base.switch',
    loop: 'n8n-nodes-base.splitInBatches',
    merge: 'n8n-nodes-base.merge',
    filter: 'n8n-nodes-base.filter',
    delay: 'n8n-nodes-base.wait',
    'set-variable': 'n8n-nodes-base.set',
    'ai-chat': '@n8n/n8n-nodes-langchain.lmChatOpenAi',
    'ai-agent': '@n8n/n8n-nodes-langchain.agent',
    'ai-extract': '@n8n/n8n-nodes-langchain.informationExtractor',
    'ai-summarize': '@n8n/n8n-nodes-langchain.chainSummarization',
  };
  return typeMap[type] || `n8n-nodes-base.${type}`;
}
