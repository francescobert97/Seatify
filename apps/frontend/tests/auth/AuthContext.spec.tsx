import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { createElement as h } from "react";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, AuthContext } from "../../src/auth/AuthContext";
import { useAuth } from "../../src/auth/useAuth";
import { supabase } from "../../src/auth/supabase";
import { User, Session } from "@supabase/supabase-js";

describe("AuthProvider & useAuth", () => {
  const mockUser: User = {
    id: "test-user-id",
    app_metadata: {},
    user_metadata: { firstName: "Jane", lastName: "Doe" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: "jane@example.com",
  };

  const mockSession: Session = {
    access_token: "mock-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: 1800000000,
    refresh_token: "mock-refresh",
    user: mockUser,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const ConsumerComponent = () => {
    const auth = useAuth();
    return h(
      "div",
      null,
      h("span", { "data-testid": "loading" }, auth.isLoading ? "loading" : "idle"),
      h("span", { "data-testid": "auth-status" }, auth.isAuthenticated ? "authenticated" : "anonymous"),
      h("span", { "data-testid": "user-email" }, auth.user?.email || "none"),
      h("button", { "data-testid": "btn-signin", onClick: () => auth.signIn("test@example.com", "pass123") }, "Sign In"),
      h("button", { "data-testid": "btn-signup", onClick: () => auth.signUp("new@example.com", "pass123", { firstName: "New" }) }, "Sign Up"),
      h("button", { "data-testid": "btn-signout", onClick: () => auth.signOut() }, "Sign Out"),
      h("button", { "data-testid": "btn-oauth", onClick: () => auth.signInWithOAuth("google") }, "OAuth")
    );
  };

  it("should throw error when useAuth is used outside an AuthProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(h(ConsumerComponent))).toThrow(
      "useAuth must be used within an <AuthProvider>"
    );
    consoleError.mockRestore();
  });

  it("should restore session on mount and subscribe to onAuthStateChange", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    const unsubscribeMock = vi.fn();
    vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
      data: {
        subscription: {
          id: "sub-1",
          callback: vi.fn(),
          unsubscribe: unsubscribeMock,
        },
      },
    });

    render(h(AuthProvider, null, h(ConsumerComponent)));

    // Initially might be loading or restored
    expect(await screen.findByTestId("loading")).toHaveTextContent("idle");
    expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("user-email")).toHaveTextContent("jane@example.com");
  });

  it("should handle getSession error gracefully and remain anonymous", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: null },
      error: { message: "Session expired", name: "AuthError", status: 400 },
    });

    vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
      data: {
        subscription: {
          id: "sub-2",
          callback: vi.fn(),
          unsubscribe: vi.fn(),
        },
      },
    });

    render(h(AuthProvider, null, h(ConsumerComponent)));

    expect(await screen.findByTestId("loading")).toHaveTextContent("idle");
    expect(screen.getByTestId("auth-status")).toHaveTextContent("anonymous");
  });

  it("should execute signIn and return result", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
      data: { subscription: { id: "1", callback: vi.fn(), unsubscribe: vi.fn() } },
    });

    const signInSpy = vi.spyOn(supabase.auth, "signInWithPassword").mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    render(h(AuthProvider, null, h(ConsumerComponent)));
    await screen.findByTestId("loading");

    const btn = screen.getByTestId("btn-signin");
    await act(async () => {
      btn.click();
    });

    expect(signInSpy).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "pass123",
    });
  });

  it("should execute signUp with metadata", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
      data: { subscription: { id: "1", callback: vi.fn(), unsubscribe: vi.fn() } },
    });

    const signUpSpy = vi.spyOn(supabase.auth, "signUp").mockResolvedValueOnce({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    render(h(AuthProvider, null, h(ConsumerComponent)));
    await screen.findByTestId("loading");

    const btn = screen.getByTestId("btn-signup");
    await act(async () => {
      btn.click();
    });

    expect(signUpSpy).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "pass123",
      options: {
        data: { firstName: "New" },
      },
    });
  });

  it("should execute signOut", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });
    vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
      data: { subscription: { id: "1", callback: vi.fn(), unsubscribe: vi.fn() } },
    });

    const signOutSpy = vi.spyOn(supabase.auth, "signOut").mockResolvedValueOnce({
      error: null,
    });

    render(h(AuthProvider, null, h(ConsumerComponent)));
    await screen.findByTestId("loading");

    const btn = screen.getByTestId("btn-signout");
    await act(async () => {
      btn.click();
    });

    expect(signOutSpy).toHaveBeenCalled();
  });

  it("should execute signInWithOAuth", async () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
      data: { subscription: { id: "1", callback: vi.fn(), unsubscribe: vi.fn() } },
    });

    const oauthSpy = vi.spyOn(supabase.auth, "signInWithOAuth").mockResolvedValueOnce({
      data: { provider: "google", url: "https://auth.google.com" },
      error: null,
    });

    render(h(AuthProvider, null, h(ConsumerComponent)));
    await screen.findByTestId("loading");

    const btn = screen.getByTestId("btn-oauth");
    await act(async () => {
      btn.click();
    });

    expect(oauthSpy).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  });

  it("should unsubscribe on unmount", () => {
    vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const unsubscribeMock = vi.fn();
    vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
      data: {
        subscription: {
          id: "sub-unmount",
          callback: vi.fn(),
          unsubscribe: unsubscribeMock,
        },
      },
    });

    const { unmount } = render(h(AuthProvider, null, h("div", null, "Hello")));
    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
