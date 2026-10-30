import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveWorkflowStudio } from "@/components/landing/InteractiveWorkflowStudio";
import { ProductInterfaceShowcase } from "@/components/landing/ProductInterfaceShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="relative">
        {/* 1. Hero Section with Interactive Living 2.5D Workflow Canvas */}
        <HeroSection />

        {/* 2. Signature Interactive Workflow Studio (Play/Step Simulation & Node Payloads) */}
        <InteractiveWorkflowStudio />

        {/* 3. Product Interface Showcase (Layered IDE & Execution Waterfall Trace) */}
        <ProductInterfaceShowcase />

        {/* 4. Interactive 3D Spotlight Feature Matrix with Expandable Specs */}
        <FeaturesSection />

        {/* 5. Ecosystem & Universal n8n Importer Hub */}
        <IntegrationsSection />

        {/* 6. Benchmark & Capability Comparison Matrix */}
        <ComparisonSection />

        {/* 7. Transparent Pricing & Self-Host Tier */}
        <PricingSection />

        {/* 8. Converging Workflow Circuit Final CTA */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
