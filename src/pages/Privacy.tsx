import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy-First Architecture
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">
              Last Updated: October 2026 • Effective Immediately
            </p>
          </div>

          {/* Privacy Callout */}
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 mb-10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              The Shadow Flow Zero-Telemetry Guarantee
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you download and run the self-hosted edition of Shadow Flow (via Docker, npm, or source), <strong>zero data</strong> is collected, monitored, or transmitted back to us. We operate no tracking pings, heartbeat servers, or phone-home telemetry.
            </p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Overview and Scope</h2>
              <p>
                Shadow Flow ("we", "our", or "the Project") is committed to honoring developer privacy. This Privacy Policy details how information is handled when you visit our website, use our cloud-hosted preview environments, or deploy our self-hosted open-source software.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Self-Hosted Deployments</h2>
              <p>
                For all self-hosted deployments:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
                <li>All execution payloads, credentials, logs, and database records remain strictly within your local environment or private cloud VPC.</li>
                <li>API keys stored in the Credential Vault are encrypted at rest using AES-256-GCM.</li>
                <li>We do not receive execution metrics, node graph schemas, or user counts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. Cloud & Web Services Data Collection</h2>
              <p>
                When utilizing our optional managed cloud services or website:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
                <li><strong>Account Credentials:</strong> Email addresses and profile names collected during authentication.</li>
                <li><strong>Payment Information:</strong> Handled securely by our PCI-compliant payment processor (Stripe). We never store raw credit card numbers.</li>
                <li><strong>Operational Logs:</strong> Transient server error logs retained for a maximum of 14 days solely for platform stability.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. AI Models & Data Training</h2>
              <p>
                <strong>We will never sell or train AI models on your private workflow payloads.</strong> When you invoke AI nodes (such as OpenAI, Anthropic, or DeepSeek), your payloads are transmitted directly between your runner and the configured AI provider under your own API credentials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. GDPR & CCPA Rights</h2>
              <p>
                You retain full statutory rights to access, rectify, export, or permanently delete any personal information associated with your cloud account. To execute a deletion request, email <code className="text-foreground">privacy@shadowflow.work</code>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
