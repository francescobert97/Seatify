import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { httpClient } from "../services/httpClient";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Please check your .env file."
  );
}

// Fallback placeholder URL for graceful initialization when env vars are pending
const validUrl =
  supabaseUrl && supabaseUrl.startsWith("http")
    ? supabaseUrl
    : "https://placeholder-project.supabase.co";
const validKey = supabaseAnonKey || "placeholder-anon-key";

export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper function to retrieve the active Supabase JWT access token.
 * Used by HttpClient to transparently attach Authorization: Bearer <token>.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }
    return data.session.access_token;
  } catch {
    return null;
  }
}

// Wire the token provider to the application's HTTP client singleton
httpClient.setAuthTokenProvider(getAccessToken);

