import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Github,
  MessageCircle,
  Twitter,
  Heart,
  Code2,
  Users,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function Community() {
  const communityChannels = [
    {
      name: "GitHub Repository",
      description: "Star the project, report bugs, review code diffs, or submit pull requests.",
      icon: Github,
      actionText: "Star & Fork on GitHub",
      href: "https://github.com/muhdfaisalwork-gif/shadowflow",
      badge: "Open Source (Apache 2.0)",
    },
    {
      name: "Discord Server",
      description: "Chat in real-time with fellow automation engineers, ask questions, and share custom node scripts.",
      icon: MessageCircle,
      actionText: "Join Discord Community",
      href: "https://discord.com",
      badge: "Real-time Chat",
    },
    {
      name: "Twitter / X Dispatch",
      description: "Stay informed on release drops, benchmark results, and deep architecture breakdowns.",
      icon: Twitter,
      actionText: "Follow @ShadowFlow",
      href: "https://twitter.com",
      badge: "News & Releases",
    },
  ];

  const contributionPaths = [
    {
      title: "1. Build Custom Integration Nodes",
      desc: "Write new nodes using our TypeScript SDK to connect popular APIs and services to the Shadow Flow canvas.",
    },
    {
      title: "2. Improve Engine Core & Performance",
      desc: "Optimize the React Flow DAG renderer, WebAssembly local execution runtime, and queue concurrency.",
    },
    {
      title: "3. Share Community Workflow Templates",
      desc: "Export useful production workflows and submit them to our community library for everyone to use.",
    },
    {
      title: "4. Enhance Documentation & Tutorials",
      desc: "Write practical guides, fix typos, and translate documentation to help engineers worldwide.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Users className="w-3.5 h-3.5" />
              Global Open-Source Collective
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Built by Engineers, for Engineers
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Shadow Flow thrives through its community of automation architects, open-source contributors, and AI researchers. Join the movement.
            </p>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {communityChannels.map((c) => (
              <Card key={c.name} className="border-border bg-card/60 hover:border-primary/40 transition-all flex flex-col justify-between">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                      <c.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {c.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold">{c.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {c.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full text-xs font-semibold gap-2">
                    <a href={c.href} target="_blank" rel="noopener noreferrer">
                      {c.actionText} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How to Contribute Section */}
          <div className="p-8 sm:p-12 rounded-2xl bg-secondary/30 border border-border mb-16">
            <div className="max-w-2xl mb-8">
              <h2 className="text-2xl font-bold mb-2">How to Contribute to Shadow Flow</h2>
              <p className="text-sm text-muted-foreground">
                Whether you are fixing a small typo or building a full multi-agent orchestration subsystem, every contribution is celebrated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contributionPaths.map((p, i) => (
                <div key={i} className="p-5 rounded-xl bg-card border border-border">
                  <h3 className="font-bold text-sm text-foreground mb-1.5">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
