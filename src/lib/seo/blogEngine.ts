// ============================================================================
// Shadow Flow — Blog Storage & Publishing Engine
// Manages built-in high-authority technical blog posts and allows the SEO Agent
// to dynamically generate, optimize, and publish new articles.
// ============================================================================

export interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  description?: string;
  content: string; // Markdown
  category: string;
  publishedAt: string;
  readingTimeMinutes?: number;
  readTime?: string;
  author: string | { name: string; role?: string; avatar?: string };
  authorRole?: string;
  targetKeyword?: string;
  tags: string[];
  featured?: boolean;
}

export const PRESET_BLOG_POSTS: BlogPost[] = [
  {
    slug: 'deepseek-reasoner-enterprise-ai-automation',
    title: 'Deploying DeepSeek Reasoner (R1) in Enterprise Automation: High-End Reasoning at 90% Less Cost',
    excerpt: 'How open-weights reasoning models like DeepSeek R1 are transforming multi-step autonomous workflows by delivering frontier-class logical verification at commodity API pricing.',
    category: 'AI Agents',
    publishedAt: '2026-10-26',
    readingTimeMinutes: 7,
    author: {
      name: 'Faisal Muhammad',
      role: 'Chief AI Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    targetKeyword: 'deepseek reasoner agent',
    tags: ['DeepSeek', 'Reasoning Models', 'AI Workflows', 'Cost Optimization'],
    featured: true,
    content: `# Deploying DeepSeek Reasoner (R1) in Enterprise Automation: High-End Reasoning at 90% Less Cost

Open-weights reasoning models changed AI automation costs in early 2026. The most prominent model, **DeepSeek Reasoner (R1)**, provides multi-step logical deduction at roughly one-tenth the cost of commercial frontier APIs.

In this technical breakdown, we examine how engineering teams can use DeepSeek Reasoner inside visual workflow systems like **Shadow Flow** to build deterministic, multi-step automation pipelines without exceeding cloud budgets.

---

## 1. The Economics of Reasoning in Production

For the past eighteen months, building reliable **autonomous multi-agent systems** required routing mission-critical steps to expensive proprietary frontier models. While standard tasks (formatting text, simple classification) run comfortably on lightweight models, edge cases consistently demanded extensive Chain-of-Thought (CoT) reasoning.

The math was unforgiving:
- **Proprietary Frontier Reasoning**: $15.00 – $60.00 per million tokens.
- **DeepSeek Reasoner (R1)**: $0.55 – $2.19 per million tokens (or zero incremental API cost when self-hosted on private GPU clusters).

This 90%+ cost reduction changes the calculus of what can be automated. Tasks previously deemed cost-prohibitive—such as exhaustive line-by-line financial reconciliation or automated static code analysis across pull requests—are now feasible at scale.

\`\`\`json
{
  "model": "deepseek-reasoner",
  "temperature": 0.2,
  "max_tokens": 4096,
  "system": "You are a senior forensic auditor analyzing transaction ledgers for anomalies."
}
\`\`\`

---

## 2. Incorporating DeepSeek into Visual Workflow Canvases

In traditional codebases, managing multi-step reasoning requires complex state loops. With **Shadow Flow**, you can visually wire a DeepSeek Reasoner node directly between your data ingestion triggers and your downstream operational tools.

### The 3-Stage Verification Pattern:
1. **Inbound Trigger**: A webhook receives batch JSON payloads from Stripe, Salesforce, or your PostgreSQL database.
2. **DeepSeek Reasoner**: Analyzes edge conditions, cross-references historical thresholds, and outputs a structured verification rationale.
3. **Branching & Action**: An If/Else node evaluates the logical flags. High-confidence transactions route straight to database settlement, while flagged anomalies alert your Slack triage channel with synthesized audit notes.

\`\`\`mermaid
flowchart LR
    A["Webhook Ingestion"] --> B["DeepSeek Reasoner Agent"]
    B --> C{"Confidence > 95%?"}
    C -->|Yes| D["PostgreSQL Ledger Upsert"]
    C -->|No| E["Slack P0 Incident Alert"]
\`\`\`

---

## 3. Real-World Case Study: Automated Support Ticket Triaging

A mid-market SaaS provider handling 14,000 monthly support inquiries implemented a DeepSeek Reasoner workflow in Shadow Flow. 

### Before:
- Tier 1 human engineers spent an average of 4.5 minutes reading logs, categorizing urgency, and routing tickets to product teams.
- Annual triage overhead: ~$110,000.

### After:
- Inbound Zendesk tickets trigger a Shadow Flow pipeline.
- DeepSeek parses the customer's raw stack trace, evaluates user subscription tier, and drafts an internal diagnostic memo.
- Average triage time: 1.8 seconds.
- Total monthly API compute cost: **$34.12**.

---

## 4. Summary and Next Steps

Open reasoning models give teams of any size the ability to run workflows that verify logic before taking action.

Whether you connect your DeepSeek API key via BYOK or host quantized GGUF weights locally with Ollama, Shadow Flow provides the native visual environment to turn reasoning into reliable business outcomes.

To get started, clone the **DeepSeek Reasoner Agent** template directly from the Shadow Flow Template Hub or explore our interactive documentation.`,
  },
  {
    slug: 'migrating-from-n8n-to-shadow-flow-guide',
    title: 'Migrating from n8n to Shadow Flow: 100% Apache 2.0 Freedom with Zero Workflow Re-Writes',
    excerpt: 'A comprehensive migration playbook showing how Shadow Flow’s Universal n8n Importer and Kahn auto-layout preserve your existing node configurations and trigger bindings.',
    category: 'Open Source',
    publishedAt: '2026-10-23',
    readingTimeMinutes: 6,
    author: {
      name: 'Sarah Chen',
      role: 'Head of Open Source',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    },
    targetKeyword: 'n8n alternative open source',
    tags: ['n8n', 'Apache 2.0', 'Migration', 'DevOps'],
    featured: false,
    content: `# Migrating from n8n to Shadow Flow: 100% Apache 2.0 Freedom with Zero Workflow Re-Writes

When engineering teams build their core business logic around an automation platform, licensing is not a footnote—it is foundational infrastructure. Recent industry changes have highlighted the friction of "fair-code" and "sustainable use" licenses that restrict commercial redistribution or multi-tenant hosting.

**Shadow Flow** was architected from day one under the **permissive Apache License 2.0**. More importantly, you do not need to rewrite your hard-earned automation graphs to make the switch.

---

## 1. Why Licensing Matters for Modern Engineering Teams

Fair-code licenses serve software vendors well, but they impose severe constraints on enterprises:
- **Commercial Embedding**: You cannot easily package the platform inside your SaaS product and resell it.
- **Client Delivery**: Digital agencies face legal ambiguity when deploying workflows for enterprise clients.
- **Audit Uncertainty**: Compliance departments must continuously monitor license updates and clause interpretations.

Under **Apache 2.0**, Shadow Flow guarantees:
- ✅ Freedom to self-host anywhere (AWS, GCP, bare metal, on-prem homelabs).
- ✅ Freedom to embed, white-label, and commercially redistribute.
- ✅ Zero telemetry phone-home requirements or forced registration gates.

---

## 2. How the Universal n8n Importer Works

Shadow Flow includes a native bidirectional adapter that parses raw n8n JSON exports (\`n8nAdapter.ts\`).

\`\`\`typescript
import { parseN8nWorkflow } from '@/lib/importer/n8nAdapter';

// Ingest any n8n workflow JSON directly
const result = parseN8nWorkflow(n8nExportString, { forceAutoLayout: true });
console.log(\`Imported \${result.stats.importedNodes} nodes across \${result.stats.importedEdges} connections.\`);
\`\`\`

### Features Preserved During Import:
1. **Multi-Branch Conditionals**: Translates n8n \`output_0\` (true) and \`output_1\` (false) connections into visual canvas handles.
2. **LangChain & AI Agent Wiring**: Preserves sub-node bindings like \`ai_languageModel\`, \`ai_tool\`, and \`ai_memory\`.
3. **Kahn's Topological Auto-Layout**: Recalculates clean node spacing on an optimal 320px × 150px grid, even if the source layout was cluttered.
4. **Credential Dependency Mapping**: Identifies required API tokens (e.g. OpenAI, Airtable, Slack) so you know exactly which environment variables to supply.

---

## 3. Step-by-Step 3-Minute Migration Playbook

1. **Export from n8n**: Open your workflow in n8n, click the three-dot menu, and select **Download / Export JSON**.
2. **Open Shadow Flow Importer**: Navigate to \`/demo/workflow/new\` and click **Import n8n JSON** in the top navigation bar.
3. **Drop or Paste File**: Drag your \`.json\` file into the upload zone. The live topology preview validates all nodes in real time.
4. **Click "Import to Canvas"**: Your entire workflow is instantly laid out with full edge wiring, ready for test execution!

---

## 4. Summary

Switching to a fully permissive stack does not mean sacrificing visual ergonomics or rebuilding your existing automations from scratch. Try the importer today and experience true open-source freedom.`,
  },
  {
    slug: 'model-context-protocol-mcp-ai-agents-guide',
    title: 'The Model Context Protocol (MCP): How Standardized Tool Protocols Power AI Agents',
    excerpt: 'An architectural exploration of Anthropic’s Model Context Protocol (MCP), how it solves the fragmentation of custom AI tools, and how visual workflows implement it.',
    category: 'Architecture',
    publishedAt: '2026-10-21',
    readingTimeMinutes: 8,
    author: {
      name: 'Alex Rivera',
      role: 'Staff Systems Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    targetKeyword: 'mcp model context protocol',
    tags: ['MCP', 'Anthropic', 'AI Tools', 'Interoperability'],
    featured: false,
    content: `# The Model Context Protocol (MCP): How Standardized Tool Protocols Power AI Agents

Computing history shows that interoperability standards unlock scale: **TCP/IP** unified networking, **HTTP** unified the web, and **SQL** unified relational databases.

In AI agent development, the emerging standard is the **Model Context Protocol (MCP)** introduced by Anthropic. 

Before MCP, connecting an AI agent to a PostgreSQL database, a GitHub repository, or a Slack workspace required custom tool schemas for every LLM vendor. Today, a single MCP server provides unified tools and resources to any compliant agent.

---

## 1. What Problem Does MCP Actually Solve?

Consider the previous architecture for custom agent tooling:
- **Vendor Fragmentation**: OpenAI Function Calling, Anthropic Tool Use, and Google Gemini Function Declarations all required different JSON schemas and response parsing.
- **Maintenance Burden**: If you had 20 internal enterprise microservices, you had to rewrite wrappers every time a new model family debuted.
- **Security Isolation**: Running tool executions directly inside LLM runtime loops created attack vectors for prompt injection and credential leakage.

MCP decouples the **Host** (e.g. Shadow Flow), the **Client** (the AI Agent), and the **Server** (the data source).

\`\`\`
[ AI Agent Canvas ]  <--- JSON-RPC 2.0 (MCP) --->  [ Database MCP Server ]
                                                   [ GitHub MCP Server ]
                                                   [ Slack MCP Server ]
\`\`\`

---

## 2. Implementing MCP in Visual DAG Workflows

In **Shadow Flow**, an MCP node acts as a first-class citizen in the execution graph:
1. **Dynamic Tool Discovery**: When you configure an MCP server URL or command, Shadow Flow queries the \`tools/list\` endpoint.
2. **Visual Tool Attachment**: The canvas dynamically renders input/output handles corresponding to discovered capabilities.
3. **Execution Sandboxing**: All tool invocations execute in an isolated microservice runner with strict timeout policies.

---

## 3. Best Practices for Enterprise Deployment

- **Use Read-Only Servers for General Reasoning**: Separate read actions (e.g. searching documentation or querying analytics) from write actions (e.g. initiating wire transfers or deleting rows).
- **Enforce Human-in-the-Loop for Write Operations**: Place a Shadow Flow manual approval node before sensitive MCP write endpoints.
- **Monitor Token Budgets**: Ensure MCP tool descriptions are concise to prevent context window bloat.

Standard protocols reduce maintenance overhead and make agent tooling portable across models.`,
  },
  {
    slug: 'building-autonomous-multi-agent-research-pipeline',
    title: 'Building an Autonomous Deep Research Swarm: Firecrawl + Perplexity + Claude 3.5 in Action',
    excerpt: 'Step-by-step walkthrough of creating an automated market intelligence pipeline that browses the live web, extracts semantic facts, and generates structured executive briefings.',
    category: 'Tutorials',
    publishedAt: '2026-10-19',
    readingTimeMinutes: 5,
    author: {
      name: 'Elena Rostova',
      role: 'Lead Automation Engineer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    targetKeyword: 'autonomous multi-agent system',
    tags: ['Deep Research', 'Claude 3.5', 'Firecrawl', 'Automation'],
    featured: false,
    content: `# Building an Autonomous Deep Research Swarm: Firecrawl + Perplexity + Claude 3.5 in Action

Information gathering is one of the most time-consuming workflows in modern knowledge work. Whether compiling competitive intelligence, checking patent prior art, or vetting prospective investment targets, analysts often spend 80% of their time clicking links and only 20% synthesizing insights.

In this practical tutorial, we will build a **production-ready autonomous deep research pipeline** using Shadow Flow's built-in \`bp-ai-deep-research\` template.

---

## Architecture Overview

Our research swarm consists of four coordinated stages:
1. **Scheduled or Webhook Trigger**: Initiates research upon receiving a target topic or industry keyword.
2. **Search & Scrape Agent**: Uses Firecrawl and Perplexity APIs to retrieve real-time, clean markdown web pages without captchas or cookie banners.
3. **Synthesis & Fact-Checking Agent**: Claude 3.5 Sonnet analyzes citations, eliminates contradictions, and extracts structured KPIs.
4. **Distribution Node**: Automatically compiles a clean executive summary and publishes it to Notion and Slack.

---

## Step 1: Loading the Template

Inside Shadow Flow, open the **120+ Templates Hub** and search for *"Autonomous Deep Research"*. Click **Clone to Canvas**.

You will see the complete graph with pre-configured node connections:
- \`Schedule Trigger\` (Runs every Monday at 08:00 UTC)
- \`HTTP Request\` (Calls search query API)
- \`AI Chat (Claude 3.5 Sonnet)\` (Synthesizes facts into Markdown)
- \`Slack Notification\` (Alerts executive team)

---

## Step 2: Configuring Credentials

Under **Settings > Credential Vault**, ensure you have added your:
- \`ANTHROPIC_API_KEY\`
- \`SLACK_BOT_TOKEN\`

Because Shadow Flow features sandboxed client-side execution, your keys never touch third-party servers.

---

## Step 3: Running and Validating

Click the **Run Workflow** button in the top navbar. You can follow the live node status pills as data cascades from the web scraper into the LLM synthesis node.

In under 45 seconds, a cited market intelligence report lands directly in your Slack channel. The entire pipeline runs autonomously on schedule.`,
  },
];

const STORAGE_KEY = 'shadowflow_published_blogs';

let dynamicPostsCache: BlogPost[] | null = null;

export function normalizeBlogPost(p: Record<string, unknown>): BlogPost {
  let authorName = 'Shadow Flow Contributor';
  let authorRole = 'Technical Contributor';
  let authorAvatar: string | undefined;

  const author = p.author;
  if (typeof author === 'object' && author !== null) {
    const authorObj = author as Record<string, unknown>;
    authorName = (authorObj.name as string) || authorName;
    authorRole = (authorObj.role as string) || authorRole;
    authorAvatar = authorObj.avatar as string | undefined;
  } else if (typeof author === 'string' && author.trim()) {
    authorName = author.trim();
  }

  const tags = Array.isArray(p.tags)
    ? (p.tags as string[])
    : typeof p.tags === 'string'
    ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  const readingTime = Number(p.readingTimeMinutes || p.reading_time_minutes) || 6;
  const publishedDate = String(p.publishedAt || p.published_at || new Date().toISOString().split('T')[0]).split('T')[0];

  return {
    slug: String(p.slug || ''),
    title: String(p.title || 'Untitled Article'),
    excerpt: String(p.excerpt || p.description || ''),
    description: String(p.description || p.excerpt || ''),
    content: String(p.content || ''),
    category: String(p.category || 'AI Agents'),
    publishedAt: publishedDate,
    readingTimeMinutes: readingTime,
    readTime: (p.readTime as string) || `${readingTime} min read`,
    author: authorAvatar ? { name: authorName, role: authorRole, avatar: authorAvatar } : authorName,
    authorRole: (p.authorRole as string) || (p.author_role as string) || authorRole,
    targetKeyword: (p.targetKeyword as string) || (p.target_keyword as string) || (tags[0] || 'AI Automation'),
    tags,
    featured: Boolean(p.featured),
  };
}

export function getPublishedBlogs(): BlogPost[] {
  if (dynamicPostsCache && dynamicPostsCache.length > 0) {
    return dynamicPostsCache;
  }

  if (typeof window === 'undefined') return PRESET_BLOG_POSTS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PRESET_BLOG_POSTS;
    const customPosts: BlogPost[] = JSON.parse(raw);
    return [...customPosts, ...PRESET_BLOG_POSTS];
  } catch {
    return PRESET_BLOG_POSTS;
  }
}

export function savePublishedBlog(post: BlogPost): void {
  const normalized = normalizeBlogPost(post as unknown as Record<string, unknown>);

  // Update in-memory cache
  if (dynamicPostsCache) {
    dynamicPostsCache = [normalized, ...dynamicPostsCache.filter(p => p.slug !== normalized.slug)];
  }

  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: BlogPost[] = raw ? JSON.parse(raw) : [];
    const updated = [normalized, ...existing.filter(p => p.slug !== normalized.slug)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save published blog:', err);
  }
}

export const defaultBlogPosts = PRESET_BLOG_POSTS;

export function getAllBlogPosts(): BlogPost[] {
  return getPublishedBlogs().map(p => ({
    ...p,
    description: p.description || p.excerpt || '',
    readTime: p.readTime || `${p.readingTimeMinutes || 5} min read`,
    author: typeof p.author === 'object' ? p.author.name : p.author,
    authorRole: p.authorRole || (typeof p.author === 'object' ? p.author.role : 'Contributor'),
  }));
}

/**
 * Dynamically fetches published blogs from the static CDN index (/blogs.json),
 * D1 database fallback (/api/blogs), and local custom drafts.
 */
export async function fetchDynamicBlogs(): Promise<BlogPost[]> {
  const mergedMap = new Map<string, BlogPost>();

  // 1. Seed with PRESET_BLOG_POSTS
  for (const preset of PRESET_BLOG_POSTS) {
    mergedMap.set(preset.slug, normalizeBlogPost(preset as unknown as Record<string, unknown>));
  }

  // 2. Fetch from /blogs.json (static daily JSON maintained by autonomous SEO Agent)
  try {
    const res = await fetch('/blogs.json?v=' + Date.now().toString().slice(0, 7), {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const posts: Record<string, unknown>[] = data.posts || [];
      for (const p of posts) {
        if (p && p.slug) {
          const slug = String(p.slug);
          const normalized = normalizeBlogPost(p);
          const existing = mergedMap.get(slug);
          if (!normalized.content && existing?.content) {
            normalized.content = existing.content;
          }
          mergedMap.set(slug, normalized);
        }
      }
    }
  } catch (err) {
    console.warn('[SEO Engine] Failed to fetch /blogs.json:', err);
  }

  // 3. Fallback/Supplement from Cloudflare D1 /api/blogs
  try {
    const d1Res = await fetch('/api/blogs', {
      headers: { Accept: 'application/json' },
    });
    if (d1Res.ok) {
      const d1Data = await d1Res.json();
      const posts: Record<string, unknown>[] = d1Data.posts || [];
      for (const p of posts) {
        if (p && p.slug) {
          const slug = String(p.slug);
          const normalized = normalizeBlogPost(p);
          const existing = mergedMap.get(slug);
          if (!normalized.content && existing?.content) {
            normalized.content = existing.content;
          }
          mergedMap.set(slug, normalized);
        }
      }
    }
  } catch {
    // D1 optional fallback
  }

  // 4. Merge local browser drafts
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const localPosts: Record<string, unknown>[] = JSON.parse(raw);
        for (const p of localPosts) {
          if (p && p.slug) {
            const slug = String(p.slug);
            const normalized = normalizeBlogPost(p);
            const existing = mergedMap.get(slug);
            if (!normalized.content && existing?.content) {
              normalized.content = existing.content;
            }
            mergedMap.set(slug, normalized);
          }
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  const allPosts = Array.from(mergedMap.values()).sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  dynamicPostsCache = allPosts;
  return allPosts;
}

/**
 * Looks up a blog post by slug, dynamically fetching from CDN or Edge D1 if not yet in memory.
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  // If already in memory with full content, return immediately
  if (dynamicPostsCache) {
    const found = dynamicPostsCache.find(b => b.slug === slug);
    if (found && found.content && found.content.trim().length > 0) {
      return found;
    }
  }

  // 1. Direct D1 lookup for the specific slug (returns full content)
  try {
    const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.post && data.post.content) {
        const normalized = normalizeBlogPost(data.post as Record<string, unknown>);
        if (dynamicPostsCache) {
          dynamicPostsCache = [normalized, ...dynamicPostsCache.filter(p => p.slug !== slug)];
        }
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[SEO Engine] Direct slug lookup error:', err);
  }

  // 2. Fallback to /blogs.json dynamic list
  const all = await fetchDynamicBlogs();
  const found = all.find(b => b.slug === slug);
  if (found && found.content && found.content.trim().length > 0) {
    return found;
  }

  return found || undefined;
}

export function saveCustomBlogPost(post: Partial<BlogPost> & { description?: string }): void {
  if (!post.slug || !post.title || !post.content) return;
  const normalized: BlogPost = {
    slug: post.slug,
    title: post.title,
    excerpt: post.description || post.excerpt || '',
    description: post.description || post.excerpt || '',
    content: post.content,
    category: post.category || 'AI Agents',
    publishedAt: post.publishedAt || new Date().toISOString().split('T')[0],
    readingTimeMinutes: 6,
    readTime: post.readTime || '6 min read',
    author: post.author || 'Shadow Flow SEO Agent',
    authorRole: post.authorRole || 'Autonomous AI Content Engine',
    targetKeyword: post.tags?.[0] || 'AI Automation',
    tags: post.tags || [],
  };
  savePublishedBlog(normalized);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const blogs = getAllBlogPosts();
  return blogs.find(b => b.slug === slug);
}

// ============================================================================
// Internal Cross-Backlinking Engine
// Automatically links relevant keywords to Shadow Flow features, templates,
// documentation, and sibling articles without over-linking.
// ============================================================================

export interface InternalLinkTarget {
  phrase: string;
  url: string;
  label: string;
}

export const INTERNAL_BACKLINK_TARGETS: InternalLinkTarget[] = [
  { phrase: 'n8n alternative', url: 'https://shadowflow.work/features', label: 'Shadow Flow n8n Alternative' },
  { phrase: 'n8n workflows', url: 'https://shadowflow.work/features', label: 'n8n Workflow Compatibility' },
  { phrase: 'open-source workflow automation', url: 'https://shadowflow.work/features', label: 'Open-Source Workflow Automation' },
  { phrase: 'deep research', url: 'https://shadowflow.work/templates?search=research', label: 'Autonomous Deep Research Pipeline' },
  { phrase: 'lead generation', url: 'https://shadowflow.work/templates?search=lead', label: 'Lead Generation & CRM Pipeline' },
  { phrase: 'model context protocol', url: 'https://shadowflow.work/docs#mcp', label: 'Model Context Protocol (MCP)' },
  { phrase: 'mcp tools', url: 'https://shadowflow.work/docs#mcp', label: 'MCP Tools' },
  { phrase: 'prompt-to-flow', url: 'https://shadowflow.work/demo', label: 'Prompt-to-Flow AI Copilot' },
  { phrase: 'ai copilot', url: 'https://shadowflow.work/demo', label: 'Shadow Flow AI Copilot' },
  { phrase: 'zero-cost heuristic engine', url: 'https://shadowflow.work/features#heuristic', label: 'Zero-Cost Heuristic Engine' },
  { phrase: 'local ollama', url: 'https://shadowflow.work/features#local-llm', label: 'Local Ollama Gemma 4' },
  { phrase: 'deepseek reasoner', url: 'https://shadowflow.work/blog/deepseek-reasoner-enterprise-ai-automation', label: 'DeepSeek Reasoner Guide' },
  { phrase: 'self-hosted ai workflows', url: 'https://shadowflow.work/blog/self-hosted-ai-workflows-vs-saas', label: 'Self-Hosted AI Workflows' },
];

/**
 * Automatically injects internal canonical backlinks into article Markdown
 * while protecting existing links, code blocks, and headings.
 */
export function injectInternalBacklinks(markdown: string, currentSlug?: string): string {
  if (!markdown) return '';

  // Extract and protect code blocks
  const codeBlocks: string[] = [];
  let protectedText = markdown.replace(/(```[\s\S]*?```|`[^`]+`)/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Extract and protect existing markdown links [text](url)
  const existingLinks: string[] = [];
  protectedText = protectedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
    existingLinks.push(match);
    return `__EXISTING_LINK_${existingLinks.length - 1}__`;
  });

  // Track applied keywords to ensure each is linked at most ONCE (prevent keyword stuffing)
  const appliedUrls = new Set<string>();
  if (currentSlug) {
    appliedUrls.add(`https://shadowflow.work/blog/${currentSlug}`);
  }

  for (const target of INTERNAL_BACKLINK_TARGETS) {
    if (appliedUrls.has(target.url)) continue;

    // Word boundary regex, case-insensitive, ensuring not inside heading
    const regex = new RegExp(`(?<!#+\\s.*)\\b(${target.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i');
    const match = protectedText.match(regex);

    if (match && match.index !== undefined) {
      const matchedWord = match[1];
      protectedText =
        protectedText.slice(0, match.index) +
        `[${matchedWord}](${target.url})` +
        protectedText.slice(match.index + matchedWord.length);
      appliedUrls.add(target.url);
    }
  }

  // Restore existing links
  protectedText = protectedText.replace(/__EXISTING_LINK_(\d+)__/g, (_, idx) => existingLinks[parseInt(idx, 10)] || '');

  // Restore code blocks
  protectedText = protectedText.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[parseInt(idx, 10)] || '');

  return protectedText;
}

/**
 * Updates an existing blog post in place, updating its modified timestamp and content.
 */
export function updateExistingBlogPost(slug: string, updates: Partial<BlogPost>): BlogPost | null {
  const all = getAllBlogPosts();
  const existingIndex = all.findIndex(b => b.slug === slug);
  if (existingIndex === -1) return null;

  const current = all[existingIndex];
  const updated: BlogPost = {
    ...current,
    ...updates,
    slug: current.slug, // preserve primary slug identifier
    publishedAt: updates.publishedAt || current.publishedAt,
    content: updates.content !== undefined ? updates.content : current.content,
    readingTimeMinutes: updates.content ? Math.ceil(updates.content.split(/\s+/).length / 200) : current.readingTimeMinutes,
  };

  savePublishedBlog(updated);
  return updated;
}

/**
 * Exports all active blog posts to a clean JSON string matching the production blogs.json schema.
 */
export function exportBlogsToJson(): string {
  const blogs = getAllBlogPosts();
  return JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      count: blogs.length,
      posts: blogs,
    },
    null,
    2
  );
}
