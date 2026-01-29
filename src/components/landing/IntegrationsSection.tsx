import { motion } from "framer-motion";

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

export function IntegrationsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-electric uppercase tracking-wider">
            Integrations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Connect to{" "}
            <span className="gradient-text">Everything</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            500+ pre-built integrations and growing. Can't find what you need? 
            Build custom connectors in minutes.
          </p>
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
          <a
            href="#"
            className="text-electric hover:underline font-medium inline-flex items-center gap-2"
          >
            View all 500+ integrations →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
