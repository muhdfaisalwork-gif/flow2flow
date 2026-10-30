import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Download, X, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SponsorshipBannerProps {
  onOpenModal: () => void;
}

export function SponsorshipBanner({ onOpenModal }: SponsorshipBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("shadowflow_sponsorship_banner_dismissed");
      if (isDismissed === "true") {
        setDismissed(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("shadowflow_sponsorship_banner_dismissed", "true");
    } catch {
      // ignore
    }
  };

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30 text-foreground py-2 px-3 sm:px-6 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left message & Badge */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/25 border border-primary/40 text-primary font-bold text-[11px] shrink-0">
            <HeartHandshake className="w-3.5 h-3.5 animate-pulse" />
            Sponsorships Open
          </span>

          <span className="text-foreground/90 font-medium truncate sm:overflow-visible">
            <span className="font-semibold text-foreground">Shadow Flow 2026 Ecosystem Partnerships:</span> Back open-source edge orchestration, Groq LPU compute, and developer bounties.
          </span>
        </div>

        {/* Right CTA buttons & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4 text-xs cursor-pointer"
          >
            <span>View Tiers &amp; Deck</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href="/ShadowFlow_Sponsorship_Deck.pptx"
            download="ShadowFlow_Sponsorship_Deck.pptx"
            className="hidden lg:inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded border border-border bg-background/50 hover:bg-background transition-colors"
            title="Download Sponsorship Deck"
          >
            <Download className="w-3 h-3" />
            Deck (.pptx)
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss sponsorship announcement"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background/40 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
