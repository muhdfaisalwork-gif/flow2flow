import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Handshake,
  CheckCircle2,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export default function Partners() {
  const [partnerForm, setPartnerForm] = useState({
    company: "",
    website: "",
    contactName: "",
    email: "",
    tier: "integrator",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.company || !partnerForm.email) {
      toast.error("Please fill in company name and email.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Partner application received! We'll be in touch.");
    }, 700);
  };

  const partnerTiers = [
    {
      title: "Solutions & System Integrators",
      badge: "Consultancies & Agencies",
      desc: "Deliver custom enterprise workflow automations, migration services, and private cloud deployments for clients using Shadow Flow.",
      benefits: [
        "Direct enterprise client leads in your region",
        "Architecture review sessions with core maintainers",
        "Verified Partner directory listing and badge",
        "Priority commercial support SLA",
      ],
    },
    {
      title: "Technology & ISV Partners",
      badge: "SaaS & API Providers",
      desc: "Build official, verified Shadow Flow integration nodes to give thousands of developers instant access to your developer platform.",
      benefits: [
        "Featured placement in the Integrations directory",
        "Co-branded launch articles and technical tutorials",
        "Joint webinars and developer showcases",
        "Early access to new core engine releases",
      ],
    },
    {
      title: "Cloud & Infrastructure Hosts",
      badge: "Hosting & Hardware",
      desc: "Provide 1-click template deployments, managed Shadow Flow hosting, and GPU acceleration for local LLM nodes.",
      benefits: [
        "1-click deploy templates in official documentation",
        "Co-marketing to self-hosted enterprise audiences",
        "Dedicated performance optimization benchmarks",
        "Direct channel partner referral program",
      ],
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
              <Handshake className="w-3.5 h-3.5" />
              Global Partner Network
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Scale Your Business with Shadow Flow
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Join leading cloud providers, systems integrators, and software vendors building mission-critical automation solutions on open-source technology.
            </p>
          </div>

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {partnerTiers.map((tier, i) => (
              <Card key={i} className="border-border bg-card/60 hover:border-primary/40 transition-all flex flex-col justify-between">
                <CardHeader className="space-y-2">
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {tier.badge}
                  </Badge>
                  <CardTitle className="text-xl font-bold pt-1">{tier.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {tier.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pt-2 border-t border-border">
                    <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      Key Benefits:
                    </div>
                    <ul className="space-y-2 text-xs">
                      {tier.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Application Form Banner */}
          <div className="max-w-3xl mx-auto p-8 sm:p-10 rounded-2xl bg-card border border-border shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">Apply to the Partner Program</h2>
              <p className="text-xs text-muted-foreground">
                Tell us about your organization and our partnership team will reach out within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold">Application Received!</h3>
                <p className="text-xs text-muted-foreground">
                  Our alliance director will review your submission and contact you directly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Company Name *
                    </label>
                    <Input
                      placeholder="e.g. Acme Cloud Systems"
                      value={partnerForm.company}
                      onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Company Website
                    </label>
                    <Input
                      placeholder="https://company.com"
                      value={partnerForm.website}
                      onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Contact Name
                    </label>
                    <Input
                      placeholder="e.g. Taylor Smith"
                      value={partnerForm.contactName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, contactName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Corporate Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="taylor@company.com"
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Partner Category
                  </label>
                  <select
                    value={partnerForm.tier}
                    onChange={(e) => setPartnerForm({ ...partnerForm, tier: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="integrator">Solutions & System Integrator</option>
                    <option value="isv">Technology & ISV Node Partner</option>
                    <option value="cloud">Cloud / Infrastructure Host</option>
                  </select>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full gap-2 font-semibold h-11">
                  {isSubmitting ? "Submitting Application..." : <>Submit Partner Application <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
