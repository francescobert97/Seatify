import { describe, it, expect } from "vitest";
import { supabaseDb } from "../../src/lib/supabaseDb.js";

describe("Supabase DB client (supabaseDb.ts)", () => {
  it("should export a configured SupabaseClient instance", () => {
    expect(supabaseDb).toBeDefined();
    expect(typeof supabaseDb.from).toBe("function");
    expect(typeof supabaseDb.auth).toBe("object");
  });

  it("should have auth persistence disabled for Node server environment", () => {
    // In Node runtime, autoRefreshToken and persistSession must be disabled
    // @ts-ignore
    const authConfig = supabaseDb.auth?.persistSession;
    expect(authConfig).toBeFalsy();
  });
});

