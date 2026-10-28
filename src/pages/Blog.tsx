import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { getAllBlogPosts, BlogPost } from "@/lib/seo/blogEngine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  TrendingUp,
  Bot,
  Tag,
} from "lucide-react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const posts = useMemo(() => getAllBlogPosts(), []);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "All" || post.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [posts, searchQuery, selectedCategory]);

  const featuredPost = posts[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Top Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Shadow Flow Engineering & AI Dispatch
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              The Architecture of Autonomous Workflows
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Deep dives, migration guides, and benchmarks on open-source workflow orchestration, local LLM agents, and deterministic automation.
            </p>
          </div>

          {/* Autonomous SEO Agent CTA Callout */}
          <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-primary/15 via-purple-500/10 to-card border border-primary/25 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-foreground">
                    Powered by Shadow Flow SEO Agent Studio
                  </h3>
                  <Badge variant="outline" className="text-xs bg-background/50">
                    Live Engine
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  These technical deep dives and breaking AI analyses are continuously researched, audited, and optimized by our built-in SEO & Backlink Agent.
                </p>
              </div>
            </div>

            <Button asChild className="gap-2 font-semibold shrink-0">
              <Link to="/seo-agent">
                Open SEO Agent Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Featured Article Card */}
          {featuredPost && selectedCategory === "All" && !searchQuery && (
            <div className="mb-12">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Featured Architectural Deep Dive
              </div>
              <Card className="border-border overflow-hidden bg-card/60 hover:border-primary/40 transition-all shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {featuredPost.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {featuredPost.publishedAt}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <Link to={`/blog/${featuredPost.slug}`} className="block group">
                      <h2 className="text-2xl sm:text-3xl font-bold group-hover:text-primary transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                    </Link>

                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {featuredPost.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {featuredPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground"
                        >
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Button asChild variant="outline" className="gap-2">
                        <Link to={`/blog/${featuredPost.slug}`}>
                          Read Deep Dive <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col justify-center rounded-xl bg-gradient-to-br from-primary/10 to-background border border-border p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div className="font-semibold text-foreground text-sm">
                      {typeof featuredPost.author === 'object' ? featuredPost.author?.name : featuredPost.author}
                    </div>
                    <div className="text-xs text-muted-foreground">{featuredPost.authorRole}</div>
                    <div className="mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                      Structured for AI citations, Perplexity discovery, and technical engineering teams.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles & guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          {/* Articles Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.slug}
                  className="border-border flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-lg bg-card/60 group"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-[11px]">
                        {post.category}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <Link to={`/blog/${post.slug}`} className="block">
                      <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </Link>

                    <CardDescription className="text-xs line-clamp-3 leading-relaxed">
                      {post.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.publishedAt}</span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-primary font-medium inline-flex items-center gap-1 hover:underline"
                      >
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 p-8 rounded-2xl border border-dashed border-border">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-1">No articles found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No articles matched your search query "{searchQuery}".
              </p>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
