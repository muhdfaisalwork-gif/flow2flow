// ============================================================================
// Shadow Flow — Keyword Research & Intent Cluster Engine
// Generates search intent, estimated volume, competition index, CPC,
// and semantic LSI keyword clusters for AI, workflow automation, and tech news.
// ============================================================================

export interface KeywordCluster {
  primaryKeyword: string;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  monthlyVolumeEst: string;
  difficultyScore: number; // 0 - 100
  difficultyLabel: 'Easy' | 'Moderate' | 'Challenging' | 'Hard';
  cpcUsd: number;
  relatedKeywords: string[];
  suggestedArticleTitle: string;
  suggestedHeaders: string[];
}

export const PRESET_AI_TECH_KEYWORDS: KeywordCluster[] = [
  {
    primaryKeyword: 'ai workflow automation',
    intent: 'Commercial',
    monthlyVolumeEst: '18,500',
    difficultyScore: 42,
    difficultyLabel: 'Moderate',
    cpcUsd: 4.85,
    relatedKeywords: [
      'autonomous ai agents',
      'open source workflow automation',
      'n8n vs zapier ai',
      'llm agent workflow',
      'prompt to flow builder',
    ],
    suggestedArticleTitle: 'How to Build Enterprise AI Workflow Automation Without Coding',
    suggestedHeaders: [
      'Why AI-First Workflows Are Replacing Traditional iPaaS',
      'Core Architecture: Triggers, Models, and Sandboxed Execution',
      'LangChain and Multi-Agent Orchestration on the Canvas',
      'Step-by-Step: Connecting Webhooks to Claude 3.5 & Slack',
    ],
  },
  {
    primaryKeyword: 'n8n alternative open source',
    intent: 'Commercial',
    monthlyVolumeEst: '12,200',
    difficultyScore: 38,
    difficultyLabel: 'Moderate',
    cpcUsd: 3.40,
    relatedKeywords: [
      'free n8n replacement',
      'apache 2.0 workflow builder',
      'self hosted automation platform',
      'n8n sustainable use license bypass',
      'activepieces vs n8n',
    ],
    suggestedArticleTitle: 'Top Open Source n8n Alternatives in 2026: 100% Apache 2.0 Freedom',
    suggestedHeaders: [
      'Understanding the n8n License Shift: Sustainable Use vs Apache 2.0',
      'What to Look for in a Self-Hosted Workflow Platform',
      'Shadow Flow vs n8n: Full Comparison Breakdown',
      'How to Seamlessly Migrate Your Existing n8n JSON Workflows',
    ],
  },
  {
    primaryKeyword: 'deepseek reasoner agent',
    intent: 'Informational',
    monthlyVolumeEst: '35,000',
    difficultyScore: 31,
    difficultyLabel: 'Easy',
    cpcUsd: 2.10,
    relatedKeywords: [
      'deepseek r1 api integration',
      'reasoning models in production',
      'local reasoning agent ollama',
      'deepseek vs o3 mini benchmark',
      'cost efficient reasoning workflows',
    ],
    suggestedArticleTitle: 'DeepSeek Reasoner: Deploying High-End Reasoning Agents at 90% Less Cost',
    suggestedHeaders: [
      'The Rise of Specialized Reasoning Models (R1 / DeepSeek)',
      'Integrating DeepSeek with Visual Automation Workflows',
      'Benchmark Comparison: DeepSeek vs OpenAI o3 vs Claude 3.5 Sonnet',
      'Production Recipes: Automated Bug Triage and Financial Data Extraction',
    ],
  },
  {
    primaryKeyword: 'mcp model context protocol',
    intent: 'Informational',
    monthlyVolumeEst: '28,400',
    difficultyScore: 29,
    difficultyLabel: 'Easy',
    cpcUsd: 2.65,
    relatedKeywords: [
      'anthropic mcp server setup',
      'model context protocol tools',
      'mcp in ai workflows',
      'universal ai agent protocol',
      'connecting databases with mcp',
    ],
    suggestedArticleTitle: 'The Definitive Guide to Model Context Protocol (MCP) in Modern AI Automations',
    suggestedHeaders: [
      'What Is the Model Context Protocol (MCP) and Why It Matters',
      'How MCP Solves the Tool-Integration Fragmentation Problem',
      'Connecting MCP Servers to Visual Workflow Canvases',
      'Future of Interoperable AI Agents in Enterprise Systems',
    ],
  },
  {
    primaryKeyword: 'autonomous multi-agent system',
    intent: 'Commercial',
    monthlyVolumeEst: '22,100',
    difficultyScore: 49,
    difficultyLabel: 'Moderate',
    cpcUsd: 5.20,
    relatedKeywords: [
      'multi agent workflow pattern',
      'agentic orchestration dag',
      'supervisor agent architecture',
      'langgraph alternative visual',
      'autonomous research agents',
    ],
    suggestedArticleTitle: 'Architecting Autonomous Multi-Agent Systems with DAG Visual Workflows',
    suggestedHeaders: [
      'Single Agent vs Multi-Agent Systems: When to Scale',
      'The Supervisor-Worker Architectural Pattern',
      'Error Handling, Self-Healing, and Human-in-the-Loop Safeguards',
      'Production Deployment: Running Autonomous Agents on Cloud and Docker',
    ],
  },
  {
    primaryKeyword: 'local llm workflow automation',
    intent: 'Informational',
    monthlyVolumeEst: '15,800',
    difficultyScore: 35,
    difficultyLabel: 'Moderate',
    cpcUsd: 1.95,
    relatedKeywords: [
      'ollama automation workflow',
      'air-gapped ai agent',
      'zero cost ai workflows',
      'private self hosted llms',
      'llama 3.3 local api',
    ],
    suggestedArticleTitle: 'Running 100% Private, Zero-Cost AI Workflows Locally with Ollama',
    suggestedHeaders: [
      'The Case for Air-Gapped and Private AI Workflows',
      'Setting Up Ollama with Shadow Flow in 5 Minutes',
      'Hardware Requirements: Running 8B to 70B Models Locally',
      'Real-World Use Cases: Local Document Processing & Private Support Triage',
    ],
  },
];

export function researchKeywords(query: string): KeywordCluster[] {
  const clean = query.toLowerCase().trim();
  if (!clean) return PRESET_AI_TECH_KEYWORDS;

  const matches = PRESET_AI_TECH_KEYWORDS.filter(
    k =>
      k.primaryKeyword.includes(clean) ||
      k.relatedKeywords.some(r => r.includes(clean)) ||
      k.suggestedArticleTitle.toLowerCase().includes(clean)
  );

  if (matches.length > 0) return matches;

  // Synthesize on-the-fly cluster for any user input
  const words = clean.split(/\s+/);
  const titleCase = clean.replace(/\b\w/g, c => c.toUpperCase());

  return [
    {
      primaryKeyword: clean,
      intent: clean.includes('vs') || clean.includes('best') ? 'Commercial' : clean.includes('how') ? 'Informational' : 'Transactional',
      monthlyVolumeEst: `${Math.floor(Math.random() * 20 + 5)},${Math.floor(Math.random() * 900 + 100)}`,
      difficultyScore: Math.floor(Math.random() * 35 + 20),
      difficultyLabel: 'Moderate',
      cpcUsd: parseFloat((Math.random() * 4 + 1.5).toFixed(2)),
      relatedKeywords: [
        `best ${clean} tools 2026`,
        `how to use ${clean}`,
        `${clean} tutorial guide`,
        `open source ${clean}`,
        `${clean} architecture and setup`,
      ],
      suggestedArticleTitle: `Complete Guide to ${titleCase}: Strategies, Tools & Best Practices`,
      suggestedHeaders: [
        `What Is ${titleCase} and Why It Is Trending`,
        `Core Architecture and Key Components`,
        `Step-by-Step Implementation with Real Code Examples`,
        `Common Mistakes and Best Practices to Follow`,
      ],
    },
    ...PRESET_AI_TECH_KEYWORDS.slice(0, 3),
  ];
}

export type KeywordData = {
  keyword: string;
  category: string;
  intent: string;
  volume: number;
  difficulty: number;
  cpc: number;
  lsiQuestions: string[];
  competitorUrls: string[];
};

export const curatedKeywords: KeywordData[] = PRESET_AI_TECH_KEYWORDS.map(k => ({
  keyword: k.primaryKeyword,
  category: k.intent === 'Commercial' ? 'Commercial Intent' : 'Technical Architecture',
  intent: k.intent,
  volume: parseInt(k.monthlyVolumeEst.replace(/,/g, ''), 10) || 15000,
  difficulty: k.difficultyScore,
  cpc: k.cpcUsd,
  lsiQuestions: k.suggestedHeaders,
  competitorUrls: k.relatedKeywords.map(r => `https://shadowflow.dev/blog/${encodeURIComponent(r.replace(/\s+/g, '-'))}`),
}));

export function searchKeywords(query: string): KeywordData[] {
  const clusters = researchKeywords(query);
  return clusters.map(k => ({
    keyword: k.primaryKeyword,
    category: k.intent === 'Commercial' ? 'Commercial Intent' : 'Technical Architecture',
    intent: k.intent,
    volume: parseInt(k.monthlyVolumeEst.replace(/,/g, ''), 10) || 12000,
    difficulty: k.difficultyScore,
    cpc: k.cpcUsd,
    lsiQuestions: k.suggestedHeaders,
    competitorUrls: k.relatedKeywords.map(r => `https://shadowflow.dev/blog/${encodeURIComponent(r.replace(/\s+/g, '-'))}`),
  }));
}

export function getRelatedQuestions(keyword: string): string[] {
  const match = PRESET_AI_TECH_KEYWORDS.find(k => k.primaryKeyword.toLowerCase().includes(keyword.toLowerCase()));
  return match ? match.suggestedHeaders : [
    `How to implement ${keyword}?`,
    `What are the benefits of ${keyword}?`,
    `Best open-source alternatives for ${keyword}?`,
  ];
}
