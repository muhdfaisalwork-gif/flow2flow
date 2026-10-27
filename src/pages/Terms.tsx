import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <FileText className="w-3.5 h-3.5" />
              Legal Agreements
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">
              Last Updated: October 2026 • Effective Immediately
            </p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. Agreement to Terms</h2>
              <p>
                By accessing our website, using our hosted cloud preview environments, or utilizing the Shadow Flow software, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. Open Source Software License</h2>
              <p>
                The core source code of Shadow Flow is licensed under the <strong>Apache License, Version 2.0</strong>. You are granted complete freedom to inspect, modify, fork, and distribute the software in compliance with the terms of that license.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. Acceptable Use Policy</h2>
              <p>
                You agree not to use Shadow Flow's hosted services or infrastructure to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-foreground/90">
                <li>Conduct denial-of-service (DoS) attacks or transmit malicious code.</li>
                <li>Harvest credentials or bypass third-party authentication boundaries without authorization.</li>
                <li>Engage in illegal activity, spam generation, or abusive API scraping.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">4. Cloud Subscriptions & Billing</h2>
              <p>
                Certain managed hosting tiers and team collaboration tools require a paid subscription. Billing is handled on a recurring monthly or annual basis. You may cancel at any time, and cancellation takes effect at the end of the current billing cycle.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">5. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SHADOW FLOW AND ITS MAINTAINERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION ARISING FROM YOUR USE OF THE SOFTWARE.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">6. Contact Information</h2>
              <p>
                For questions regarding these Terms of Service, please contact our legal team at <code className="text-foreground">legal@shadowflow.dev</code>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
