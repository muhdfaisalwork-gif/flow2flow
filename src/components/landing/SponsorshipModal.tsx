import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Mail,
  ExternalLink,
  Sparkles,
  Server,
  Puzzle,
  HeartHandshake,
  CheckCircle2,
  Github,
  ArrowRight,
} from "lucide-react";

interface SponsorshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SponsorshipModal({ open, onOpenChange }: SponsorshipModalProps) {
  const tiers = [
    {
      name: "Tier 1: Infrastructure & Compute",
      price: "$1,500",
      cadence: "/ month",
      badge: "Flagship Partner",
      icon: Server,
      accent: "border-primary/50 bg-primary/5",
      description: "Directly funds global edge database clusters, Groq LPU inference pools, and community compute quotas.",
      deliverables: [
        "Featured logo on shadowflow.work header, README, and docs",
        "Dedicated edge compute cluster sponsorship credit",
        "Co-authored technical case study & monthly changelog feature",
        "Direct Slack/Discord channel with core maintainers",
        "Unlimited custom node integrations support",
      ],
      buttonText: "Inquire Infrastructure Tier",
      subject: "Tier 1: Infrastructure & Compute Sponsorship Inquiry",
    },
    {
      name: "Tier 2: Node Ecosystem & Integration",
      price: "$750",
      cadence: "/ month",
      badge: "Ecosystem Builder",
      icon: Puzzle,
      accent: "border-emerald-500/40 bg-emerald-500/5",
      description: "Co-funds new integration connectors, verified API adapters, and dedicated workflow blueprints.",
      deliverables: [
        "Verified Partner badge in the 120+ Template Hub",
        "Featured placement on official Integrations directory",
        "Co-branded step-by-step workflow tutorial",
        "Priority backlog requests for custom enterprise nodes",
        "Logo in quarterly ecosystem release briefings",
      ],
      buttonText: "Inquire Integration Tier",
      subject: "Tier 2: Node Ecosystem Sponsorship Inquiry",
    },
    {
      name: "Tier 3: Open-Source Backer",
      price: "$250",
      cadence: "/ month",
      badge: "Community Champion",
      icon: HeartHandshake,
      accent: "border-purple-500/40 bg-purple-500/5",
      description: "Supports open-source developer bounties, security audits, and Graphify memory maintenance.",
      deliverables: [
        "Logo in GitHub repository README & Contributors Hall",
        "Quarterly state-of-automation ecosystem roadmap access",
        "Early access beta testing for edge copilot capabilities",
        "Official backer recognition badge on GitHub and website",
      ],
      buttonText: "Inquire Community Tier",
      subject: "Tier 3: Open-Source Backer Sponsorship Inquiry",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-card border-border">
        <DialogHeader className="text-left space-y-3 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              2026 Ecosystem & Grant Partnerships
            </Badge>
            <span className="text-xs text-muted-foreground">Open-Source Apache 2.0 Automation</span>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sponsorship & Grant Opportunities
          </DialogTitle>

          <DialogDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Shadow Flow provides modern, sub-50ms edge-native workflow automation. Partner with us to power global compute, zero-telemetry client-side privacy, and 120+ open-source templates.
          </DialogDescription>

          {/* Quick Deck Download Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
            >
              <a href="/ShadowFlow_Sponsorship_Deck.pptx" download="ShadowFlow_Sponsorship_Deck.pptx">
                <Download className="w-3.5 h-3.5" />
                Download Sponsorship Deck (.pptx)
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-medium border-border hover:bg-muted"
            >
              <a href="/ShadowFlow_Investor_Pitch_Deck.pptx" download="ShadowFlow_Investor_Pitch_Deck.pptx">
                <Download className="w-3.5 h-3.5" />
                Investor Deck (.pptx)
              </a>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <a href="https://github.com/muhdfaisalwork-gif/shadowflow" target="_blank" rel="noopener noreferrer">
                <Github className="w-3.5 h-3.5" /> GitHub Repo <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </Button>
          </div>
        </DialogHeader>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card key={tier.name} className={`flex flex-col justify-between border ${tier.accent} transition-all`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-background/80 border border-border flex items-center justify-center text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {tier.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-foreground leading-snug">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-foreground">{tier.price}</span>
                      <span className="text-xs text-muted-foreground">{tier.cadence}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                      Deliverables:
                    </span>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {tier.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <div className="p-5 pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <a
                      href={`mailto:sponsor@shadowflow.work?subject=${encodeURIComponent(tier.subject)}&body=${encodeURIComponent(
                        `Hi Shadow Flow Team,\n\nWe would like to partner with Shadow Flow under the ${tier.name}.\n\nCompany / Organization:\nContact Name:\nProposed Goals:\n\nBest regards,`
                      )}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {tier.buttonText}
                    </a>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer Contact Callout */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-foreground">Need Custom Terms or Grant Alignments?</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              We also support enterprise grant partnerships, custom hardware sponsorships, and research agreements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gap-1.5 text-xs">
              <a href="mailto:sponsor@shadowflow.work?subject=Custom%20Sponsorship%20or%20Grant%20Inquiry">
                <Mail className="w-3.5 h-3.5" /> Contact sponsor@shadowflow.work <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
