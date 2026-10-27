import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Mail,
  MessageSquare,
  ShieldAlert,
  Send,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been routed to our team.");
    }, 800);
  };

  const supportChannels = [
    {
      title: "Community & Technical Support",
      desc: "For general questions, troubleshooting, and custom node assistance.",
      action: "Ask on Discord",
      href: "https://discord.com",
      icon: MessageSquare,
    },
    {
      title: "Enterprise Solutions",
      desc: "Tailored deployment architectures, private SLAs, and on-premises consulting.",
      action: "enterprise@shadowflow.dev",
      href: "mailto:enterprise@shadowflow.dev",
      icon: Building,
    },
    {
      title: "Security & Vulnerability Disclosure",
      desc: "Coordinated vulnerability disclosures and PGP-encrypted security reports.",
      action: "security@shadowflow.dev",
      href: "mailto:security@shadowflow.dev",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 text-xs">
              Get in Touch
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              We're Here to Help
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Have questions about running Shadow Flow in your infrastructure, migrating from legacy tools, or contributing to the core engine? Connect with us.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            {/* Contact Channels Side */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xl font-bold">Direct Channels</h2>
              <div className="space-y-4">
                {supportChannels.map((c, i) => (
                  <Card key={i} className="border-border bg-card/60">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <c.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-foreground">{c.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-medium hover:underline inline-block pt-1"
                        >
                          {c.action} →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-5 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground space-y-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Average Response Time
                </div>
                <p>
                  Community inquiries on Discord receive responses within minutes. Enterprise and email tickets are answered within 4 business hours.
                </p>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-7">
              <Card className="border-border p-6 sm:p-8 bg-card/60">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl">Send Us a Direct Message</CardTitle>
                  <CardDescription className="text-xs">
                    Fill out the form below and an engineer will reach back promptly.
                  </CardDescription>
                </CardHeader>

                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Message Received!</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Thank you for contacting us. We've routed your inquiry to our engineering team and will follow up shortly.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: "", email: "", category: "general", message: "" });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Your Name *
                        </label>
                        <Input
                          placeholder="e.g. Alex Chen"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          Work Email *
                        </label>
                        <Input
                          type="email"
                          placeholder="alex@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="enterprise">Enterprise Self-Hosted Deployment</option>
                        <option value="migration">Migration from n8n / Zapier</option>
                        <option value="security">Security & Compliance</option>
                        <option value="partners">Partner Program</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                        How can we help? *
                      </label>
                      <Textarea
                        placeholder="Tell us about your automation stack, volume expectations, or specific requirements..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full gap-2 font-semibold h-11"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Inquiry
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
