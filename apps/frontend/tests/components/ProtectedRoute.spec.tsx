import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProtectedRoute } from "../../src/components/auth/ProtectedRoute";
import { AuthContext } from "../../src/auth/AuthContext";
import { AuthContextType } from "../../src/types/auth";

describe("ProtectedRoute Component", () => {
  const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
    getAccessToken: vi.fn(),
    ...overrides,
  });

  it("should show loading spinner when auth is loading", () => {
    render(
      <AuthContext.Provider value={createMockAuthContext({ isLoading: true })}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Restoring authentication session...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should show fallback card and Sign In button when unauthenticated", () => {
    render(
      <AuthContext.Provider value={createMockAuthContext({ isAuthenticated: false, isLoading: false })}>
        <ProtectedRoute fallbackMessage="Custom access denied message">
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText("Sign In Required")).toBeInTheDocument();
    expect(screen.getByText("Custom access denied message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should open AuthModal when Sign In button is clicked in fallback card", () => {
    render(
      <AuthContext.Provider value={createMockAuthContext({ isAuthenticated: false, isLoading: false })}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    const signInBtn = screen.getByRole("button", { name: /^Sign In$/i });
    fireEvent.click(signInBtn);

    expect(screen.getByText("Welcome to Seatify")).toBeInTheDocument();
  });

  it("should render children when user is authenticated", () => {
    render(
      <AuthContext.Provider
        value={createMockAuthContext({
          isAuthenticated: true,
          isLoading: false,
          user: { id: "123", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "" },
        })}
      >
        <ProtectedRoute>
          <div data-testid="private-content">Secret VIP Lounge</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId("private-content")).toHaveTextContent("Secret VIP Lounge");
    expect(screen.queryByText("Sign In Required")).not.toBeInTheDocument();
  });
});
