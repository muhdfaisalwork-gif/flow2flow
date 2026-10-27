import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const competitors = [
  { name: "Shadow Flow", highlight: true },
  { name: "Zapier", highlight: false },
  { name: "Make", highlight: false },
  { name: "n8n", highlight: false },
];

const features = [
  { name: "Open Source", flowforge: true, zapier: false, make: false, n8n: true },
  { name: "Self-Hostable", flowforge: true, zapier: false, make: false, n8n: true },
  { name: "Visual Builder", flowforge: true, zapier: true, make: true, n8n: true },
  { name: "AI Assistant", flowforge: true, zapier: "partial", make: false, n8n: false },
  { name: "Code Support", flowforge: true, zapier: "partial", make: "partial", n8n: true },
  { name: "Real-time Execution View", flowforge: true, zapier: false, make: true, n8n: true },
  { name: "500+ Integrations", flowforge: true, zapier: true, make: true, n8n: true },
  { name: "Free Tier", flowforge: true, zapier: "partial", make: "partial", n8n: true },
  { name: "Enterprise Ready", flowforge: true, zapier: true, make: true, n8n: true },
  { name: "Community Driven", flowforge: true, zapier: false, make: false, n8n: true },
];

const getStatusIcon = (status: boolean | string) => {
  if (status === true) {
    return <Check className="w-5 h-5 text-success" />;
  }
  if (status === false) {
    return <X className="w-5 h-5 text-destructive" />;
  }
  return <Minus className="w-5 h-5 text-warning" />;
};

export function ComparisonSection() {
  return (
    <section id="compare" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-electric uppercase tracking-wider">
            Compare
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Why Choose{" "}
            <span className="gradient-text">Shadow Flow</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how we stack up against the competition. Spoiler: we bring the best of all worlds together.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                  Feature
                </th>
                {competitors.map((comp) => (
                  <th
                    key={comp.name}
                    className={`py-4 px-4 font-semibold text-center ${
                      comp.highlight
                        ? "bg-gradient-to-b from-electric/20 to-transparent rounded-t-xl"
                        : ""
                    }`}
                  >
                    <span className={comp.highlight ? "gradient-text" : ""}>
                      {comp.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <motion.tr
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-border"
                >
                  <td className="py-4 px-4 font-medium">{feature.name}</td>
                  <td
                    className={`py-4 px-4 text-center bg-electric/5`}
                  >
                    <span className="flex justify-center">
                      {getStatusIcon(feature.flowforge)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="flex justify-center">
                      {getStatusIcon(feature.zapier)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="flex justify-center">
                      {getStatusIcon(feature.make)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="flex justify-center">
                      {getStatusIcon(feature.n8n)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            <span>Full Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-warning" />
            <span>Partial Support</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-destructive" />
            <span>Not Supported</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
