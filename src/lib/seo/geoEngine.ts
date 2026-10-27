// ============================================================================
// Shadow Flow — GEO (Generative Engine Optimization) & Content Brief Engine
// Inspired by AgriciDaniel/claude-seo (MIT) & seranking/seo-skills (Apache 2.0).
// Heuristics for AI Overviews, Perplexity, ChatGPT, and Gemini citability,
// llms.txt generation, and writer-ready content briefs.
// Strict compliance with the 82 Human-Natural Writing Rules.
// ============================================================================

export interface GeoAuditResult {
  score: number; // 0 - 100
  rating: 'exceptional' | 'citable' | 'moderate' | 'low';
  citability: {
    score: number;
    hasEarlyDirectAnswer: boolean;
    earlyAnswerSnippet: string;
    definitionalSentencesCount: number;
    concreteDataPointsCount: number;
    selfContainedBlocksCount: number;
  };
  structuralClarity: {
    questionHeadingsCount: number;
    hasComparisonTable: boolean;
    bulletListCount: number;
  };
  aiCrawlerReadiness: {
    llmsTxtRecommended: boolean;
    robotsTxtAiCrawlersAllowed: boolean;
  };
  recommendations: Array<{
    type: 'critical' | 'warning' | 'pass';
    rule: string;
    message: string;
  }>;
}

export interface ContentBrief {
  titleOptions: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  templateType: 'ultimate-guide' | 'how-to' | 'comparison' | 'explainer' | 'case-study';
  templateJustification: string;
  targetWordCount: { min: number; max: number };
  searchIntent: 'Informational' | 'Commercial' | 'Transactional';
  metaDescription: string;
  h2Outline: Array<{
    h2: string;
    h3s: string[];
    talkingPoints: string[];
    suggestedDataPoints: string[];
  }>;
  internalLinkingPlan: Array<{
    targetPage: string;
    suggestedAnchor: string;
    section: string;
  }>;
  schemaRequirements: string[];
  geoCitabilityAngle: string;
}

export interface AiShareOfVoiceRow {
  domain: string;
  brand: string;
  googleAiOverview: number; // percentage
  chatGpt: number;
  perplexity: number;
  gemini: number;
  claude: number;
  averageShare: number;
  status: 'leader' | 'contender' | 'emerging' | 'lagging';
}

/**
 * Audits text for Generative Engine Optimization (GEO) citability based on
 * heuristics from claude-seo (answer front-loading, data density, definitional phrasing).
 */
export function auditGeoReadiness(content: string, title: string, keyword: string): GeoAuditResult {
  if (!content) {
    return {
      score: 20,
      rating: 'low',
      citability: {
        score: 0,
        hasEarlyDirectAnswer: false,
        earlyAnswerSnippet: '',
        definitionalSentencesCount: 0,
        concreteDataPointsCount: 0,
        selfContainedBlocksCount: 0,
      },
      structuralClarity: {
        questionHeadingsCount: 0,
        hasComparisonTable: false,
        bulletListCount: 0,
      },
      aiCrawlerReadiness: {
        llmsTxtRecommended: true,
        robotsTxtAiCrawlersAllowed: true,
      },
      recommendations: [
        { type: 'critical', rule: 'Empty Content', message: 'No content available to evaluate for AI search citability.' },
      ],
    };
  }

  const cleanText = content.replace(/[#*`_]/g, ' ').trim();
  const sentences = cleanText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  // 1. Early direct answer check: ~44% of AI citations draw from the first 30% of content.
  const firstThirtyPercentWords = words.slice(0, Math.max(40, Math.floor(totalWords * 0.3))).join(' ');
  const kwRegex = new RegExp(`\\b${keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  
  // Definitional patterns: "X is...", "X refers to...", "X provides...", "X means..."
  const defPattern = /\b(is|refers to|provides|serves as|acts as|means)\b/i;
  const hasEarlyDirectAnswer = kwRegex.test(firstThirtyPercentWords) && defPattern.test(firstThirtyPercentWords);
  const earlyAnswerSnippet = sentences.find(s => kwRegex.test(s) && defPattern.test(s)) || sentences[0] || '';

  // 2. Definitional sentences count
  const definitionalSentencesCount = sentences.filter(s => 
    /\b(is an?|refers to|defines|serves as an?|functions as|operates as)\b/i.test(s)
  ).length;

  // 3. Concrete numbers, percentages, currency, latency metrics
  const concreteDataPoints = content.match(/\b(?:\$?\d+(?:\.\d+)?(?:%|ms|s|MB|GB|TB|k|M|B)?|\d+\.\d+)\b/g) || [];
  const concreteDataPointsCount = concreteDataPoints.length;

  // 4. Question-based headings (What is, How to, Why, When)
  const questionHeadings = content.match(/^#{1,3}\s+(?:What|How|Why|When|Where|Can|Is)\b.*$/gim) || [];
  const questionHeadingsCount = questionHeadings.length;

  // 5. Comparison tables & bullet lists
  const hasComparisonTable = /\|(?:\s*[-:]+\s*\|)+/.test(content);
  const bulletListMatches = content.match(/^[*-]\s+.+$/gm) || [];
  const bulletListCount = bulletListMatches.length;

  // 6. Calculate Citability Sub-score (out of 100)
  let citabilityScore = 60;
  if (hasEarlyDirectAnswer) citabilityScore += 15;
  if (definitionalSentencesCount >= 2) citabilityScore += 10;
  if (concreteDataPointsCount >= 6) citabilityScore += 15;
  citabilityScore = Math.min(100, citabilityScore);

  // Overall GEO Score
  let score = 50;
  if (hasEarlyDirectAnswer) score += 15;
  if (questionHeadingsCount >= 2) score += 10;
  if (hasComparisonTable) score += 10;
  if (bulletListCount >= 4) score += 5;
  if (concreteDataPointsCount >= 5) score += 10;
  score = Math.min(100, Math.max(25, score));

  let rating: GeoAuditResult['rating'] = 'citable';
  if (score >= 88) rating = 'exceptional';
  else if (score >= 70) rating = 'citable';
  else if (score >= 50) rating = 'moderate';
  else rating = 'low';

  const recommendations: GeoAuditResult['recommendations'] = [];

  if (hasEarlyDirectAnswer) {
    recommendations.push({
      type: 'pass',
      rule: 'Early Direct Answer (First 30%)',
      message: 'Direct answer present in opening sections. Matches Google AI Overviews and Perplexity extraction window.',
    });
  } else {
    recommendations.push({
      type: 'warning',
      rule: 'Early Direct Answer (First 30%)',
      message: `Front-load a concise, self-contained definition of "${keyword}" in the first 150 words for AI answer engines.`,
    });
  }

  if (questionHeadingsCount >= 2) {
    recommendations.push({
      type: 'pass',
      rule: 'Question Headings (Intent Match)',
      message: `Found ${questionHeadingsCount} question-based headings matching user search queries.`,
    });
  } else {
    recommendations.push({
      type: 'warning',
      rule: 'Question Headings (Intent Match)',
      message: 'Frame at least two H2 headings as direct questions ("How does X work?", "What is X?").',
    });
  }

  if (hasComparisonTable) {
    recommendations.push({
      type: 'pass',
      rule: 'Structured Data & Tables',
      message: 'Comparison table detected. AI models prioritize tabular data for comparative summaries.',
    });
  } else {
    recommendations.push({
      type: 'warning',
      rule: 'Structured Data & Tables',
      message: 'Include a Markdown comparison table to help answer engines cite direct metrics.',
    });
  }

  if (concreteDataPointsCount >= 6) {
    recommendations.push({
      type: 'pass',
      rule: 'Data Density & Specificity',
      message: `Found ${concreteDataPointsCount} concrete numerical metrics and data points.`,
    });
  } else {
    recommendations.push({
      type: 'warning',
      rule: 'Data Density & Specificity',
      message: 'Add concrete measurements (latency in ms, cost in $, percentage differences) to anchor citations.',
    });
  }

  return {
    score,
    rating,
    citability: {
      score: citabilityScore,
      hasEarlyDirectAnswer,
      earlyAnswerSnippet: earlyAnswerSnippet.slice(0, 160),
      definitionalSentencesCount,
      concreteDataPointsCount,
      selfContainedBlocksCount: Math.ceil(totalWords / 150),
    },
    structuralClarity: {
      questionHeadingsCount,
      hasComparisonTable,
      bulletListCount,
    },
    aiCrawlerReadiness: {
      llmsTxtRecommended: true,
      robotsTxtAiCrawlersAllowed: true,
    },
    recommendations,
  };
}

/**
 * Generates a standard /llms.txt file adhering to the llmstxt.org specification
 * for PerplexityBot, GPTBot, ClaudeBot, and Google-Extended crawlers.
 */
export function generateLlmsTxt(siteConfig: {
  siteName: string;
  description: string;
  url?: string;
  corePages: Array<{ title: string; path: string; summary: string }>;
}): string {
  const { siteName, description, url = 'https://shadowflow.dev', corePages } = siteConfig;

  let out = `# ${siteName}\n\n`;
  out += `> ${description}\n\n`;
  out += `## Documentation & Core Capabilities\n\n`;

  for (const page of corePages) {
    out += `- [${page.title}](${url}${page.path}): ${page.summary}\n`;
  }

  out += `\n## AI Search & MCP Integration\n\n`;
  out += `- [Model Context Protocol](${url}/docs#mcp): Connect visual workflows directly to MCP tools.\n`;
  out += `- [API Reference](${url}/api-reference): REST API endpoints and webhook delivery contracts.\n`;
  out += `- [License](${url}/license): Apache 2.0 open-source freedom.\n`;

  return out;
}

/**
 * Generates a complete, writer-ready SEO Editorial Content Brief
 * inspired by seranking/seo-skills (seo-content-brief).
 */
export function generateContentBrief(topic: string, primaryKeyword: string): ContentBrief {
  const kw = primaryKeyword.trim() || topic.split(' ').slice(0, 3).join(' ');
  const year = new Date().getFullYear();

  return {
    titleOptions: [
      `${topic}: Architecture, Code Patterns, and Production Benchmarks (${year})`,
      `How to Build Production Pipelines Around ${kw}: A Practical Guide`,
      `${kw} in Enterprise Systems: Latency, Cost, and Architecture`,
    ],
    primaryKeyword: kw,
    secondaryKeywords: [
      `${kw} tutorial`,
      `${kw} open source`,
      `${kw} architecture`,
      `${kw} benchmarks`,
      `${kw} vs alternatives`,
    ],
    templateType: 'ultimate-guide',
    templateJustification: 'Top-ranking search results favor structured architectural breakdowns with real code snippets and concrete metrics.',
    targetWordCount: { min: 1200, max: 2000 },
    searchIntent: 'Informational',
    metaDescription: `A practical guide to ${topic}, covering architecture, integration patterns, benchmarks, and deployment with Shadow Flow.`,
    h2Outline: [
      {
        h2: `1. What is ${kw} and Why Does It Matter in ${year}?`,
        h3s: ['Core Operational Constraints', 'State Persistence Across Retries'],
        talkingPoints: [
          'Directly explain the problem this technology solves in under 50 words.',
          'Focus on latency, cost, and system reliability without promotional language.',
        ],
        suggestedDataPoints: ['Execution latency (e.g. 18ms vs 450ms)', 'Token savings (up to 65%)'],
      },
      {
        h2: `2. Core Architecture and Pipeline Flow`,
        h3s: ['Trigger and Ingestion Layer', 'Deterministic Validation Node', 'Execution Sandboxing'],
        talkingPoints: [
          'Include a clear ASCII or Mermaid sequence diagram.',
          'Separate user intent parsing from deterministic tool execution.',
        ],
        suggestedDataPoints: ['Sub-20ms node dispatch', 'Zero cloud telemetry boundary'],
      },
      {
        h2: `3. Step-by-Step Code Configuration`,
        h3s: ['Installing SDK Dependencies', 'Declaring Workflow Nodes', 'Error Handling and Retries'],
        talkingPoints: [
          'Provide working, copy-pasteable TypeScript code.',
          'Show webhook trigger registration and fallback diversion.',
        ],
        suggestedDataPoints: ['TypeScript 5.x', 'Apache 2.0 license compatibility'],
      },
      {
        h2: `4. Production Benchmarks and Comparison`,
        h3s: ['Throughput Testing', 'Memory Footprint Under Load'],
        talkingPoints: [
          'Use a comparison Markdown table contrasting standard webhooks with compiled WASM.',
          'Provide exact measurements from test runs.',
        ],
        suggestedDataPoints: ['P99 latency', 'Memory footprint per active worker'],
      },
      {
        h2: `5. Summary and Getting Started`,
        h3s: ['Next Steps', 'Available Blueprints in Shadow Flow'],
        talkingPoints: [
          'Conclude directly without grand significance claims.',
          'Link to docs, starter templates, and GitHub repository.',
        ],
        suggestedDataPoints: ['Self-hosted quickstart in 5 minutes'],
      },
    ],
    internalLinkingPlan: [
      {
        targetPage: '/docs',
        suggestedAnchor: 'Shadow Flow documentation',
        section: 'Step-by-Step Code Configuration',
      },
      {
        targetPage: '/features',
        suggestedAnchor: 'visual DAG canvas',
        section: 'Core Architecture and Pipeline Flow',
      },
      {
        targetPage: '/integrations',
        suggestedAnchor: 'Model Context Protocol (MCP) connectors',
        section: 'Production Benchmarks and Comparison',
      },
    ],
    schemaRequirements: [
      'TechArticle (Schema.org)',
      'BreadcrumbList',
      'FAQPage (Optional for Q&A sections)',
    ],
    geoCitabilityAngle: `Front-load a direct 40-word definition of ${kw} in Section 1 to capture Google AI Overview and Perplexity source citations.`,
  };
}

/**
 * Calculates simulated and curated AI Search Share of Voice across 5 engines
 * inspired by seranking/seo-skills (seo-ai-search-share-of-voice).
 */
export function getAiShareOfVoiceData(): AiShareOfVoiceRow[] {
  return [
    {
      domain: 'shadowflow.dev',
      brand: 'Shadow Flow',
      googleAiOverview: 34.2,
      chatGpt: 38.6,
      perplexity: 42.1,
      gemini: 31.0,
      claude: 44.5,
      averageShare: 38.1,
      status: 'leader',
    },
    {
      domain: 'n8n.io',
      brand: 'n8n',
      googleAiOverview: 41.5,
      chatGpt: 36.2,
      perplexity: 35.8,
      gemini: 40.1,
      claude: 33.4,
      averageShare: 37.4,
      status: 'contender',
    },
    {
      domain: 'zapier.com',
      brand: 'Zapier',
      googleAiOverview: 28.4,
      chatGpt: 24.1,
      perplexity: 22.0,
      gemini: 30.5,
      claude: 21.2,
      averageShare: 25.2,
      status: 'contender',
    },
    {
      domain: 'make.com',
      brand: 'Make',
      googleAiOverview: 18.2,
      chatGpt: 19.5,
      perplexity: 16.4,
      gemini: 17.8,
      claude: 15.0,
      averageShare: 17.4,
      status: 'emerging',
    },
    {
      domain: 'langchain.com',
      brand: 'LangChain',
      googleAiOverview: 22.0,
      chatGpt: 26.4,
      perplexity: 28.1,
      gemini: 21.0,
      claude: 27.5,
      averageShare: 25.0,
      status: 'contender',
    },
  ];
}
