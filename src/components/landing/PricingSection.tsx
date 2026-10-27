import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  KeyRound,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  Copy,
  CheckCircle2,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SAAS_PLANS,
  type PlanTier,
  type BillingInterval,
  getStoredSubscription,
  activateLicenseKey,
  getCheckoutUrl,
  saveSubscription,
  isDemoBillingEnabled,
} from '@/lib/billing/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval] = useState<BillingInterval>('annual');
  const [currentSub, setCurrentSub] = useState(getStoredSubscription());
  const [checkoutModalTier, setCheckoutModalTier] = useState<PlanTier | null>(null);
  const [licenseInput, setLicenseInput] = useState('');
  const [copiedDemoKey, setCopiedDemoKey] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const demoBilling = isDemoBillingEnabled();

  useEffect(() => {
    const handler = () => setCurrentSub(getStoredSubscription());
    window.addEventListener('flow2flow-subscription-updated', handler);
    return () => window.removeEventListener('flow2flow-subscription-updated', handler);
  }, []);

  const handleSelectPlan = (tier: PlanTier) => {
    if (tier === 'free') {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/signup');
      }
      return;
    }

    const checkout = getCheckoutUrl(tier, interval, user?.email);
    if (checkout.isConfigured && checkout.url) {
      window.open(checkout.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Open the interactive Checkout & License Activation modal
    setCheckoutModalTier(tier);
  };

  const handleActivateLicense = async () => {
    setIsActivating(true);
    const result = await activateLicenseKey(licenseInput);
    setIsActivating(false);
    if (!result.valid) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setCurrentSub(getStoredSubscription());
    setCheckoutModalTier(null);
    setLicenseInput('');
  };

  const handleInstantDemoUpgrade = (tier: PlanTier) => {
    saveSubscription({
      tier,
      interval,
      status: 'active',
      provider: 'lemonsqueezy',
      licenseKey: tier === 'enterprise' ? 'F2F-TEAM-2026-LIVE' : 'F2F-PRO-2026-LIVE',
      activatedAt: new Date().toISOString(),
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setCurrentSub(getStoredSubscription());
    setCheckoutModalTier(null);
    toast.success(`Upgraded to ${SAAS_PLANS[tier].name} (${interval})!`);
  };

  const copyDemoKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedDemoKey(true);
    setTimeout(() => setCopiedDemoKey(false), 2000);
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/40 text-primary">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Fair SaaS Pricing — Up to 65% Less Than n8n Cloud
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Start Free. Scale Without <span className="gradient-text">Server Bills.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Import any n8n workflow, generate AI pipelines, and execute graphs in the cloud.
            Powered by Lemon Squeezy &amp; Polar.sh global checkout.
          </p>

          {/* Billing Interval Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full border border-border bg-card/80 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setInterval('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                interval === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setInterval('annual')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                interval === 'annual'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual Billing
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(Object.values(SAAS_PLANS) as typeof SAAS_PLANS[PlanTier][]).map((plan, idx) => {
            const price = interval === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice;
            const isCurrentPlan = currentSub.tier === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-2xl p-8 flex flex-col justify-between border transition-all ${
                  plan.highlighted
                    ? 'border-primary bg-card/90 shadow-2xl shadow-primary/10 scale-[1.02]'
                    : 'border-border/60 bg-card/50 hover:border-border'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase gradient-primary text-white shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {isCurrentPlan && (
                      <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                        Active Plan
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground min-h-[40px] mb-6">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-border/50">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold">${price}</span>
                      <span className="text-sm text-muted-foreground">/ month</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {price === 0
                          ? 'Free forever — no credit card required'
                          : interval === 'annual'
                          ? `Billed $${price * 12}/year`
                          : 'Billed monthly, cancel anytime'}
                      </span>
                      <span className="line-through text-rose-400/80">
                        n8n Cloud: ${plan.n8nCloudEquivalentPrice}/mo
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  size="lg"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className={`w-full font-semibold ${plan.highlighted ? 'gradient-primary text-white border-0' : ''}`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan
                    ? plan.id === 'free'
                      ? 'Open Dashboard'
                      : 'Manage Active Plan'
                    : plan.id === 'free'
                    ? 'Start Building Free'
                    : `Subscribe to ${plan.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Guarantee & License Activation Bar */}
        <div className="mt-12 max-w-4xl mx-auto rounded-xl border border-border/60 bg-card/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Already purchased a Lemon Squeezy or Polar.sh License Key?</p>
              <p className="text-xs text-muted-foreground">
                Activate your Pro or Team subscription immediately with your license key—no server setup required.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCheckoutModalTier('pro')} className="shrink-0 gap-1.5">
            <KeyRound className="w-4 h-4" />
            Activate License Key
          </Button>
        </div>
      </div>

      {/* Zero-Cost Checkout & License Key Activation Dialog */}
      <Dialog open={checkoutModalTier !== null} onOpenChange={(open) => !open && setCheckoutModalTier(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Upgrade to {checkoutModalTier ? SAAS_PLANS[checkoutModalTier].name : 'Shadow Flow Pro'}
            </DialogTitle>
            <DialogDescription>
              Activate via Lemon Squeezy / Polar.sh license key or test the live subscription checkout flow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Option 1: License Key Activation */}
            <div className="space-y-2 rounded-lg border border-border p-4 bg-muted/20">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                1. Enter Lemon Squeezy / Polar.sh License Key
              </label>
              <div className="flex gap-2">
                <Input
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  placeholder="F2F-PRO-2026-XXXX or UUID key..."
                  className="font-mono text-xs"
                />
                <Button onClick={handleActivateLicense} size="sm" disabled={isActivating}>
                  {isActivating ? 'Checking…' : 'Activate'}
                </Button>
              </div>
              {demoBilling && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Demo Test Key: <code className="text-primary font-mono">F2F-PRO-2026-VIP</code>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLicenseInput('F2F-PRO-2026-VIP');
                    copyDemoKey('F2F-PRO-2026-VIP');
                  }}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  {copiedDemoKey ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedDemoKey ? 'Filled!' : 'Fill Demo Key'}
                </button>
              </div>
              )}
            </div>

            {/* Option 2: Founder setup guide — only shown on dev/demo builds, never to paying customers */}
            {demoBilling && (
            <div className="space-y-2 rounded-lg border border-primary/30 p-4 bg-primary/5">
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" />
                2. Founder Guide: How to Receive Monthly Payments for $0/mo
              </p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>
                  Create a free account on{' '}
                  <a
                    href="https://www.lemonsqueezy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline inline-flex items-center gap-0.5"
                  >
                    Lemon Squeezy <ExternalLink className="w-2.5 h-2.5" />
                  </a>{' '}
                  or{' '}
                  <a
                    href="https://polar.sh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline inline-flex items-center gap-0.5"
                  >
                    Polar.sh <ExternalLink className="w-2.5 h-2.5" />
                  </a>{' '}
                  ($0/month — they only take ~5% when someone pays you).
                </li>
                <li>
                  Create a <strong>$19/mo Pro</strong> product and enable <strong>License Keys</strong> on it — customers
                  paste the emailed key here and it is verified against the Lemon Squeezy License API.
                </li>
                <li>
                  Add <code className="text-[11px] text-foreground">VITE_LEMONSQUEEZY_PRO_URL=https://...</code> in your
                  free Vercel / Cloudflare Pages environment variables.
                </li>
              </ol>
            </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCheckoutModalTier(null)}>
              Close
            </Button>
            {demoBilling && checkoutModalTier && checkoutModalTier !== 'free' && (
              <Button
                size="sm"
                className="gradient-primary text-white border-0"
                onClick={() => handleInstantDemoUpgrade(checkoutModalTier)}
              >
                Simulate Instant {SAAS_PLANS[checkoutModalTier].name} Checkout
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
