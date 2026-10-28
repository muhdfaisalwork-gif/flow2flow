// ============================================================================
// Shadow Flow — Backlink Opportunity & Outreach Pitch Engine
// Curates high-authority developer, open-source, AI directories, and tech blogs.
// Generates personalized, high-conversion outreach emails and follow-ups.
// Inspired by sultrix-seo's backlink_outreach.py & developer outreach best practices.
// ============================================================================

export interface BacklinkOpportunity {
  id: string;
  name: string;
  url: string;
  category: 'Awesome List' | 'Tech Directory' | 'Dev Publication' | 'AI Directory' | 'Open Source Roundup';
  type?: 'Awesome List' | 'Tech Directory' | 'Dev Publication' | 'AI Directory' | 'Open Source Roundup';
  domainAuthorityEst: number; // 0 - 100
  domainAuthority?: number;
  targetAudience: string;
  pitchAngle: string;
  notes?: string;
  suggestedAnchorText: string;
  status: 'prospect' | 'drafted' | 'contacted' | 'acquired';
}

export interface OutreachPitch {
  recipientTitle: string;
  subject: string;
  body: string;
  followUpSubject: string;
  followUpBody: string;
}

export const CURATED_BACKLINK_TARGETS: BacklinkOpportunity[] = [
  {
    id: 'bl-awesome-n8n',
    name: 'GitHub: Awesome n8n Workflows & Ecosystem',
    url: 'https://github.com/topics/n8n-workflow',
    category: 'Awesome List',
    domainAuthorityEst: 96,
    targetAudience: 'Developers, automation engineers, open-source maintainers',
    pitchAngle: '100% Apache 2.0 open-source visual workflow platform with universal n8n JSON importer',
    suggestedAnchorText: 'Shadow Flow — Apache 2.0 n8n alternative',
    status: 'prospect',
  },
  {
    id: 'bl-awesome-ai-agents',
    name: 'GitHub: Awesome AI Agents & Autonomous Frameworks',
    url: 'https://github.com/topics/ai-agents',
    category: 'Awesome List',
    domainAuthorityEst: 96,
    targetAudience: 'AI researchers, LLM application builders, LangChain developers',
    pitchAngle: 'Visual multi-agent DAG builder with LangChain and MCP integration',
    suggestedAnchorText: 'Shadow Flow: Visual multi-agent workflow orchestrator',
    status: 'prospect',
  },
  {
    id: 'bl-product-hunt',
    name: 'Product Hunt: Developer Tools & AI Products',
    url: 'https://www.producthunt.com',
    category: 'Tech Directory',
    domainAuthorityEst: 92,
    targetAudience: 'Product creators, startup founders, tech early-adopters',
    pitchAngle: 'Launch announcement: Free self-hostable open-source workflow automation platform',
    suggestedAnchorText: 'Shadow Flow on Product Hunt',
    status: 'prospect',
  },
  {
    id: 'bl-dev-to',
    name: 'Dev.to: Open Source & Automation Community',
    url: 'https://dev.to',
    category: 'Dev Publication',
    domainAuthorityEst: 91,
    targetAudience: 'Full-stack software engineers, DevOps specialists',
    pitchAngle: 'Technical deep-dive: How we built an Apache 2.0 n8n importer in TypeScript',
    suggestedAnchorText: 'Shadow Flow open source platform',
    status: 'prospect',
  },
  {
    id: 'bl-hackernews',
    name: 'Hacker News: Show HN Showcase',
    url: 'https://news.ycombinator.com',
    category: 'Dev Publication',
    domainAuthorityEst: 94,
    targetAudience: 'Hacker News developers, founders, tech leaders',
    pitchAngle: 'Show HN: Shadow Flow — Apache 2.0 AI workflow builder that runs n8n JSON offline',
    suggestedAnchorText: 'Show HN: Shadow Flow',
    status: 'prospect',
  },
  {
    id: 'bl-ai-tool-hunt',
    name: 'Futurepedia & AI Tool Directories',
    url: 'https://www.futurepedia.io',
    category: 'AI Directory',
    domainAuthorityEst: 84,
    targetAudience: 'AI enthusiasts, business automators, digital creators',
    pitchAngle: 'Free AI workflow generator with natural language Prompt-to-Flow copilot',
    suggestedAnchorText: 'Shadow Flow AI Workflow Tool',
    status: 'prospect',
  },
  {
    id: 'bl-selfhosted-reddit',
    name: 'Reddit: r/selfhosted & r/opensource',
    url: 'https://reddit.com/r/selfhosted',
    category: 'Open Source Roundup',
    domainAuthorityEst: 97,
    targetAudience: 'Self-hosters, sysadmins, homelab enthusiasts',
    pitchAngle: 'Complete single-command Docker Compose stack with zero phone-home telemetry',
    suggestedAnchorText: 'Self-hosted Shadow Flow stack',
    status: 'prospect',
  },
];

export const backlinkOpportunities: BacklinkOpportunity[] = CURATED_BACKLINK_TARGETS.map(t => ({
  id: t.id,
  name: t.name,
  url: t.url,
  category: t.category,
  type: t.category,
  domainAuthorityEst: t.domainAuthorityEst,
  domainAuthority: t.domainAuthorityEst,
  pitchAngle: t.pitchAngle,
  notes: t.pitchAngle,
  targetAudience: t.targetAudience,
  suggestedAnchorText: t.suggestedAnchorText,
  status: t.status,
}));

export function generateOutreachPitch(
  opportunity: Partial<BacklinkOpportunity>,
  recipientName = 'Curator',
  tone: 'founder' | 'developer' | 'pr' = 'founder'
): { subject: string; body: string; followUp: string; recipientTitle?: string } {
  const oppName = opportunity.name || 'your platform';
  const oppUrl = opportunity.url || 'https://github.com';
  const anchor = opportunity.suggestedAnchorText || 'Shadow Flow — Open Source Workflow Platform';

  let greeting = `Hi ${recipientName},`;
  if (tone === 'developer') {
    greeting = `Hey ${recipientName} & fellow devs,`;
  } else if (tone === 'pr') {
    greeting = `Dear ${recipientName} editorial team,`;
  }

  const subject = `Resource suggestion for ${oppName}: 100% Apache 2.0 AI Workflow Platform`;

  const body = `${greeting}

I was exploring your resource page on ${oppName} (${oppUrl}) and noticed the high quality of curated automation and AI developer tools listed.

With recent licensing shifts across iPaaS and workflow automation platforms, many engineering teams are seeking completely permissive, enterprise-grade alternatives.

We recently open-sourced Shadow Flow (https://shadowflow.dev) under the 100% permissive Apache 2.0 license:
- Universal n8n JSON Importer: Auto-layouts and executes legacy n8n workflows without lock-in.
- Visual Multi-Agent DAGs: Native support for LangChain, DeepSeek R1, and Anthropic MCP tools.
- 1-Command Air-Gapped Deployment: Local WebAssembly testing + Docker Compose with zero telemetry.

Would you be open to adding Shadow Flow to your directory under "${anchor}"?

Source repo: https://github.com/muhdfaisalwork-gif/shadowflow

Thank you for curating such a fantastic resource!

Best regards,
Shadow Flow Maintainers`;

  const followUp = `Hi ${recipientName} — just following up on my previous note regarding Shadow Flow (https://shadowflow.dev). We just rolled out our n8n test fixture suite and offline WASM runner under Apache 2.0. Let me know if you need any additional assets or info!`;

  return {
    subject,
    body,
    followUp,
    recipientTitle: `Editorial / Maintainer of ${oppName}`,
  };
}
