import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HealthCheck } from "../../src/components/HealthCheck";
import { HomePage } from "../../src/pages/Home/HomePage";
import { App } from "../../src/App";
import { httpClient } from "../../src/services/httpClient";
import { HttpError } from "../../src/types/http";
import { AuthContext } from "../../src/auth/AuthContext";
import { AuthContextType } from "../../src/types/auth";
import { supabase } from "../../src/auth/supabase";
import { MOCK_EVENTS } from "../../src/data/mockEvents";

describe("HealthCheck, HomePage & App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  describe("HealthCheck", () => {
    it("should display loading state initially and then success response", async () => {
      vi.spyOn(httpClient, "request").mockResolvedValueOnce({
        status: "ok",
        message: "Booking API Active",
      });

      render(<HealthCheck />);

      expect(screen.getByText(/Verifica connessione in corso.../i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Booking API Active/i)).toBeInTheDocument();
      });
    });

    it("should display error message on fetch failure", async () => {
      vi.spyOn(httpClient, "request").mockRejectedValueOnce(
        new HttpError({ message: "Network connection lost", isNetworkError: true })
      );

      render(<HealthCheck />);

      await waitFor(() => {
        expect(screen.getByText(/Network connection lost/i)).toBeInTheDocument();
      });
    });
  });

  describe("HomePage", () => {
    it("should fetch events and filter when typing in search query or selecting categories", async () => {
      vi.spyOn(httpClient, "request").mockResolvedValue(MOCK_EVENTS);

      render(
        <AuthContext.Provider value={createMockAuthContext()}>
          <HomePage />
        </AuthContext.Provider>
      );

      // Wait for events to load from API
      expect(await screen.findByText(/Taylor Swift/i)).toBeInTheDocument();
      expect(screen.getByText(/UEFA Champions League/i)).toBeInTheDocument();

      // Search input
      const searchInput = screen.getByPlaceholderText(/Search events, artists, venues.../i);
      fireEvent.change(searchInput, { target: { value: "Taylor" } });
      fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));

      // Only Taylor events should remain
      expect(screen.getByText(/Taylor Swift/i)).toBeInTheDocument();
      expect(screen.queryByText(/UEFA Champions League/i)).not.toBeInTheDocument();

      // Clear search
      fireEvent.change(searchInput, { target: { value: "" } });
      fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));

      // Click category in category section
      const sportsCard = screen.getAllByText("Sports")[0];
      fireEvent.click(sportsCard);

      expect(screen.getByText(/UEFA Champions League/i)).toBeInTheDocument();

      // Click event card
      const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
      const eventCard = screen.getByText(/UEFA Champions League/i);
      fireEvent.click(eventCard);
      expect(consoleLog).toHaveBeenCalledWith("Selected event:", "evt-2", "UEFA Champions League Final");
      consoleLog.mockRestore();

      // Click View all
      const viewAllBtn = screen.getByRole("button", { name: /View all/i });
      fireEvent.click(viewAllBtn);
    });
  });

  describe("App Component", () => {
    it("should render App without throwing errors", () => {
      vi.spyOn(supabase.auth, "getSession").mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });
      vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValueOnce({
        data: { subscription: { id: "1", callback: vi.fn(), unsubscribe: vi.fn() } },
      });

      render(<App />);
      expect(screen.getAllByText(/Seatify/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
