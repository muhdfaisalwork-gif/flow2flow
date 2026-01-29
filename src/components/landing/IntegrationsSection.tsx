import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const integrations = [
  { name: "Slack", emoji: "💬", category: "Communication" },
  { name: "GitHub", emoji: "🐙", category: "Development" },
  { name: "Notion", emoji: "📝", category: "Productivity" },
  { name: "Google Sheets", emoji: "📊", category: "Productivity" },
  { name: "Discord", emoji: "🎮", category: "Communication" },
  { name: "Stripe", emoji: "💳", category: "Payments" },
  { name: "OpenAI", emoji: "🤖", category: "AI" },
  { name: "PostgreSQL", emoji: "🐘", category: "Database" },
  { name: "Airtable", emoji: "📋", category: "Productivity" },
  { name: "Linear", emoji: "📐", category: "Development" },
  { name: "Jira", emoji: "🎯", category: "Development" },
  { name: "Twilio", emoji: "📱", category: "Communication" },
  { name: "AWS S3", emoji: "☁️", category: "Storage" },
  { name: "MongoDB", emoji: "🍃", category: "Database" },
  { name: "Anthropic", emoji: "🧠", category: "AI" },
  { name: "Supabase", emoji: "⚡", category: "Database" },
];

const automationPlatforms = [
  {
    name: "n8n",
    description: "Import/export workflows to n8n format for self-hosted automation",
    logo: "🔄",
    color: "from-orange-500 to-red-500",
    url: "https://n8n.io",
    features: ["Full workflow compatibility", "Node mapping", "Self-hosted"],
  },
  {
    name: "Activepieces",
    description: "Export workflows compatible with Activepieces automation platform",
    logo: "🧩",
    color: "from-blue-500 to-cyan-500",
    url: "https://activepieces.com",
    features: ["Trigger support", "Action mapping", "Open source"],
  },
  {
    name: "Zapier",
    description: "Export your workflows in Zapier-compatible format",
    logo: "⚡",
    color: "from-orange-400 to-amber-500",
    url: "https://zapier.com",
    features: ["Zap export", "Multi-step workflows", "5000+ apps"],
  },
  {
    name: "Make",
    description: "Export scenarios compatible with Make (formerly Integromat)",
    logo: "🎨",
    color: "from-purple-500 to-pink-500",
    url: "https://make.com",
    features: ["Scenario format", "Visual workflows", "Coming soon"],
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-24 relative overflow-hidden" id="integrations">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-electric uppercase tracking-wider">
            Integrations & Compatibility
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Connect to{" "}
            <span className="gradient-text">Everything</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            500+ pre-built integrations plus seamless import/export with other automation platforms.
          </p>
        </motion.div>

        {/* Automation Platform Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-xl font-semibold text-center mb-8">
            Works with your favorite automation tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {automationPlatforms.map((platform, index) => (
              <motion.a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-electric/50 transition-all duration-300 hover:shadow-lg hover:shadow-electric/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{platform.logo}</span>
                    <h4 className="font-semibold text-lg">{platform.name}</h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {platform.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {platform.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Scrolling Integration Cards */}
        <div className="relative">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Row 1 - Left to Right */}
          <motion.div
            className="flex gap-4 mb-4"
            animate={{ x: [0, -1000] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...integrations, ...integrations].map((integration, i) => (
              <div
                key={`row1-${i}`}
                className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-electric/50 transition-colors cursor-pointer"
              >
                <span className="text-2xl">{integration.emoji}</span>
                <div>
                  <div className="font-medium text-sm">{integration.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {integration.category}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Row 2 - Right to Left */}
          <motion.div
            className="flex gap-4"
            animate={{ x: [-1000, 0] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...integrations.slice().reverse(), ...integrations.slice().reverse()].map(
              (integration, i) => (
                <div
                  key={`row2-${i}`}
                  className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-electric/50 transition-colors cursor-pointer"
                >
                  <span className="text-2xl">{integration.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{integration.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {integration.category}
                    </div>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Can't find what you need? Build custom connectors in minutes.
          </p>
          <Button variant="outline" className="gap-2">
            View all integrations
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
