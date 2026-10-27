// ============================================================================
// Shadow Flow — AI & Tech News Radar Engine
// Curates breaking AI models, open-source automation breakthroughs, and tech trends.
// Enables 1-click transformation into SEO-optimized, rankable blog posts.
// ============================================================================

export interface AiNewsItem {
  id: string;
  title: string;
  category: 'Models & Reasoning' | 'Automation & Agents' | 'Open Source' | 'Developer Tools' | 'Enterprise AI';
  publishedDate: string;
  summary: string;
  primaryKeywords: string[];
  trendingScore: number; // 0 - 100
  source: string;
  sourceUrl: string;
  suggestedAngle: string;
}

export const LATEST_AI_TECH_NEWS: AiNewsItem[] = [
  {
    id: 'news-deepseek-r1',
    title: 'DeepSeek Reasoner (R1) Shakes Up AI Economics: High-Performance Reasoning at Commodity Prices',
    category: 'Models & Reasoning',
    publishedDate: '2026-10-26',
    summary: 'DeepSeek released detailed evaluations demonstrating competitive reasoning capabilities against OpenAI o1 and o3 models while slashing API token costs by over 90%. Open-weights availability is triggering a wave of local deployments.',
    primaryKeywords: ['deepseek r1', 'reasoning models', 'local ai cost', 'ai workflow automation'],
    trendingScore: 98,
    source: 'AI Research News',
    sourceUrl: 'https://news.ycombinator.com',
    suggestedAngle: 'How to plug DeepSeek Reasoner into Shadow Flow workflows to achieve multi-step logical verification at a fraction of cloud cost.',
  },
  {
    id: 'news-mcp-anthropic',
    title: 'Model Context Protocol (MCP) Gains Widespread Adoption Across Open-Source Developer Tooling',
    category: 'Developer Tools',
    publishedDate: '2026-10-24',
    summary: 'Anthropic\'s open standard for connecting AI assistants to data repositories and development environments (MCP) has been adopted by major IDEs, database providers, and workflow engines.',
    primaryKeywords: ['model context protocol', 'mcp tools', 'anthropic claude', 'agent integration'],
    trendingScore: 94,
    source: 'TechCrunch & Anthropic Announcements',
    sourceUrl: 'https://anthropic.com',
    suggestedAngle: 'Why the Model Context Protocol is the missing USB cable for autonomous AI agents, and how visual workflows implement it natively.',
  },
  {
    id: 'news-n8n-faircode',
    title: 'Enterprise Demand Surges for 100% Permissive Apache 2.0 Workflow Platforms',
    category: 'Open Source',
    publishedDate: '2026-10-22',
    summary: 'Following shifts in fair-code license restrictions across iPaaS software, enterprise engineering leaders are consolidating onto fully permissive Apache 2.0 and MIT platforms to ensure long-term IP freedom and unencumbered commercial redistribution.',
    primaryKeywords: ['n8n alternative open source', 'apache 2.0 automation', 'self-hosted workflows', 'enterprise automation'],
    trendingScore: 92,
    source: 'Open Source Initiative & GitHub Trends',
    sourceUrl: 'https://github.com/trending',
    suggestedAngle: 'Comparing fair-code vs Apache 2.0: What software architects need to know before locking their company\'s critical automation pipelines.',
  },
  {
    id: 'news-multiagent-dag',
    title: 'Autonomous Multi-Agent Swarms Transition from Prototype Notebooks to Production DAG Orchestration',
    category: 'Automation & Agents',
    publishedDate: '2026-10-20',
    summary: 'Teams are abandoning monolithic agent loops in favor of structured Directed Acyclic Graph (DAG) orchestration where specialized agents handle research, validation, formatting, and alerting with deterministic state checkpoints.',
    primaryKeywords: ['autonomous multi-agent system', 'agentic dag orchestration', 'ai agent pipeline', 'langchain visual'],
    trendingScore: 89,
    source: 'VentureBeat & Hacker News',
    sourceUrl: 'https://venturebeat.com',
    suggestedAngle: 'Architectural Blueprint: Building a 4-agent customer operations swarm using Webhooks, DeepSeek, and Slack in Shadow Flow.',
  },
  {
    id: 'news-local-llms-hardware',
    title: 'Hardware Breakthroughs and Quantization Enable 70B Parameter Models on Consumer Desktops',
    category: 'Models & Reasoning',
    publishedDate: '2026-10-18',
    summary: 'With advances in 4-bit and 2-bit quantization formats (GGUF, EXL2) and unified memory architectures, running 70B parameter models at 35+ tokens/second on workstations has become reality for privacy-conscious developers.',
    primaryKeywords: ['local llm workflow automation', 'ollama self hosted', 'private ai execution', 'llama 3.3'],
    trendingScore: 86,
    source: 'Reddit r/LocalLLaMA & Hugging Face',
    sourceUrl: 'https://huggingface.co',
    suggestedAngle: 'Setting up an air-gapped, zero-cloud automation server that processes legal documents and HR requests locally.',
  },
];

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  summary: string;
  source: string;
  impact: 'High' | 'Medium';
  suggestedKeyword: string;
}

export const aiTechNewsFeed: NewsItem[] = LATEST_AI_TECH_NEWS.map(n => ({
  id: n.id,
  title: n.title,
  category: n.category,
  publishedAt: n.publishedDate,
  summary: n.summary,
  source: n.source,
  impact: n.trendingScore >= 90 ? 'High' : 'Medium',
  suggestedKeyword: n.primaryKeywords[0] || 'AI Automation',
}));
