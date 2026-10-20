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
    // Post-checkout URL callback (?checkout=success&plan=pro) is DEV-ONLY.
    // In production anyone could type this URL to unlock a paid plan, so paid
    // tiers must come from a verified license key (see activateLicenseKey).
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    const checkoutPlan = params.get('plan') as PlanTier | null;
    if (isDemoBillingEnabled() && checkoutStatus === 'success' && checkoutPlan && SAAS_PLANS[checkoutPlan]) {
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
 * Demo billing shortcuts (F2F-* test keys, ?checkout=success URL unlock,
 * "Simulate Checkout" button) are only enabled in development/test builds.
 * Set VITE_ENABLE_DEMO_BILLING="true" to force-enable them on a demo deployment.
 */
export function isDemoBillingEnabled(): boolean {
  const env = (import.meta as unknown as { env?: Record<string, string | boolean> }).env || {};
  return env.DEV === true || env.VITE_ENABLE_DEMO_BILLING === 'true';
}

export interface LicenseActivationResult {
  valid: boolean;
  subscription?: UserSubscriptionState;
  message: string;
}

const LEMONSQUEEZY_VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate';

function tierFromVariantName(name: string): PlanTier {
  const n = name.toLowerCase();
  return n.includes('enterprise') || n.includes('team') || n.includes('agency') ? 'enterprise' : 'pro';
}

function buildLicensedSubscription(tier: PlanTier, key: string, expiresAt?: string | null): UserSubscriptionState {
  return {
    tier,
    interval: 'monthly',
    status: 'active',
    provider: 'license_key',
    licenseKey: key,
    activatedAt: new Date().toISOString(),
    renewsAt: expiresAt || undefined,
  };
}

/**
 * Validates and activates a license key.
 * - Production: the key is verified against the Lemon Squeezy License API
 *   (public endpoint, no secret API key required, CORS-enabled). The tier is
 *   derived from the purchased variant/product name ("Team"/"Enterprise" -> enterprise, else pro).
 * - Dev/demo only: F2F-PRO-* / F2F-TEAM-* / F2F-ENT-* test keys activate locally.
 */
export async function activateLicenseKey(rawKey: string): Promise<LicenseActivationResult> {
  const key = rawKey.trim();
  if (!key || key.length < 10) {
    return { valid: false, message: 'Please enter a valid license key.' };
  }

  const upper = key.toUpperCase();
  if (upper.startsWith('F2F-')) {
    if (!isDemoBillingEnabled()) {
      return { valid: false, message: 'Demo license keys are disabled on this deployment.' };
    }
    const tier: PlanTier =
      upper.startsWith('F2F-ENT') || upper.startsWith('F2F-TEAM') ? 'enterprise' : upper.startsWith('F2F-PRO') ? 'pro' : 'free';
    if (tier === 'free') {
      return { valid: false, message: 'Unrecognized demo key. Use F2F-PRO-XXXX or F2F-TEAM-XXXX.' };
    }
    const subscription = buildLicensedSubscription(tier, upper, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    saveSubscription(subscription);
    return { valid: true, subscription, message: `Demo: activated ${SAAS_PLANS[tier].name}.` };
  }

  try {
    const res = await fetch(LEMONSQUEEZY_VALIDATE_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ license_key: key }).toString(),
    });
    const data = (await res.json()) as {
      valid?: boolean;
      error?: string | null;
      license_key?: { status?: string; expires_at?: string | null };
      meta?: { variant_name?: string; product_name?: string };
    };

    if (!data.valid || (data.license_key?.status && !['active', 'inactive'].includes(data.license_key.status))) {
      return { valid: false, message: data.error || 'This license key is invalid, expired, or disabled.' };
    }

    const tier = tierFromVariantName(`${data.meta?.variant_name ?? ''} ${data.meta?.product_name ?? ''}`);
    const subscription = buildLicensedSubscription(tier, key, data.license_key?.expires_at);
    saveSubscription(subscription);
    return { valid: true, subscription, message: `Successfully activated ${SAAS_PLANS[tier].name}!` };
  } catch {
    return { valid: false, message: 'Could not reach the license server. Check your connection and try again.' };
  }
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
