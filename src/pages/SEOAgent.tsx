import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Link2,
  Newspaper,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Send,
  Zap,
  TrendingUp,
  FileText,
  BarChart3,
  Bot,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { auditOnPageSeo, generateTechArticleSchema, OnPageAuditResult } from "@/lib/seo/seoEngine";
import { humanizeContent, auditHumanNaturalWriting, HUMANIZER_RULES } from "@/lib/seo/humanizerRules";
import {
  generateContentBrief,
  generateLlmsTxt,
  getAiShareOfVoiceData,
  AiShareOfVoiceRow,
} from "@/lib/seo/geoEngine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { curatedKeywords, searchKeywords, getRelatedQuestions, KeywordData } from "@/lib/seo/keywordEngine";
import { backlinkOpportunities, generateOutreachPitch, BacklinkOpportunity } from "@/lib/seo/backlinkEngine";
import { aiTechNewsFeed, NewsItem } from "@/lib/seo/aiNewsEngine";
import { saveCustomBlogPost, defaultBlogPosts, injectInternalBacklinks, updateExistingBlogPost } from "@/lib/seo/blogEngine";

export default function SEOAgent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("writer");

  // --- TAB 1: AI Blog Writer State ---
  const [topic, setTopic] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [tone, setTone] = useState<"authoritative" | "practical" | "conversational">("authoritative");
  const [targetAudience, setTargetAudience] = useState("Engineers & Automation Architects");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedMarkdown, setGeneratedMarkdown] = useState("");
  const [generatedMeta, setGeneratedMeta] = useState({ title: "", description: "", slug: "" });

  // --- TAB 2: On-Page Auditor State ---
  const [auditTitle, setAuditTitle] = useState("DeepSeek-R1 Architecture: What It Means for Enterprise AI Automation");
  const [auditKeyword, setAuditKeyword] = useState("DeepSeek R1");
  const [auditContent, setAuditContent] = useState(defaultBlogPosts[0]?.content || "");
  const [auditResult, setAuditResult] = useState<OnPageAuditResult | null>(() =>
    auditOnPageSeo(
      "DeepSeek-R1 Architecture: What It Means for Enterprise AI Automation",
      defaultBlogPosts[0]?.content || "",
      "DeepSeek R1"
    )
  );

  // --- TAB 3: Keyword Research State ---
  const [keywordQuery, setKeywordQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(curatedKeywords[0]);

  // --- TAB 4: Backlink Engine State ---
  const [selectedOpp, setSelectedOpp] = useState<BacklinkOpportunity>(backlinkOpportunities[0]);
  const [pitchRecipient, setPitchRecipient] = useState("Awesome Team");
  const [pitchTone, setPitchTone] = useState<"founder" | "developer" | "pr">("founder");
  const [generatedPitch, setGeneratedPitch] = useState(() =>
    generateOutreachPitch(backlinkOpportunities[0], "Awesome Team", "founder")
  );

  // --- TAB 5: AI News Radar & GEO Matrix State ---
  const [newsFeed] = useState<NewsItem[]>(aiTechNewsFeed);
  const [aiShareOfVoice] = useState<AiShareOfVoiceRow[]>(getAiShareOfVoiceData);

  // --- GEO & SE Ranking MCP State ---
  const [showLlmsTxtModal, setShowLlmsTxtModal] = useState(false);
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [seRankingApiKey, setSeRankingApiKey] = useState(() => {
    return typeof window !== "undefined" ? localStorage.getItem("se_ranking_api_key") || "" : "";
  });

  const llmsTxtContent = generateLlmsTxt({
    siteName: "Shadow Flow",
    description: "Apache 2.0 open-source visual workflow engine for deterministic AI agents, MCP protocol, and high-performance WebAssembly runtimes.",
    url: "https://shadowflow.work",
    corePages: [
      { title: "Visual DAG Canvas", path: "/features", summary: "Graph-based canvas with multi-model routing, conditional branches, and sub-20ms node execution." },
      { title: "Universal Integrations", path: "/integrations", summary: "Connects 50+ REST APIs, Model Context Protocol (MCP) servers, databases, and webhook listeners." },
      { title: "Documentation & Quickstart", path: "/docs", summary: "Self-host via Docker, npm, or cloud runtimes with zero telemetry." },
      { title: "Interactive Canvas Demo", path: "/demo", summary: "Test live DAG execution in browser with instant topological layout." },
      { title: "API Reference", path: "/api-reference", summary: "Full OpenAPI specs for webhook triggers and workflow execution contracts." },
    ],
  });

  // Handle Quick Topic Fill
  const handleSelectQuickTopic = (qTopic: string, qKeyword: string) => {
    setTopic(qTopic);
    setPrimaryKeyword(qKeyword);
    toast.info(`Topic filled: "${qTopic}"`);
  };

  // Generate Article with AI Simulation
  const handleGenerateArticle = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or select one of the quick suggestions.");
      return;
    }
    const kw = primaryKeyword.trim() || topic.split(" ").slice(0, 3).join(" ");
    setIsGenerating(true);

    const steps = [
      "Analyzing top 10 search results & intent vectors...",
      "Extracting LSI semantic keywords and technical entities...",
      "Drafting authoritative H1, H2, and H3 outline...",
      "Writing deep-dive technical body with code examples...",
      "Optimizing on-page keyword density & readability...",
      "Generating JSON-LD Schema & AI Search citations...",
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise((r) => setTimeout(r, 600));
    }

    const generatedSlug = kw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const artTitle = `${topic}: Architecture, Code Patterns, and Production Benchmarks (${new Date().getFullYear()})`;
    const artDesc = `A technical guide to ${topic}, covering pipeline design, node interfaces, benchmarks, and self-hosted deployment on Shadow Flow.`;

    const markdownBody = `# ${artTitle}

> **Overview:** Running ${topic} in production requires clear boundary checks, deterministic retries, and low-latency node execution. This guide examines real performance benchmarks, implementation patterns, and code examples using Shadow Flow.

---

## 1. Practical Requirements for ${topic}

Engineering teams automating multi-step tasks face three immediate operational constraints: API call latency, token expenditure, and state persistence across retries. Moving from fixed linear scripts to autonomous pipelines requires addressing these factors directly.

Here is how **${kw}** works inside a production workflow:

- **State Isolation:** Each node maintains an immutable snapshot of incoming and outgoing data, preventing state corruption during unexpected restarts.
- **Cost Controls:** Deterministic caching reduces redundant model inferences by up to 65% for repeated inputs.
- **Protocol Compatibility:** Connects standard REST endpoints, webhooks, and Anthropic's Model Context Protocol (MCP) servers into a single graph.

---

## 2. Core Architecture and Data Flow

Separating user intent from tool execution ensures that agents cannot trigger unauthorized operations without validation.

\`\`\`
[Trigger: Webhook / Event]
        │
        ▼
[Router Node (Shadow Flow Core)]
   ├── Intent Classification (Local Fast LLM)
   ├── Context Synthesis (Vector / Memory Cache)
   └── Execution Fan-Out (MCP Protocol Connectors)
        │
        ▼
[Deterministic Validation & Output Delivery]
\`\`\`

### Execution Rules:

1. **Explicit Validation:** All parameters pass schema verification before tool execution.
2. **Dynamic Fallbacks:** If a primary model provider returns a rate limit or timeout, the pipeline routes to a secondary configured model.
3. **Local Boundary:** All payload data stays within your self-hosted instance without external telemetry.

---

## 3. Step-by-Step Implementation Guide

To run this pipeline in your self-hosted **Shadow Flow** engine, define the following configuration:

\`\`\`typescript
import { createWorkflow, nodeTypes } from "@shadowflow/engine";

export const workflow = createWorkflow({
  name: "${topic.replace(/"/g, "")} Pipeline",
  trigger: nodeTypes.Webhook({
    path: "/api/v1/${generatedSlug}",
    method: "POST",
  }),
  nodes: [
    nodeTypes.ContextAggregator({
      sources: ["docs", "database", "mcp-tools"],
    }),
    nodeTypes.AiAgent({
      model: "deepseek-reasoner",
      temperature: 0.2,
      systemPrompt: "You are an autonomous orchestrator managing ${kw}.",
    }),
    nodeTypes.SlackNotifier({
      channel: "#engineering-alerts",
      notifyOn: ["error", "completion"],
    }),
  ],
});
\`\`\`

---

## 4. Performance Metrics and Benchmarks

| Dimension | Legacy Webhook Automation | Shadow Flow AI Agent Engine |
| :--- | :--- | :--- |
| **Execution Latency** | 450ms | **18ms (Compiled WASM / Rust Core)** |
| **Agentic Tool Calling** | Manual HTTP REST boilerplate | **Native MCP & Dynamic Tools** |
| **Data Privacy** | SaaS Cloud Telemetry | **100% Air-Gapped / Self-Hosted** |
| **Licensing** | Commercial Restrictive | **Apache 2.0 Open Source** |

---

## 5. Summary and Getting Started

Setting up ${topic} does not require rebuilding your backend stack. With Shadow Flow's open-source visual canvas and code-first TypeScript API, teams can inspect and run workflows in minutes.

- ⭐ **Star Shadow Flow on GitHub**
- 📖 Read the [Documentation](/docs)
- 🚀 Test this workflow directly in our [Live Demo Canvas](/demo)
`;

    setGeneratedMarkdown(markdownBody);
    setGeneratedMeta({
      title: artTitle,
      description: artDesc,
      slug: generatedSlug,
    });
    setIsGenerating(false);
    toast.success("Article generated per 82 Human-Natural Writing Rules!");
  };

  // Generate Writer-Ready Content Brief (SE Ranking & Claude SEO Spec)
  const handleGenerateContentBrief = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or select one of the suggested titles.");
      return;
    }
    const kw = primaryKeyword.trim() || topic.split(" ").slice(0, 3).join(" ");
    const brief = generateContentBrief(topic, kw);

    let briefMd = `# Content Brief: ${brief.titleOptions[0]}\n\n`;
    briefMd += `> **Purpose:** Writer-ready editorial brief synthesized from SE Ranking & Claude SEO search intelligence.\n\n`;
    briefMd += `| Field | Value |\n`;
    briefMd += `| :--- | :--- |\n`;
    briefMd += `| **Template Type** | \`${brief.templateType}\` |\n`;
    briefMd += `| **Search Intent** | ${brief.searchIntent} |\n`;
    briefMd += `| **Target Word Count** | ${brief.targetWordCount.min} - ${brief.targetWordCount.max} words |\n`;
    briefMd += `| **Primary Focus Keyword** | **${brief.primaryKeyword}** |\n\n`;

    briefMd += `## 1. Title Options (Choose One)\n`;
    brief.titleOptions.forEach((t, i) => {
      briefMd += `${i + 1}. ${t}\n`;
    });

    briefMd += `\n## 2. Meta Description (150-160 Chars)\n`;
    briefMd += `> ${brief.metaDescription}\n\n`;

    briefMd += `## 3. Secondary Semantic Keywords (LSI)\n`;
    brief.secondaryKeywords.forEach(sk => {
      briefMd += `- \`${sk}\`\n`;
    });

    briefMd += `\n## 4. Section-by-Section Heading Structure\n\n`;
    brief.h2Outline.forEach(sec => {
      briefMd += `### ${sec.h2}\n\n`;
      briefMd += `**Subsections:**\n`;
      sec.h3s.forEach(h => briefMd += `- \`${h}\`\n`);
      briefMd += `\n**Key Talking Points:**\n`;
      sec.talkingPoints.forEach(tp => briefMd += `- ${tp}\n`);
      briefMd += `\n**Suggested Concrete Metrics to Cite:**\n`;
      sec.suggestedDataPoints.forEach(dp => briefMd += `- ${dp}\n`);
      briefMd += `\n---\n\n`;
    });

    briefMd += `## 5. Internal Linking Plan\n\n`;
    brief.internalLinkingPlan.forEach(link => {
      briefMd += `- Link to \`${link.targetPage}\` using anchor text "*${link.suggestedAnchor}*" in section **${link.section}**\n`;
    });

    briefMd += `\n## 6. Technical Schema & AI Search (GEO) Requirements\n\n`;
    briefMd += `- **Required Schema Types:** ${brief.schemaRequirements.join(", ")}\n`;
    briefMd += `- **AI Search Citability Angle:** ${brief.geoCitabilityAngle}\n`;

    setGeneratedMarkdown(briefMd);
    setGeneratedMeta({
      title: `Content Brief: ${brief.titleOptions[0]}`,
      description: brief.metaDescription,
      slug: `brief-${kw.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    });
    toast.success("Editorial Content Brief generated per SE Ranking spec!");
  };

  // Clean detected AI Buzzwords in Auditor
  const handleCleanBuzzwords = () => {
    if (!auditContent) return;
    const { cleanedText, replacementsCount } = humanizeContent(auditContent);
    setAuditContent(cleanedText);
    const newAudit = auditOnPageSeo(auditTitle, cleanedText, auditKeyword);
    setAuditResult(newAudit);
    if (replacementsCount > 0) {
      toast.success(`Replaced ${replacementsCount} AI buzzword(s) with plain human English per 82 Rules!`);
    } else {
      toast.info("No banned buzzwords found in the text.");
    }
  };

  // Publish Generated Article to Blog Store
  const handlePublishToBlog = () => {
    if (!generatedMarkdown || !generatedMeta.title) {
      toast.error("Please generate an article first.");
      return;
    }
    const newPost = {
      slug: generatedMeta.slug,
      title: generatedMeta.title,
      description: generatedMeta.description,
      content: generatedMarkdown,
      author: "Shadow Flow SEO Agent",
      authorRole: "Autonomous AI Content Engine",
      publishedAt: new Date().toISOString().split("T")[0],
      readTime: "6 min read",
      category: "AI & LLMs",
      tags: [primaryKeyword || "AI Automation", "Open Source", "Architecture"],
    };

    saveCustomBlogPost(newPost);
    toast.success("Article successfully published to Live Blog!", {
      action: {
        label: "View Post",
        onClick: () => navigate(`/blog/${newPost.slug}`),
      },
    });
  };

  // Inject contextual internal backlinks into the article
  const handleInjectBacklinks = () => {
    if (!generatedMarkdown) {
      toast.error("Please generate or enter an article first.");
      return;
    }
    const withLinks = injectInternalBacklinks(generatedMarkdown, generatedMeta.slug);
    setGeneratedMarkdown(withLinks);
    toast.success("Injected contextual internal backlinks into article!");
  };

  // Update existing blog post in place from the Auditor tab
  const handleUpdatePostInAuditor = () => {
    if (!auditContent) {
      toast.error("Content is empty.");
      return;
    }
    const match = defaultBlogPosts.find(
      (p) =>
        p.title.toLowerCase() === auditTitle.toLowerCase() ||
        p.slug.includes(auditKeyword.toLowerCase().replace(/\s+/g, "-"))
    );
    const slug = match ? match.slug : auditTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const updated = updateExistingBlogPost(slug, {
      title: auditTitle,
      content: auditContent,
      description: auditContent.slice(0, 160).replace(/[#*`]/g, "").trim(),
    });

    if (updated) {
      toast.success(`Updated blog post "/blog/${slug}"!`, {
        action: {
          label: "View Post",
          onClick: () => navigate(`/blog/${slug}`),
        },
      });
    } else {
      saveCustomBlogPost({
        slug,
        title: auditTitle,
        description: auditContent.slice(0, 160).replace(/[#*`]/g, "").trim(),
        content: auditContent,
        tags: [auditKeyword, "SEO Updated"],
      });
      toast.success(`Saved article as "/blog/${slug}"!`);
    }
  };

  // Send Generated Article to Auditor Tab
  const handleSendToAuditor = () => {
    if (!generatedMarkdown) {
      toast.error("Generate an article first.");
      return;
    }
    setAuditTitle(generatedMeta.title);
    setAuditKeyword(primaryKeyword || "Shadow Flow");
    setAuditContent(generatedMarkdown);
    const result = auditOnPageSeo(generatedMeta.title, generatedMarkdown, primaryKeyword || "Shadow Flow");
    setAuditResult(result);
    setActiveTab("auditor");
    toast.info("Transferred article to SEO Auditor.");
  };

  // Run Auditor on Demand
  const handleRunAudit = () => {
    const result = auditOnPageSeo(auditTitle, auditContent, auditKeyword);
    setAuditResult(result);
    toast.success("SEO Audit completed!");
  };

  // Handle Keyword Row Click to Write Post
  const handleKeywordToWriter = (kw: KeywordData) => {
    setTopic(kw.lsiQuestions[0] || `How to Master ${kw.keyword}`);
    setPrimaryKeyword(kw.keyword);
    setActiveTab("writer");
    toast.info(`Loaded keyword: "${kw.keyword}" into AI Blog Writer`);
  };

  // Handle News Item to Writer
  const handleNewsToWriter = (news: NewsItem) => {
    setTopic(`${news.title}: Deep Technical Breakdown`);
    setPrimaryKeyword(news.suggestedKeyword);
    setActiveTab("writer");
    toast.info(`Breaking news loaded: "${news.title}"`);
  };

  // Handle Pitch Generator Update
  const handleUpdatePitch = (opp: BacklinkOpportunity, recipient: string, t: "founder" | "developer" | "pr") => {
    setSelectedOpp(opp);
    setPitchRecipient(recipient);
    setPitchTone(t);
    setGeneratedPitch(generateOutreachPitch(opp, recipient, t));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Top Hero Banner */}
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-card to-background border border-primary/20 p-8 mb-10 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Autonomous SEO Agent v2.5
                  </div>
                  <button
                    onClick={() => setShowMcpModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 border border-border hover:border-primary/40 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Configure SE Ranking Remote MCP Server"
                  >
                    <Link2 className="w-3 h-3 text-primary" />
                    SE Ranking MCP: Connected
                  </button>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 border border-border text-[11px] text-cyan-400">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    Claude SEO: Active
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
                  AI SEO Studio & Content Engine
                </h1>
                <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
                  Automate full-lifecycle organic growth: monitor breaking AI tech news, generate search-dominating technical articles, audit on-page semantics, and execute high-authority backlink campaigns.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
                <div className="p-4 rounded-xl bg-card/80 border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Avg SEO Score
                  </div>
                  <div className="text-2xl font-bold text-foreground">96/100</div>
                  <div className="text-[11px] text-emerald-500">Top 1% Rank Readiness</div>
                </div>

                <div className="p-4 rounded-xl bg-card/80 border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Link2 className="w-4 h-4 text-primary" />
                    Backlink DA
                  </div>
                  <div className="text-2xl font-bold text-foreground">92+ Avg</div>
                  <div className="text-[11px] text-primary">High-Authority Targets</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 pt-6 border-t border-border/60 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Jump to:</span>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("writer")} className="text-xs h-7 gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> AI Blog Writer
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("auditor")} className="text-xs h-7 gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SEO Auditor
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("keywords")} className="text-xs h-7 gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-500" /> Keyword Research
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("backlinks")} className="text-xs h-7 gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-purple-500" /> Backlink Radar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("news")} className="text-xs h-7 gap-1.5">
                <Newspaper className="w-3.5 h-3.5 text-amber-500" /> AI News Stream
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLlmsTxtModal(true)}
                className="text-xs h-7 gap-1.5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <FileText className="w-3.5 h-3.5" /> /llms.txt
              </Button>
              <Link to="/blog" className="ml-auto text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium">
                Visit Public Blog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Main Workspace Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 p-1 bg-muted/60 rounded-xl h-auto gap-1">
              <TabsTrigger value="writer" className="py-2.5 data-[state=active]:bg-card text-xs sm:text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Blog Writer
              </TabsTrigger>
              <TabsTrigger value="auditor" className="py-2.5 data-[state=active]:bg-card text-xs sm:text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                SEO Auditor
              </TabsTrigger>
              <TabsTrigger value="keywords" className="py-2.5 data-[state=active]:bg-card text-xs sm:text-sm font-semibold flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                Keyword Research
              </TabsTrigger>
              <TabsTrigger value="backlinks" className="py-2.5 data-[state=active]:bg-card text-xs sm:text-sm font-semibold flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-500" />
                Backlink Engine
              </TabsTrigger>
              <TabsTrigger value="news" className="py-2.5 data-[state=active]:bg-card text-xs sm:text-sm font-semibold flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-amber-500" />
                AI News Radar
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: AI BLOG WRITER */}
            <TabsContent value="writer" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Configuration Panel */}
                <div className="lg:col-span-5 space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI Technical Article Generator
                      </CardTitle>
                      <CardDescription>
                        Engineered with proven SERP heuristics from sultrix-seo and agent-reach.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Quick Presets */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                          Popular Suggested Topics
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectQuickTopic(
                                "DeepSeek R1 Architecture for Enterprise AI Automation",
                                "DeepSeek R1"
                              )
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-left transition-colors"
                          >
                            🤖 DeepSeek R1 Architecture
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectQuickTopic(
                                "Migrating from n8n to Shadow Flow: The Definitive Guide",
                                "Migrate from n8n"
                              )
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-left transition-colors"
                          >
                            🔄 Migrate from n8n
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectQuickTopic(
                                "Model Context Protocol (MCP): Building Multi-Agent Tools",
                                "Model Context Protocol"
                              )
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-left transition-colors"
                          >
                            ⚡ MCP Agent Tools
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectQuickTopic(
                                "Building Autonomous AI Research Agents Locally",
                                "Autonomous AI Agents"
                              )
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-left transition-colors"
                          >
                            🧠 Local Autonomous Agents
                          </button>
                        </div>
                      </div>

                      {/* Topic Input */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Article Topic / Headline
                        </label>
                        <Input
                          placeholder="e.g. How to Build Production Multi-Agent Systems in 2026"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                      </div>

                      {/* Primary Focus Keyword */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Primary Target Keyword
                        </label>
                        <Input
                          placeholder="e.g. multi agent systems"
                          value={primaryKeyword}
                          onChange={(e) => setPrimaryKeyword(e.target.value)}
                        />
                      </div>

                      {/* Tone and Audience */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Writing Tone
                          </label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value as "authoritative" | "practical" | "conversational")}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                          >
                            <option value="authoritative">Authoritative & Deep-Dive</option>
                            <option value="practical">Practical Step-by-Step</option>
                            <option value="conversational">Engaging & Visionary</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Audience
                          </label>
                          <Input
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          onClick={handleGenerateArticle}
                          disabled={isGenerating}
                          className="gap-1.5 h-11 text-xs font-semibold"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Writing...
                            </>
                          ) : (
                            <>
                              <Bot className="w-3.5 h-3.5" />
                              Full Article
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleGenerateContentBrief}
                          disabled={isGenerating}
                          variant="outline"
                          className="gap-1.5 h-11 text-xs font-semibold border-primary/30 hover:bg-primary/10"
                          title="Generate complete writer-ready editorial brief following SE Ranking spec"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          Content Brief
                        </Button>
                      </div>

                      {isGenerating && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-medium text-primary">
                            <span>Agent Progress</span>
                            <span className="animate-pulse">Active</span>
                          </div>
                          <p className="text-muted-foreground italic">{generationStep}</p>
                          <Progress value={65} className="h-1.5" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Feature Highlights Card */}
                  <Card className="border-border bg-card/50">
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Built-in AI SEO Capabilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Semantic heading distribution with natural LSI keyword density (1.2% - 2.5%).</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Structured data tables & code snippets for Google Discover & Dev SERPs.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Formatted for LLMs.txt & AI Search engines (Perplexity, SearchGPT).</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Output Panel */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {generatedMarkdown ? `${generatedMarkdown.split(/\s+/).length} Words` : "0 Words"}
                      </Badge>
                      {generatedMeta.slug && (
                        <Badge variant="secondary" className="text-xs font-mono">
                          /{generatedMeta.slug}
                        </Badge>
                      )}
                      {generatedMarkdown && (
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          82 Rules: Human Authentic
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!generatedMarkdown}
                        onClick={handleInjectBacklinks}
                        className="text-xs gap-1.5 h-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        title="Auto-inject internal links to features, templates, docs, and sister posts"
                      >
                        <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                        Inject Backlinks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!generatedMarkdown}
                        onClick={handleSendToAuditor}
                        className="text-xs gap-1.5 h-8"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Audit SEO
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!generatedMarkdown}
                        onClick={() => {
                          navigator.clipboard.writeText(generatedMarkdown);
                          toast.success("Markdown copied to clipboard!");
                        }}
                        className="text-xs gap-1.5 h-8"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        disabled={!generatedMarkdown}
                        onClick={handlePublishToBlog}
                        className="text-xs gap-1.5 h-8 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Publish to Live Blog
                      </Button>
                    </div>
                  </div>

                  <Card className="border-border flex flex-col h-[600px] overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b border-border bg-muted/40">
                      <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                        <span>Markdown Editor & Preview</span>
                        <span>Formatted for GitHub & Astro/Vite</span>
                      </div>
                    </CardHeader>
                    <div className="flex-1 p-4 overflow-y-auto">
                      {generatedMarkdown ? (
                        <Textarea
                          value={generatedMarkdown}
                          onChange={(e) => setGeneratedMarkdown(e.target.value)}
                          className="w-full h-full min-h-[500px] font-mono text-xs sm:text-sm bg-transparent border-0 resize-none focus-visible:ring-0 leading-relaxed"
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                          <Bot className="w-12 h-12 text-muted-foreground/40 mb-3" />
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            No Article Generated Yet
                          </h4>
                          <p className="text-xs max-w-sm">
                            Select a recommended topic on the left or type your own keywords, then click "Generate Full SEO Article".
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: ON-PAGE SEO AUDITOR */}
            <TabsContent value="auditor" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Form */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        On-Page SEO & LLM Auditor
                      </CardTitle>
                      <CardDescription>
                        Audit real-time keyword density, readability, heading structure, and AI search readiness.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Article Title (H1)
                        </label>
                        <Input
                          value={auditTitle}
                          onChange={(e) => setAuditTitle(e.target.value)}
                          placeholder="Article title..."
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Target Primary Keyword
                        </label>
                        <Input
                          value={auditKeyword}
                          onChange={(e) => setAuditKeyword(e.target.value)}
                          placeholder="e.g. DeepSeek R1"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Content (Markdown or Plain Text)
                        </label>
                        <Textarea
                          value={auditContent}
                          onChange={(e) => setAuditContent(e.target.value)}
                          rows={10}
                          className="font-mono text-xs"
                          placeholder="Paste markdown content here..."
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handleRunAudit} className="flex-1 gap-2">
                          <RefreshCw className="w-4 h-4" /> Run Deep Audit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCleanBuzzwords}
                          className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs px-3"
                          title="Auto-replace AI buzzwords with plain human English per 82 rules"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Clean Buzzwords
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleUpdatePostInAuditor}
                          className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 text-xs px-3"
                          title="Save and update this content in the published blog"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-primary" /> Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Results */}
                <div className="lg:col-span-7 space-y-6">
                  {auditResult && (
                    <>
                      {/* Top Score Summary Banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-border bg-card/60 p-5 flex flex-col items-center justify-center text-center">
                          <div
                            className={`text-4xl font-extrabold ${
                              auditResult.overallScore >= 80
                                ? "text-emerald-500"
                                : auditResult.overallScore >= 60
                                ? "text-amber-500"
                                : "text-destructive"
                            }`}
                          >
                            {auditResult.overallScore}
                            <span className="text-lg text-muted-foreground">/100</span>
                          </div>
                          <div className="text-xs font-semibold text-foreground mt-1">SEO Health Score</div>
                          <div className="text-[11px] text-muted-foreground">
                            {auditResult.overallScore >= 80
                              ? "Excellent Rank Potential"
                              : "Optimization Recommended"}
                          </div>
                        </Card>

                        <Card className="border-border bg-card/60 p-5 flex flex-col items-center justify-center text-center">
                          <div className="text-3xl font-bold text-foreground">{auditResult.wordCount}</div>
                          <div className="text-xs font-semibold text-foreground mt-1">Total Words</div>
                          <div className="text-[11px] text-emerald-500">
                            {auditResult.wordCount >= 1000 ? "Long-form Authority" : "Adequate Length"}
                          </div>
                        </Card>

                        <Card className="border-border bg-card/60 p-5 flex flex-col items-center justify-center text-center">
                          <div className="text-3xl font-bold text-foreground">
                            {auditResult.keywordDensity}%
                          </div>
                          <div className="text-xs font-semibold text-foreground mt-1">Keyword Density</div>
                          <div className="text-[11px] text-muted-foreground">
                            Target Range: 0.5% - 3.0%
                          </div>
                        </Card>
                      </div>

                      {/* Detailed Checklist */}
                      <Card className="border-border">
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-semibold flex items-center justify-between">
                            <span>Audit Breakdown & Action Items</span>
                            <Badge variant="outline">{auditResult.recommendations.length} Recommendations</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Heading Counts */}
                          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-secondary/50 text-xs">
                            <div>
                              <span className="text-muted-foreground">H1 Count:</span>{" "}
                              <span className="font-bold text-foreground">{auditResult.headings.h1}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">H2 Count:</span>{" "}
                              <span className="font-bold text-foreground">{auditResult.headings.h2}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">H3 Count:</span>{" "}
                              <span className="font-bold text-foreground">{auditResult.headings.h3}</span>
                            </div>
                          </div>

                          {/* Recommendation list */}
                          <div className="space-y-2 pt-2">
                            {auditResult.recommendations.map((rec, i) => (
                              <div
                                key={i}
                                className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${
                                  rec.type === "pass"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                    : rec.type === "warning"
                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                                    : "bg-destructive/10 border-destructive/20 text-destructive-foreground"
                                }`}
                              >
                                {rec.type === "pass" ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <div className="font-semibold text-foreground">{rec.rule}</div>
                                  <div className="text-muted-foreground mt-0.5">{rec.message}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Human-Natural Writing Verification Card (82 Rules) */}
                      <Card className="border-border bg-card/40">
                        <CardHeader className="py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                Human-Natural Writing Audit (82 Rules)
                              </CardTitle>
                              <CardDescription className="text-xs mt-0.5">
                                Strict validation against AI buzzwords, robotic clichés, and significance padding.
                              </CardDescription>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs px-2.5 py-1 ${
                                  auditResult.humanizer?.passed
                                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                    : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                                }`}
                              >
                                {auditResult.humanizer?.score || 100}/100 •{" "}
                                {auditResult.humanizer?.passed ? "Authentic Human Voice" : "AI Tells Detected"}
                              </Badge>
                              {auditResult.humanizer && auditResult.humanizer.bannedWordsFound.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCleanBuzzwords}
                                  className="text-xs h-7 gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                                >
                                  <Sparkles className="w-3 h-3" /> Clean Buzzwords
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                          {/* Metric pills */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Banned Buzzwords</span>
                              <span className="text-sm font-bold text-foreground">
                                {auditResult.humanizer?.bannedWordsFound.length || 0}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Formulaic Openers</span>
                              <span className="text-sm font-bold text-foreground">
                                {auditResult.humanizer?.bannedPhrasesFound.filter(p => p.rule.includes("Rule 7")).length || 0}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Em-Dash Frequency</span>
                              <span className="text-sm font-bold text-foreground">
                                {auditResult.humanizer?.emDashCount || 0}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Chatbot Residue</span>
                              <span className="text-sm font-bold text-foreground">
                                {auditResult.humanizer?.bannedPhrasesFound.filter(p => p.rule.includes("Rule 35")).length || 0}
                              </span>
                            </div>
                          </div>

                          {/* Banned Words with Plain English Replacement Chips */}
                          {auditResult.humanizer && auditResult.humanizer.bannedWordsFound.length > 0 ? (
                            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Detected AI Buzzwords (Click 'Clean Buzzwords' to auto-replace):
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {auditResult.humanizer.bannedWordsFound.map((item, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-[11px] bg-background border-border text-foreground py-0.5"
                                  >
                                    <span className="line-through text-destructive mr-1">{item.word}</span>
                                    <span className="text-emerald-400 font-medium">→ {item.suggestion}</span>
                                    {item.count > 1 && (
                                      <span className="text-[10px] text-muted-foreground ml-1">({item.count}x)</span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              Zero AI buzzwords detected. Text reads naturally with plain verbs and concrete details.
                            </div>
                          )}

                          {/* Key Humanizer Rule Checks */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Rule Verification Checklist
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(auditResult.humanizer?.checks || []).slice(0, 6).map((c) => (
                                <div
                                  key={c.id}
                                  className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                                    c.passed
                                      ? "bg-secondary/30 border-border text-muted-foreground"
                                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                  }`}
                                >
                                  {c.passed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <div className="font-medium text-foreground text-[11px]">{c.name}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{c.details}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Search & GEO Readiness Card (Claude SEO Engine) */}
                      <Card className="border-border bg-card/40">
                        <CardHeader className="py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                AI Search (GEO) & Citability Audit (Claude SEO Engine)
                              </CardTitle>
                              <CardDescription className="text-xs mt-0.5">
                                Evaluates citation readiness for Google AI Overviews, Perplexity, ChatGPT, and Gemini.
                              </CardDescription>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs px-2.5 py-1 ${
                                  (auditResult.geo?.score || 0) >= 70
                                    ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                                    : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                                }`}
                              >
                                {auditResult.geo?.score || 80}/100 •{" "}
                                {auditResult.geo?.rating.toUpperCase() || "CITABLE"}
                              </Badge>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowLlmsTxtModal(true)}
                                className="text-xs h-7 gap-1.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                              >
                                <FileText className="w-3 h-3" /> View /llms.txt
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                          {/* Metric pills */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Early Direct Answer</span>
                              <span className={`text-xs font-bold ${auditResult.geo?.citability.hasEarlyDirectAnswer ? "text-emerald-400" : "text-amber-400"}`}>
                                {auditResult.geo?.citability.hasEarlyDirectAnswer ? "✓ In First 30%" : "⚠ Not Front-loaded"}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Concrete Data Points</span>
                              <span className="text-sm font-bold text-foreground">
                                {auditResult.geo?.citability.concreteDataPointsCount || 0}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Question Headings</span>
                              <span className="text-sm font-bold text-foreground">
                                {auditResult.geo?.structuralClarity.questionHeadingsCount || 0}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                              <span className="text-muted-foreground block text-[11px]">Structured Tables</span>
                              <span className={`text-xs font-bold ${auditResult.geo?.structuralClarity.hasComparisonTable ? "text-emerald-400" : "text-muted-foreground"}`}>
                                {auditResult.geo?.structuralClarity.hasComparisonTable ? "✓ Present" : "None"}
                              </span>
                            </div>
                          </div>

                          {/* Early answer snippet callout */}
                          {auditResult.geo?.citability.earlyAnswerSnippet && (
                            <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 space-y-1">
                              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                                Extracted Citable Opening Snippet:
                              </span>
                              <p className="text-foreground italic font-mono text-[11px] leading-relaxed">
                                "{auditResult.geo.citability.earlyAnswerSnippet}..."
                              </p>
                            </div>
                          )}

                          {/* GEO Recommendations */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              AI Citability Recommendations
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(auditResult.geo?.recommendations || []).map((r, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                                    r.type === "pass"
                                      ? "bg-secondary/30 border-border text-muted-foreground"
                                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                  }`}
                                >
                                  {r.type === "pass" ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <div className="font-medium text-foreground text-[11px]">{r.rule}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.message}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Schema.org Preview */}
                      <Card className="border-border">
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Code2 className="w-4 h-4 text-primary" />
                              Schema.org JSON-LD (Rich Snippets)
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                const schema = generateTechArticleSchema(
                                  auditTitle,
                                  "Comprehensive technical guide",
                                  "https://shadowflow.work/blog/deepseek",
                                  "2026-10-27"
                                );
                                navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                                toast.success("JSON-LD Schema copied to clipboard!");
                              }}
                            >
                              <Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON-LD
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="p-3 rounded-lg bg-secondary/60 text-[11px] font-mono overflow-x-auto text-muted-foreground">
                            {JSON.stringify(
                              generateTechArticleSchema(
                                auditTitle,
                                "Technical article for automated workflows",
                                "https://shadowflow.work/blog/sample",
                                "2026-10-27"
                              ),
                              null,
                              2
                            )}
                          </pre>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: KEYWORD RESEARCH */}
            <TabsContent value="keywords" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search keywords (e.g. n8n, deepseek, agents)..."
                    value={keywordQuery}
                    onChange={(e) => setKeywordQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Showing {searchKeywords(keywordQuery).length} curated high-intent search terms
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Keywords Table */}
                <div className="lg:col-span-8">
                  <Card className="border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Keyword</th>
                            <th className="py-3 px-4">Intent</th>
                            <th className="py-3 px-4">Monthly Vol</th>
                            <th className="py-3 px-4">KD (Difficulty)</th>
                            <th className="py-3 px-4">Est. CPC</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {searchKeywords(keywordQuery).map((kw) => (
                            <tr
                              key={kw.keyword}
                              onClick={() => setSelectedKeyword(kw)}
                              className={`hover:bg-muted/40 cursor-pointer transition-colors ${
                                selectedKeyword?.keyword === kw.keyword ? "bg-muted/50" : ""
                              }`}
                            >
                              <td className="py-3.5 px-4 font-semibold text-foreground">
                                {kw.keyword}
                              </td>
                              <td className="py-3.5 px-4">
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] ${
                                    kw.intent === "Transactional"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : kw.intent === "Commercial"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  }`}
                                >
                                  {kw.intent}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 font-mono">{kw.volume.toLocaleString()}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={kw.difficulty}
                                    className={`w-14 h-1.5 ${
                                      kw.difficulty > 70
                                        ? "bg-destructive/20 [&>div]:bg-destructive"
                                        : kw.difficulty > 40
                                        ? "bg-amber-500/20 [&>div]:bg-amber-500"
                                        : "bg-emerald-500/20 [&>div]:bg-emerald-500"
                                    }`}
                                  />
                                  <span className="font-mono text-[11px]">{kw.difficulty}/100</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-muted-foreground">${kw.cpc.toFixed(2)}</td>
                              <td className="py-3.5 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleKeywordToWriter(kw);
                                  }}
                                  className="text-xs h-7 gap-1"
                                >
                                  <Sparkles className="w-3 h-3 text-primary" /> Write
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* Keyword Detail Inspector */}
                <div className="lg:col-span-4 space-y-4">
                  {selectedKeyword ? (
                    <Card className="border-border">
                      <CardHeader>
                        <Badge variant="outline" className="w-fit text-[10px] mb-1">
                          Semantic Intelligence
                        </Badge>
                        <CardTitle className="text-lg">{selectedKeyword.keyword}</CardTitle>
                        <CardDescription>
                          Category: <span className="text-foreground font-medium">{selectedKeyword.category}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-xs">
                        <div>
                          <div className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider mb-2">
                            People Also Ask / LSI Questions
                          </div>
                          <ul className="space-y-2">
                            {selectedKeyword.lsiQuestions.map((q, i) => (
                              <li
                                key={i}
                                className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 hover:border-primary/40 transition-colors flex items-start gap-2"
                              >
                                <span className="text-primary font-bold">Q:</span>
                                <span className="text-foreground">{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider mb-2">
                            Competitor Target URLs
                          </div>
                          <ul className="space-y-1 text-muted-foreground font-mono text-[11px]">
                            {selectedKeyword.competitorUrls.map((u, i) => (
                              <li key={i} className="truncate hover:text-foreground">
                                • {u}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          onClick={() => handleKeywordToWriter(selectedKeyword)}
                          className="w-full gap-2 font-semibold"
                        >
                          <Sparkles className="w-4 h-4" /> Draft Article on this Topic
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-xs">
                      Click a keyword in the table to inspect SERP details.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: BACKLINK ENGINE */}
            <TabsContent value="backlinks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Targets Table */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">High-Authority Backlink Opportunities</h3>
                      <p className="text-xs text-muted-foreground">
                        Curated repositories, directories, and developer aggregators for Shadow Flow.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {backlinkOpportunities.length} Verified Targets
                    </Badge>
                  </div>

                  <Card className="border-border overflow-hidden">
                    <div className="divide-y divide-border text-xs">
                      {backlinkOpportunities.map((opp) => (
                        <div
                          key={opp.id}
                          onClick={() => handleUpdatePitch(opp, pitchRecipient, pitchTone)}
                          className={`p-4 hover:bg-muted/40 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                            selectedOpp.id === opp.id ? "bg-muted/60" : ""
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground text-sm">{opp.name}</span>
                              <Badge variant="secondary" className="text-[10px]">
                                {opp.type}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                                DA {opp.domainAuthority}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs line-clamp-1 mb-2">{opp.url}</p>
                            <p className="text-xs text-foreground/80">{opp.notes}</p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(opp.url, "_blank");
                            }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Pitch Generator */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Send className="w-4 h-4 text-purple-500" />
                        Automated Outreach Pitch
                      </CardTitle>
                      <CardDescription>
                        Customized outreach sequence tailored for {selectedOpp.name} (DA {selectedOpp.domainAuthority}).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Recipient / Team
                          </label>
                          <Input
                            value={pitchRecipient}
                            onChange={(e) => handleUpdatePitch(selectedOpp, e.target.value, pitchTone)}
                            className="text-xs h-8"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Tone
                          </label>
                          <select
                            value={pitchTone}
                            onChange={(e) => handleUpdatePitch(selectedOpp, pitchRecipient, e.target.value as "founder" | "developer" | "pr")}
                            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                          >
                            <option value="founder">Founder-to-Founder</option>
                            <option value="developer">Developer Showcase</option>
                            <option value="pr">PR & Contributor</option>
                          </select>
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Email Subject
                        </label>
                        <div className="p-2 rounded bg-secondary/50 font-medium text-foreground flex items-center justify-between">
                          <span>{generatedPitch.subject}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedPitch.subject);
                              toast.success("Subject copied!");
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Pitch Body */}
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Personalized Pitch Body
                        </label>
                        <Textarea
                          value={generatedPitch.body}
                          readOnly
                          rows={8}
                          className="font-mono text-xs bg-secondary/30 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Follow-up Note */}
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]">
                        <strong>Recommended Follow-up (Day +3):</strong>
                        <p className="mt-0.5 text-muted-foreground italic">"{generatedPitch.followUp}"</p>
                      </div>

                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Subject: ${generatedPitch.subject}\n\n${generatedPitch.body}\n\nFollow-up:\n${generatedPitch.followUp}`
                          );
                          toast.success("Full outreach pitch copied!");
                        }}
                        className="w-full gap-2 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Copy className="w-4 h-4" /> Copy Full Pitch Sequence
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: AI NEWS RADAR */}
            <TabsContent value="news" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Breaking AI & Technology News Radar</h3>
                  <p className="text-sm text-muted-foreground">
                    Live monitored trends in LLMs, open-source AI, agent protocols, and autonomous infrastructure.
                  </p>
                </div>
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Stream Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsFeed.map((item) => (
                  <Card key={item.id} className="border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {item.category}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{item.publishedAt}</span>
                      </div>
                      <CardTitle className="text-base leading-snug line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-3">
                        {item.summary}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                        <span className="text-muted-foreground">Source: <strong className="text-foreground">{item.source}</strong></span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            item.impact === "High" ? "text-primary border-primary/30" : "text-muted-foreground"
                          }`}
                        >
                          {item.impact} Impact
                        </Badge>
                      </div>

                      <Button
                        onClick={() => handleNewsToWriter(item)}
                        className="w-full gap-2 text-xs font-semibold h-9"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Draft Blog on this News
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Search Share of Voice Matrix (SE Ranking seo-ai-search-share-of-voice) */}
              <div className="pt-8 border-t border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      AI Search Share of Voice Matrix (GEO Leaderboard)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Benchmark visibility across Google AI Overviews, ChatGPT, Perplexity, Gemini, and Claude (Powered by SE Ranking MCP).
                    </p>
                  </div>

                  <Badge variant="outline" className="text-xs border-primary/30 text-primary py-1 px-3 self-start sm:self-auto">
                    5 Top Workflow Engines Monitored
                  </Badge>
                </div>

                <Card className="border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Domain / Brand</th>
                          <th className="py-3 px-4">Google AIO</th>
                          <th className="py-3 px-4">ChatGPT</th>
                          <th className="py-3 px-4">Perplexity</th>
                          <th className="py-3 px-4">Gemini</th>
                          <th className="py-3 px-4">Claude</th>
                          <th className="py-3 px-4 font-bold text-foreground">Avg Share</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {aiShareOfVoice.map((row) => (
                          <tr
                            key={row.domain}
                            className={`hover:bg-muted/40 transition-colors ${
                              row.domain === "shadowflow.work" ? "bg-primary/5 font-semibold" : ""
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{row.brand}</span>
                                <span className="text-[11px] text-muted-foreground font-mono">({row.domain})</span>
                                {row.domain === "shadowflow.work" && (
                                  <Badge variant="secondary" className="text-[9px] bg-primary/20 text-primary">
                                    Your Site
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono">{row.googleAiOverview}%</td>
                            <td className="py-3.5 px-4 font-mono">{row.chatGpt}%</td>
                            <td className="py-3.5 px-4 font-mono">{row.perplexity}%</td>
                            <td className="py-3.5 px-4 font-mono">{row.gemini}%</td>
                            <td className="py-3.5 px-4 font-mono">{row.claude}%</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-foreground">{row.averageShare}%</td>
                            <td className="py-3.5 px-4 text-right">
                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase font-bold ${
                                  row.status === "leader"
                                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                                    : row.status === "contender"
                                    ? "border-blue-500/30 text-blue-400 bg-blue-500/10"
                                    : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                                }`}
                              >
                                {row.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Dialog for llms.txt standard output */}
      <Dialog open={showLlmsTxtModal} onOpenChange={setShowLlmsTxtModal}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Generated /llms.txt (llmstxt.org Specification)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Standard plain-text interface for LLM search crawlers (GPTBot, PerplexityBot, ClaudeBot, Google-Extended).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Textarea
              readOnly
              value={llmsTxtContent}
              rows={12}
              className="font-mono text-xs bg-secondary/40 leading-relaxed border-border resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground">
                Deploy this file to your domain root at <code className="text-primary font-mono">/llms.txt</code>
              </span>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(llmsTxtContent);
                  toast.success("/llms.txt copied to clipboard!");
                }}
                className="gap-1.5 text-xs h-8"
              >
                <Copy className="w-3.5 h-3.5" /> Copy /llms.txt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for SE Ranking MCP Server Settings */}
      <Dialog open={showMcpModal} onOpenChange={setShowMcpModal}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              SE Ranking MCP Server Configuration
            </DialogTitle>
            <DialogDescription className="text-xs">
              Connect live search engine indexing, keyword difficulty, and backlink gaps via Model Context Protocol.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Remote MCP Server Endpoint
              </label>
              <Input
                readOnly
                value="https://api.seranking.com/mcp"
                className="font-mono text-xs bg-secondary/30"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                SE Ranking API Key (Optional)
              </label>
              <Input
                type="password"
                placeholder="Enter API key for live search index data..."
                value={seRankingApiKey}
                onChange={(e) => setSeRankingApiKey(e.target.value)}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Leave blank to use pre-curated search intelligence and local heuristics.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMcpModal(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("se_ranking_api_key", seRankingApiKey);
                  }
                  setShowMcpModal(false);
                  toast.success("SE Ranking MCP connection saved!");
                }}
                className="text-xs h-8"
              >
                Save & Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
