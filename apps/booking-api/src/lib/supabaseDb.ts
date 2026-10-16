import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Ensure WebSocket is defined in Node.js < 22 runtimes for Supabase client initialization
if (typeof globalThis.WebSocket === "undefined") {
  // @ts-ignore
  globalThis.WebSocket = class MockWebSocket {
    static readonly CLOSED = 3;
    static readonly CLOSING = 2;
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    readonly readyState = 3;
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}

// Attempt to load .env in Node runtime if environment variables are not set yet
if (!process.env.SUPABASE_URL && typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
    // Ignore error if .env file is not present or already loaded
  }
}

const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

/**
 * Singleton Supabase client initialized with the Service Role key
 * for server-side database operations in the Fastify backend.
 * Session persistence and auto-refresh are disabled for Node server environment.
 * Service role credentials are kept exclusively on the server.
 */
export const supabaseDb: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
