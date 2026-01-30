import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTFA } from "./useTFA";
import React from "react";

// Mock the auth context
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id", email: "test@example.com" },
  }),
}));

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      upsert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { user_id: "test-user-id", enabled: false }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    }),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useTFA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial state with expected functions", async () => {
    const { result } = renderHook(() => useTFA(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings).toBeNull();
    expect(typeof result.current.initializeTFA).toBe("function");
    expect(typeof result.current.updateSettings).toBe("function");
    expect(typeof result.current.enableTFA).toBe("function");
    expect(typeof result.current.disableTFA).toBe("function");
    expect(typeof result.current.generateBackupCodes).toBe("function");
    expect(typeof result.current.refetch).toBe("function");
  });

  it("provides enableTFA function", async () => {
    const { result } = renderHook(() => useTFA(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.enableTFA).toBeDefined();
    });

    expect(typeof result.current.enableTFA).toBe("function");
  });

  it("provides disableTFA function", async () => {
    const { result } = renderHook(() => useTFA(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.disableTFA).toBeDefined();
    });

    expect(typeof result.current.disableTFA).toBe("function");
  });

  it("provides generateBackupCodes function", async () => {
    const { result } = renderHook(() => useTFA(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.generateBackupCodes).toBeDefined();
    });

    expect(typeof result.current.generateBackupCodes).toBe("function");
  });
});
