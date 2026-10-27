import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Cookie, CheckCircle2 } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Cookie className="w-3.5 h-3.5" />
              Transparent Storage
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
            <p className="text-xs text-muted-foreground">
              Last Updated: October 2026 • Effective Immediately
            </p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">1. What Are Cookies?</h2>
              <p>
                Cookies and local browser storage (such as <code>localStorage</code>) are small text files placed on your device to enable core website functionality, remember preferences, and maintain secure user authentication sessions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">2. How Shadow Flow Uses Cookies</h2>
              <p>
                We maintain a strict minimal cookie policy. We <strong>do not</strong> use third-party tracking cookies or advertising networks. We only utilize:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-border bg-card/60">
                  <h4 className="font-bold text-sm text-foreground mb-1">Essential Authentication Cookies</h4>
                  <p className="text-xs text-muted-foreground">
                    Cryptographic tokens required to keep you signed in securely and protect your workflows from cross-site request forgery (CSRF).
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card/60">
                  <h4 className="font-bold text-sm text-foreground mb-1">Functional Preferences</h4>
                  <p className="text-xs text-muted-foreground">
                    Stores your chosen UI theme (dark or light mode) and zoom/pan preferences on the canvas so you don't have to reset them every visit.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">3. Managing and Disabling Cookies</h2>
              <p>
                Most modern web browsers allow you to control cookie settings through their preferences menu. Note that disabling essential cookies may impact your ability to remain logged in to the workflow canvas.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
