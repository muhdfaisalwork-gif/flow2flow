import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TFASettings } from "./TFASettings";

// Mock the useTFA hook
const mockUseTFA = {
  settings: null as Record<string, unknown> | null,
  isLoading: false,
  initializeTFA: vi.fn(),
  updateSettings: vi.fn(),
  enableTFA: vi.fn(),
  disableTFA: vi.fn(),
  generateBackupCodes: vi.fn(),
  refetch: vi.fn(),
};

vi.mock("@/hooks/useTFA", () => ({
  useTFA: () => mockUseTFA,
}));

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("TFASettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTFA.settings = null;
    mockUseTFA.isLoading = false;
  });

  it("renders the TFA settings card", () => {
    renderWithProviders(<TFASettings />);
    expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
    expect(screen.getByText(/Add an extra layer of security/)).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    mockUseTFA.isLoading = true;
    renderWithProviders(<TFASettings />);
    expect(screen.getByText("Loading security settings...")).toBeInTheDocument();
  });

  it("shows authentication methods when not loading", () => {
    mockUseTFA.isLoading = false;
    renderWithProviders(<TFASettings />);
    expect(screen.getByText("Authenticator App")).toBeInTheDocument();
    expect(screen.getByText("Email Verification")).toBeInTheDocument();
    expect(screen.getByText("SMS Verification")).toBeInTheDocument();
  });

  it("shows enabled status when TFA is enabled", () => {
    mockUseTFA.settings = {
      id: "test-id",
      user_id: "test-user",
      enabled: true,
      preferred_method: "totp",
      totp_verified: true,
      email_verified: false,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      totp_secret: null,
      phone_number: null,
      backup_codes: null,
    };
    renderWithProviders(<TFASettings />);
    expect(screen.getByText("2FA is enabled")).toBeInTheDocument();
  });

  it("shows backup codes section when TFA is enabled", () => {
    mockUseTFA.settings = {
      id: "test-id",
      user_id: "test-user",
      enabled: true,
      preferred_method: "totp",
      totp_verified: true,
      email_verified: false,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      totp_secret: null,
      phone_number: null,
      backup_codes: ["CODE1", "CODE2"],
    };
    renderWithProviders(<TFASettings />);
    expect(screen.getByText("Backup Codes")).toBeInTheDocument();
    expect(screen.getByText("2 codes remaining")).toBeInTheDocument();
  });

  it("shows setup button for unconfigured methods", () => {
    mockUseTFA.settings = null;
    renderWithProviders(<TFASettings />);
    const setupButtons = screen.getAllByRole("button", { name: "Set up" });
    expect(setupButtons.length).toBeGreaterThan(0);
  });
});
