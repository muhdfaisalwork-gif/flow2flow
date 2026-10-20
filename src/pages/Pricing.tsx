import { Header } from '@/components/landing/Header';
import { PricingSection } from '@/components/landing/PricingSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { Footer } from '@/components/landing/Footer';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-16">
        <PricingSection />
        <ComparisonSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
