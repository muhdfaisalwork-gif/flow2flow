// ============================================================================
// Flow2Flow — Zero-Cost SaaS Subscription, Quota & Merchant-of-Record Engine
// Supports Lemon Squeezy & Polar.sh ($0/mo Merchant of Record) + License Keys
// ============================================================================

export type PlanTier = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  badge?: string;
  highlighted?: boolean;
  limits: {
    maxWorkflows: number | 'unlimited';
    maxMonthlyRuns: number;
    maxAiGenerationsPerDay: number | 'unlimited';
    fullTemplateCatalog: boolean;
    n8nExportEnabled: boolean;
    selfHealingEnabled: boolean;
    teamSharingEnabled: boolean;
  };
  features: string[];
  n8nCloudEquivalentPrice: number;
}

export const SAAS_PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Starter Free',
    tagline: 'For makers testing workflows & importing n8n graphs at $0 cost',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    limits: {
      maxWorkflows: 5,
      maxMonthlyRuns: 500,
      maxAiGenerationsPerDay: 25,
      fullTemplateCatalog: true,
      n8nExportEnabled: true,
      selfHealingEnabled: true,
      teamSharingEnabled: false,
    },
    features: [
      'Up to 5 active workflows',
      '500 sandboxed executions / month',
      'Universal n8n JSON Importer & Auto-Layout',
      'Zero-Cost Heuristic AI Copilot + BYOK API Keys',
      'Access to 128+ Enterprise Templates',
      'Community Discord & GitHub support',
    ],
    n8nCloudEquivalentPrice: 24,
  },
  pro: {
    id: 'pro',
    name: 'Flow2Flow Pro',
    tagline: 'For creators, startups & power automators scaling production flows',
    monthlyPrice: 19,
    annualMonthlyPrice: 15,
    badge: 'MOST POPULAR',
    highlighted: true,
    limits: {
      maxWorkflows: 'unlimited',
      maxMonthlyRuns: 25000,
      maxAiGenerationsPerDay: 'unlimited',
      fullTemplateCatalog: true,
      n8nExportEnabled: true,
      selfHealingEnabled: true,
      teamSharingEnabled: true,
    },
    features: [
      'Unlimited active workflows',
      '25,000 executions / month',
      'Unlimited Prompt-to-Flow AI & 1-Click Self-Healing',
      'Full Bidirectional n8n Import & Native Export',
      'LangChain Multi-Agent & RAG Sub-Node Wiring',
      'Public workflow sharing links & embeds',
      'Priority email & chat support',
    ],
    n8nCloudEquivalentPrice: 60,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Team & Agency',
    tagline: 'For agencies & enterprises delivering client automations at scale',
    monthlyPrice: 49,
    annualMonthlyPrice: 39,
    badge: 'BEST VALUE',
    limits: {
      maxWorkflows: 'unlimited',
      maxMonthlyRuns: 250000,
      maxAiGenerationsPerDay: 'unlimited',
      fullTemplateCatalog: true,
      n8nExportEnabled: true,
      selfHealingEnabled: true,
      teamSharingEnabled: true,
    },
    features: [
      'Unlimited workflows & client workspaces',
      '250,000 executions / month',
      'Everything in Pro + Team Collaboration',
      'Encrypted Team Credential Vault & RBAC',
      'Custom Webhook domains & white-label embeds',
      'Dedicated SLA & onboarding engineer',
    ],
    n8nCloudEquivalentPrice: 150,
  },
};

export interface UserSubscriptionState {
  tier: PlanTier;
  interval: BillingInterval;
  status: 'active' | 'trialing' | 'canceled';
  provider: 'lemonsqueezy' | 'polar' | 'license_key' | 'free';
  licenseKey?: string;
  activatedAt: string;
  renewsAt?: string;
}

const STORAGE_KEY = 'flow2flow_saas_subscription';

export function getStoredSubscription(): UserSubscriptionState {
  if (typeof window === 'undefined') {
    return {
      tier: 'free',
      interval: 'monthly',
      status: 'active',
      provider: 'free',
      activatedAt: new Date().toISOString(),
    };
  }

  try {
    // Check URL query parameters for post-checkout callback (?checkout=success&plan=pro)
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    const checkoutPlan = params.get('plan') as PlanTier | null;
    if (checkoutStatus === 'success' && checkoutPlan && SAAS_PLANS[checkoutPlan]) {
      const upgraded: UserSubscriptionState = {
        tier: checkoutPlan,
        interval: (params.get('interval') as BillingInterval) || 'monthly',
        status: 'active',
        provider: (params.get('provider') as 'lemonsqueezy' | 'polar') || 'lemonsqueezy',
        activatedAt: new Date().toISOString(),
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
      return upgraded;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserSubscriptionState;
      if (parsed && SAAS_PLANS[parsed.tier]) {
        return parsed;
      }
    }
  } catch {
    // Fallback to free tier
  }

  return {
    tier: 'free',
    interval: 'monthly',
    status: 'active',
    provider: 'free',
    activatedAt: new Date().toISOString(),
  };
}

export function saveSubscription(sub: UserSubscriptionState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
    window.dispatchEvent(new CustomEvent('flow2flow-subscription-updated', { detail: sub }));
  }
}

/**
 * Validates and activates a Lemon Squeezy, Polar.sh, or Flow2Flow license key
 * Format examples:
 * - F2F-PRO-XXXX-XXXX -> activates Pro
 * - F2F-ENT-XXXX-XXXX or F2F-TEAM-XXXX-XXXX -> activates Enterprise
 * - Standard UUID license keys from Lemon Squeezy / Polar.sh (36 chars)
 */
export function activateLicenseKey(rawKey: string): {
  valid: boolean;
  subscription?: UserSubscriptionState;
  message: string;
} {
  const key = rawKey.trim().toUpperCase();
  if (!key || key.length < 10) {
    return {
      valid: false,
      message: 'Please enter a valid Lemon Squeezy, Polar.sh, or Flow2Flow license key.',
    };
  }

  let tier: PlanTier = 'pro';
  if (key.startsWith('F2F-ENT') || key.startsWith('F2F-TEAM') || key.includes('-ENT-')) {
    tier = 'enterprise';
  } else if (key.startsWith('F2F-PRO') || /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/i.test(key)) {
    tier = 'pro';
  } else {
    return {
      valid: false,
      message:
        'Unrecognized license format. Use a Lemon Squeezy / Polar UUID key or F2F-PRO-XXXX-XXXX / F2F-TEAM-XXXX-XXXX.',
    };
  }

  const subscription: UserSubscriptionState = {
    tier,
    interval: 'monthly',
    status: 'active',
    provider: 'license_key',
    licenseKey: key,
    activatedAt: new Date().toISOString(),
    renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveSubscription(subscription);
  return {
    valid: true,
    subscription,
    message: `Successfully activated ${SAAS_PLANS[tier].name}!`,
  };
}

/**
 * Resolves the hosted checkout URL for Lemon Squeezy or Polar.sh.
 * Costs $0/month — Merchant of Record only takes ~5% when you get paid.
 */
export function getCheckoutUrl(
  tier: PlanTier,
  interval: BillingInterval,
  userEmail?: string
): { url: string | null; isConfigured: boolean; providerName: string } {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

  const lemonProMonthly = env.VITE_LEMONSQUEEZY_PRO_MONTHLY_URL || env.VITE_LEMONSQUEEZY_PRO_URL;
  const lemonProAnnual = env.VITE_LEMONSQUEEZY_PRO_ANNUAL_URL || lemonProMonthly;
  const lemonEntMonthly = env.VITE_LEMONSQUEEZY_ENTERPRISE_MONTHLY_URL || env.VITE_LEMONSQUEEZY_ENTERPRISE_URL;
  const lemonEntAnnual = env.VITE_LEMONSQUEEZY_ENTERPRISE_ANNUAL_URL || lemonEntMonthly;

  const polarPro = env.VITE_POLAR_PRO_URL;
  const polarEnt = env.VITE_POLAR_ENTERPRISE_URL;

  let baseUrl: string | undefined;
  let providerName = 'Lemon Squeezy';

  if (tier === 'pro') {
    baseUrl = interval === 'annual' ? lemonProAnnual : lemonProMonthly;
    if (!baseUrl && polarPro) {
      baseUrl = polarPro;
      providerName = 'Polar.sh';
    }
  } else if (tier === 'enterprise') {
    baseUrl = interval === 'annual' ? lemonEntAnnual : lemonEntMonthly;
    if (!baseUrl && polarEnt) {
      baseUrl = polarEnt;
      providerName = 'Polar.sh';
    }
  }

  if (!baseUrl) {
    return { url: null, isConfigured: false, providerName };
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  const emailParam = userEmail ? `checkout[email]=${encodeURIComponent(userEmail)}` : '';
  return {
    url: emailParam ? `${baseUrl}${separator}${emailParam}` : baseUrl,
    isConfigured: true,
    providerName,
  };
}
