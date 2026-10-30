import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  getBlogPostBySlug,
  getAllBlogPosts,
  fetchBlogPostBySlug,
  fetchDynamicBlogs,
  PRESET_BLOG_POSTS,
  BlogPost as BlogPostType,
} from "@/lib/seo/blogEngine";
import { generateTechArticleSchema } from "@/lib/seo/seoEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Copy,
  Sparkles,
  Bot,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPostType | undefined>(() => (slug ? getBlogPostBySlug(slug) : undefined));
  const [allPosts, setAllPosts] = useState<BlogPostType[]>(() => getAllBlogPosts());
  const [isLoading, setIsLoading] = useState<boolean>(!post);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    const existing = getBlogPostBySlug(slug);
    if (existing && existing.content && existing.content.trim()) {
      setPost(existing);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    fetchBlogPostBySlug(slug)
      .then((found) => {
        if (!isMounted) return;
        if (found && found.content && found.content.trim()) {
          setPost(found);
        } else {
          const fallback = PRESET_BLOG_POSTS.find((p) => p.slug === slug);
          if (fallback && fallback.content && fallback.content.trim()) {
            setPost(fallback);
          }
        }
      })
      .catch((err) => console.warn("Failed to load article by slug:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    fetchDynamicBlogs()
      .then((dynamicPosts) => {
        if (isMounted && dynamicPosts.length > 0) {
          setAllPosts(dynamicPosts);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const relatedPosts = useMemo(() => {
    return allPosts.filter((p) => p.slug !== slug).slice(0, 3);
  }, [allPosts, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-1">Loading Technical Deep Dive...</h2>
            <p className="text-xs text-muted-foreground">Retrieving article markdown and verification schemas</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The article you are looking for does not exist or may have been moved.
            </p>
            <Button onClick={() => navigate("/blog")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Schema.org structured data
  const jsonLd = generateTechArticleSchema(
    post.title,
    post.description,
    window.location.href,
    post.publishedAt
  );

  // Inline markdown parser for links, bold, code, and italic
  const renderInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        const href = match[3];
        const isExternal = href.startsWith("http") && !href.includes("shadowflow.work");
        parts.push(
          <a
            key={`link-${match.index}`}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            {match[2]}
          </a>
        );
      } else if (match[4]) {
        parts.push(
          <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
            {match[4]}
          </strong>
        );
      } else if (match[5]) {
        parts.push(
          <code key={`code-${match.index}`} className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-primary font-medium">
            {match[5]}
          </code>
        );
      } else if (match[6]) {
        parts.push(
          <em key={`italic-${match.index}`} className="italic text-foreground/90">
            {match[6]}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Simple Markdown renderer for headings, code blocks, lists, quotes, tables
  const renderMarkdownContent = (markdown: string) => {
    if (!markdown || !markdown.trim()) return null;
    const normalizedMarkdown = markdown.replace(/\r\n/g, "\n");
    const lines = normalizedMarkdown.split("\n");
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      // Code block start / end
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.replace("```", "").trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeString = codeBuffer.join("\n");
          elements.push(
            <div key={`code-${index}`} className="my-6 rounded-xl overflow-hidden border border-border bg-muted/60">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border text-xs text-muted-foreground font-mono">
                <span>{codeLanguage || "plaintext"}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(codeString);
                    toast.success("Code copied to clipboard!");
                  }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto text-foreground leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={index} className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-foreground">
            {renderInlineMarkdown(line.replace("# ", ""))}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="text-2xl sm:text-3xl font-bold tracking-tight mt-8 mb-4 text-foreground border-b border-border pb-2">
            {renderInlineMarkdown(line.replace("## ", ""))}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="text-xl sm:text-2xl font-semibold mt-6 mb-3 text-foreground">
            {renderInlineMarkdown(line.replace("### ", ""))}
          </h3>
        );
      } else if (line.startsWith("#### ")) {
        elements.push(
          <h4 key={index} className="text-lg sm:text-xl font-semibold mt-4 mb-2 text-foreground">
            {renderInlineMarkdown(line.replace("#### ", ""))}
          </h4>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={index} className="my-4 border-l-4 border-primary pl-4 italic text-muted-foreground bg-primary/5 py-2 pr-4 rounded-r-lg">
            {renderInlineMarkdown(line.replace("> ", ""))}
          </blockquote>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={index} className="ml-6 list-disc text-sm text-foreground/90 my-1 leading-relaxed">
            {renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={index} className="ml-6 list-decimal text-sm text-foreground/90 my-1 leading-relaxed">
            {renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}
          </li>
        );
      } else if (line.startsWith("|")) {
        // Table row rendered as monospace border
        elements.push(
          <div key={index} className="font-mono text-xs overflow-x-auto py-1 text-muted-foreground">
            {line}
          </div>
        );
      } else if (line.trim() === "---") {
        elements.push(<hr key={index} className="my-8 border-border" />);
      } else if (line.trim()) {
        elements.push(
          <p key={index} className="text-sm sm:text-base text-foreground/90 leading-relaxed my-3">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      const codeString = codeBuffer.join("\n");
      elements.push(
        <div key="unclosed-code" className="my-6 rounded-xl overflow-hidden border border-border bg-muted/60">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border text-xs text-muted-foreground font-mono">
            <span>{codeLanguage || "plaintext"}</span>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto text-foreground leading-relaxed">
            <code>{codeString}</code>
          </pre>
        </div>
      );
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="flex-1 pt-28 sm:pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Breadcrumb / Back button */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to all articles
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Article link copied!");
                }}
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>

              <Button asChild size="sm" variant="outline" className="text-xs h-8 gap-1.5">
                <Link to="/seo-agent">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> SEO Studio
                </Link>
              </Button>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {post.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {post.description}
            </p>

            {/* Author bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {typeof post.author === 'object' ? post.author?.name : post.author}
                  </div>
                  <div className="text-xs text-muted-foreground">{post.authorRole}</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SEO Audited & Verified
              </div>
            </div>
          </header>

          {/* Article Body */}
          <article className="prose prose-invert max-w-none mb-16">
            {post.content ? (
              renderMarkdownContent(post.content)
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-xl">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading article content from edge cache...</p>
              </div>
            )}
          </article>

          {/* Author / AI SEO Attribution Footer */}
          <Card className="border-border bg-card/50 p-6 mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Written with Shadow Flow SEO Agent
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    This article was authored and formatted for zero-hallucination technical accuracy, Perplexity & Google Discover search visibility, and schema completeness.
                  </p>
                </div>
              </div>

              <Button asChild size="sm" className="gap-2 shrink-0">
                <Link to="/seo-agent">
                  Explore SEO Studio <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Related Architectural Guides</h3>
                <Link to="/blog" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="p-4 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <Badge variant="secondary" className="text-[10px] mb-2">
                        {r.category}
                      </Badge>
                      <h4 className="text-sm font-semibold line-clamp-2 hover:text-primary transition-colors">
                        {r.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-4 block">
                      {r.readTime}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
