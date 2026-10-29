import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

export type MemoryNodeType = 'workflow' | 'preference' | 'rule' | 'concept' | 'integration';

export interface GraphMemoryNode {
  id: string;
  label: string;
  type: MemoryNodeType;
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface GraphMemoryEdge {
  source: string;
  target: string;
  relationship: string;
  weight?: number;
}

export interface GraphMemoryStore {
  nodes: Record<string, GraphMemoryNode>;
  edges: GraphMemoryEdge[];
  lastSyncedAt: string | null;
}

const STORAGE_KEY = 'shadowflow_graph_memory';

const DEFAULT_SEED_NODES: GraphMemoryNode[] = [
  {
    id: 'rule-offline-first',
    label: 'Offline-First Resilience',
    type: 'rule',
    properties: {
      description: 'System operates fully offline without internet or API keys using Zero-Cost Heuristic and Local Ollama Gemma 4.',
      priority: 1,
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'rule-human-natural',
    label: 'Human-Natural Writing Standard',
    type: 'rule',
    properties: {
      description: 'Use plain verbs, concrete facts, zero corporate filler or chatbot residue.',
      priority: 1,
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'engine-zero-cost-heuristic',
    label: 'Zero-Cost Heuristic Engine',
    type: 'concept',
    properties: {
      provider: 'heuristic',
      description: 'Deterministic offline pattern synthesis, Kahn topological auto-layout, and self-healing repair at $0 cost.',
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'engine-local-ollama',
    label: 'Local Ollama Gemma 4 Engine',
    type: 'concept',
    properties: {
      provider: 'ollama',
      endpoint: 'http://localhost:11434',
      defaultModel: 'gemma4:latest',
      description: 'Local inference engine with private offline execution.',
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'engine-builtin-cloud',
    label: 'Built-in Cloud AI (Groq LPU)',
    type: 'concept',
    properties: {
      provider: 'builtin',
      models: ['qwen/qwen3.8-27b', 'llama-3.3-70b-versatile'],
      description: 'High-speed cloud inference hosted on shadowflow.work edge.',
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'wf-lead-generation',
    label: 'Lead Generation & CRM Pipeline',
    type: 'workflow',
    properties: {
      keywords: ['lead', 'crm', 'enrichment', 'zerobounce', 'clearbit', 'hubspot', 'sales', 'email validation'],
      nodesSummary: ['Webhook Trigger', 'Email Validation (ZeroBounce)', 'Company Enrichment (Clearbit)', 'Lead Scoring', 'CRM Sync & Slack Alert'],
      description: 'Ingests new leads, validates email deliverability, enriches firmographic data, and notifies the team.',
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'wf-deep-research',
    label: 'Autonomous Deep Research Pipeline',
    type: 'workflow',
    properties: {
      keywords: ['research', 'firecrawl', 'perplexity', 'scrape', 'sonnet', 'brief', 'citations'],
      nodesSummary: ['Webhook Trigger', 'Firecrawl Web Scraper', 'Perplexity Citation Engine', 'Claude 3.5 Sonnet Synthesis', 'Slack Report'],
      description: 'Scrapes live web sources via Firecrawl, cross-references citations, and synthesizes an executive research brief.',
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'wf-support-ticket-triage',
    label: 'Inbound Support Ticket Triage',
    type: 'workflow',
    properties: {
      keywords: ['support', 'ticket', 'email', 'triage', 'sentiment', 'helpdesk', 'zendesk'],
      nodesSummary: ['Email Trigger (support@shadowflow.work)', 'Sentiment Classifier', 'Priority Router', 'ZenDesk Ticket Node', 'Auto-Reply'],
      description: 'Triages customer inquiries sent to support@shadowflow.work and routes urgent issues.',
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
  {
    id: 'wf-cloudflare-monitor',
    label: 'Cloudflare Worker Health Monitor',
    type: 'workflow',
    properties: {
      keywords: ['cloudflare', 'worker', 'health', 'ping', 'uptime', 'monitor', 'discord'],
      nodesSummary: ['Cron Schedule (every 5m)', 'HTTP Health Check (shadowflow.work/health)', 'Evaluator Node', 'Discord Webhook'],
      description: 'Monitors edge API health and latency with alerts to Discord.',
    },
    createdAt: '2026-10-29T00:00:00Z',
    updatedAt: '2026-10-29T00:00:00Z',
  },
];

const DEFAULT_SEED_EDGES: GraphMemoryEdge[] = [
  { source: 'engine-zero-cost-heuristic', target: 'rule-offline-first', relationship: 'enforces' },
  { source: 'engine-local-ollama', target: 'rule-offline-first', relationship: 'enforces' },
  { source: 'engine-zero-cost-heuristic', target: 'wf-lead-generation', relationship: 'can_synthesize' },
  { source: 'engine-local-ollama', target: 'wf-lead-generation', relationship: 'can_synthesize' },
  { source: 'engine-builtin-cloud', target: 'wf-lead-generation', relationship: 'can_synthesize' },
  { source: 'engine-zero-cost-heuristic', target: 'wf-deep-research', relationship: 'can_synthesize' },
  { source: 'engine-local-ollama', target: 'wf-deep-research', relationship: 'can_synthesize' },
  { source: 'engine-builtin-cloud', target: 'wf-deep-research', relationship: 'can_synthesize' },
  { source: 'engine-builtin-cloud', target: 'wf-support-ticket-triage', relationship: 'can_synthesize' },
  { source: 'engine-zero-cost-heuristic', target: 'wf-cloudflare-monitor', relationship: 'can_synthesize' },
];

function buildDefaultStore(): GraphMemoryStore {
  const nodes: Record<string, GraphMemoryNode> = {};
  for (const n of DEFAULT_SEED_NODES) {
    nodes[n.id] = { ...n };
  }
  return {
    nodes,
    edges: [...DEFAULT_SEED_EDGES],
    lastSyncedAt: null,
  };
}

let memoryCache: GraphMemoryStore | null = null;

export class GraphMemory {
  private static instance: GraphMemory;
  private store: GraphMemoryStore;

  private constructor() {
    this.store = this.loadFromStorage();
  }

  public static getInstance(): GraphMemory {
    if (!GraphMemory.instance) {
      GraphMemory.instance = new GraphMemory();
    }
    return GraphMemory.instance;
  }

  private loadFromStorage(): GraphMemoryStore {
    if (memoryCache) return memoryCache;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as GraphMemoryStore;
          if (parsed && typeof parsed.nodes === 'object' && Array.isArray(parsed.edges)) {
            // Merge with default seed nodes in case new defaults were added
            const defaults = buildDefaultStore();
            for (const [id, defNode] of Object.entries(defaults.nodes)) {
              if (!parsed.nodes[id]) {
                parsed.nodes[id] = defNode;
              }
            }
            memoryCache = parsed;
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to parse graph memory from localStorage, initializing defaults:', err);
      }
    }

    const defaultStore = buildDefaultStore();
    memoryCache = defaultStore;
    this.persist(defaultStore);
    return defaultStore;
  }

  private persist(store: GraphMemoryStore): void {
    memoryCache = store;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (err) {
        console.warn('Failed to save graph memory to localStorage:', err);
      }
    }
  }

  public getAllNodes(): GraphMemoryNode[] {
    return Object.values(this.store.nodes);
  }

  public getAllEdges(): GraphMemoryEdge[] {
    return [...this.store.edges];
  }

  public getNodeCount(): number {
    return Object.keys(this.store.nodes).length;
  }

  public getEdgeCount(): number {
    return this.store.edges.length;
  }

  /**
   * Dynamic Subgraph Retrieval (GraphRAG):
   * Tokenizes user prompt, matches seed nodes, traverses 1-2 hops, and
   * constructs a compact Markdown context block for LLM prompts.
   */
  public queryGraph(query: string, maxTokens = 500): { context: string; matchedNodeIds: string[] } {
    const rawTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9_\-\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

    if (rawTokens.length === 0) {
      return { context: '', matchedNodeIds: [] };
    }

    // 1. Identify seed nodes with scoring
    const scores = new Map<string, number>();
    for (const node of Object.values(this.store.nodes)) {
      let score = 0;
      const labelLower = node.label.toLowerCase();
      const idLower = node.id.toLowerCase();
      const propText = JSON.stringify(node.properties).toLowerCase();

      for (const token of rawTokens) {
        if (labelLower.includes(token)) score += 3;
        if (idLower.includes(token)) score += 2;
        if (propText.includes(token)) score += 1;
      }

      if (score > 0) {
        scores.set(node.id, score);
      }
    }

    if (scores.size === 0) {
      return { context: '', matchedNodeIds: [] };
    }

    // Sort seed nodes by score descending
    const sortedSeedIds = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    // 2. Perform 1-hop BFS traversal from seeds
    const visited = new Set<string>(sortedSeedIds);
    const relevantEdges: GraphMemoryEdge[] = [];

    for (const edge of this.store.edges) {
      const sourceMatch = visited.has(edge.source);
      const targetMatch = visited.has(edge.target);

      if (sourceMatch && targetMatch) {
        relevantEdges.push(edge);
      } else if (sourceMatch && !visited.has(edge.target) && visited.size < 12) {
        visited.add(edge.target);
        relevantEdges.push(edge);
      } else if (targetMatch && !visited.has(edge.source) && visited.size < 12) {
        visited.add(edge.source);
        relevantEdges.push(edge);
      }
    }

    // 3. Format compact Markdown context block
    const matchedNodeList = Array.from(visited).map((id) => this.store.nodes[id]).filter(Boolean);
    const lines: string[] = ['[SHARED GRAPH MEMORY CONTEXT]'];

    const rules = matchedNodeList.filter((n) => n.type === 'rule');
    if (rules.length > 0) {
      lines.push('User & Architectural Rules:');
      for (const r of rules) {
        const desc = (r.properties.description as string) || r.label;
        lines.push(`- ${r.label}: ${desc}`);
      }
    }

    const workflows = matchedNodeList.filter((n) => n.type === 'workflow');
    if (workflows.length > 0) {
      lines.push('Relevant Known Workflows:');
      for (const w of workflows) {
        const desc = (w.properties.description as string) || '';
        const summary = Array.isArray(w.properties.nodesSummary) ? (w.properties.nodesSummary as string[]).join(' -> ') : '';
        lines.push(`- ${w.label}: ${desc}${summary ? ` (Topology: ${summary})` : ''}`);
      }
    }

    const otherNodes = matchedNodeList.filter((n) => n.type !== 'rule' && n.type !== 'workflow');
    if (otherNodes.length > 0) {
      lines.push('Related Components:');
      for (const c of otherNodes) {
        lines.push(`- ${c.label} (${c.type})`);
      }
    }

    if (relevantEdges.length > 0) {
      lines.push('Connections:');
      for (const e of relevantEdges.slice(0, 8)) {
        const srcLabel = this.store.nodes[e.source]?.label || e.source;
        const tgtLabel = this.store.nodes[e.target]?.label || e.target;
        lines.push(`- ${srcLabel} --[${e.relationship}]--> ${tgtLabel}`);
      }
    }

    const context = lines.join('\n');
    return { context, matchedNodeIds: Array.from(visited) };
  }

  /**
   * Helper for the Zero-Cost Heuristic Engine to match known workflow blueprints from memory.
   */
  public findMatchingTemplate(query: string): GraphMemoryNode | null {
    const qLower = query.toLowerCase();
    const workflowNodes = Object.values(this.store.nodes).filter((n) => n.type === 'workflow');

    let bestMatch: GraphMemoryNode | null = null;
    let highestScore = 0;

    for (const node of workflowNodes) {
      let score = 0;
      const keywords = (node.properties.keywords as string[]) || [];
      for (const kw of keywords) {
        if (qLower.includes(kw.toLowerCase())) {
          score += 2;
        }
      }

      if (node.label && qLower.includes(node.label.toLowerCase())) {
        score += 4;
      }

      if (score > highestScore && score >= 2) {
        highestScore = score;
        bestMatch = node;
      }
    }

    return bestMatch;
  }

  /**
   * Commits workflow generation or conversation state into graph memory.
   */
  public recordInteraction(
    prompt: string,
    reply: string,
    nodes?: WorkflowNode[],
    edges?: WorkflowEdge[],
    workflowName?: string
  ): void {
    const now = new Date().toISOString();

    if (nodes && nodes.length > 0) {
      const generatedId = `wf-${Date.now().toString(36)}`;
      const label = workflowName || prompt.slice(0, 40).trim() || 'Custom Workflow';
      const nodesSummary = nodes.map((n) => n.data?.label || n.id);

      const workflowNode: GraphMemoryNode = {
        id: generatedId,
        label,
        type: 'workflow',
        properties: {
          prompt,
          description: reply.slice(0, 180),
          nodesSummary,
          nodeCount: nodes.length,
          edgeCount: edges?.length || 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      this.store.nodes[generatedId] = workflowNode;

      // Link to offline or heuristic concepts if applicable
      this.store.edges.push({
        source: 'engine-zero-cost-heuristic',
        target: generatedId,
        relationship: 'synthesized',
        weight: 1,
      });

      // Link individual nodes sequentially
      for (let i = 0; i < nodes.length - 1; i++) {
        const sourceLabel = nodes[i].data?.label || nodes[i].id;
        const targetLabel = nodes[i + 1].data?.label || nodes[i + 1].id;
        this.store.edges.push({
          source: `${generatedId}_step_${i}`,
          target: `${generatedId}_step_${i + 1}`,
          relationship: 'flows_to',
          weight: 1,
        });

        if (!this.store.nodes[`${generatedId}_step_${i}`]) {
          this.store.nodes[`${generatedId}_step_${i}`] = {
            id: `${generatedId}_step_${i}`,
            label: sourceLabel,
            type: 'concept',
            properties: { workflowId: generatedId, flowType: nodes[i].data?.flowType },
            createdAt: now,
            updatedAt: now,
          };
        }
      }

      this.persist(this.store);
      this.syncWithRemote().catch(() => {});
    }
  }

  /**
   * Two-way sync with Cloudflare D1 backend (/api/copilot/memory).
   */
  public async syncWithRemote(): Promise<void> {
    if (typeof window === 'undefined' || !window.fetch) return;
    const token = localStorage.getItem('shadowflow_auth_token');
    if (!token) return;

    try {
      const endpoint = 'https://shadowflow.work/api/copilot/memory';
      // 1. Fetch remote updates
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const remoteData = (await res.json()) as { nodes?: GraphMemoryNode[]; edges?: GraphMemoryEdge[] };
        if (remoteData.nodes && Array.isArray(remoteData.nodes)) {
          for (const rNode of remoteData.nodes) {
            if (!this.store.nodes[rNode.id] || new Date(rNode.updatedAt) > new Date(this.store.nodes[rNode.id].updatedAt)) {
              this.store.nodes[rNode.id] = rNode;
            }
          }
        }
        if (remoteData.edges && Array.isArray(remoteData.edges)) {
          const edgeSet = new Set(this.store.edges.map((e) => `${e.source}->${e.target}:${e.relationship}`));
          for (const rEdge of remoteData.edges) {
            const key = `${rEdge.source}->${rEdge.target}:${rEdge.relationship}`;
            if (!edgeSet.has(key)) {
              this.store.edges.push(rEdge);
              edgeSet.add(key);
            }
          }
        }
      }

      // 2. Push unsynced local nodes
      const allNodes = Object.values(this.store.nodes);
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nodes: allNodes.slice(-20), // Send latest 20 nodes
        }),
      });

      this.store.lastSyncedAt = new Date().toISOString();
      this.persist(this.store);
    } catch (err) {
      console.warn('Graph memory remote sync paused (offline or network error):', err);
    }
  }

  public clearMemory(): void {
    const defaultStore = buildDefaultStore();
    this.store = defaultStore;
    this.persist(defaultStore);
  }
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'workflow', 'build', 'create',
  'make', 'design', 'generate', 'pipeline', 'using', 'please', 'help',
]);

export const graphMemory = GraphMemory.getInstance();
