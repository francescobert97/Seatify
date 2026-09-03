import { User, Session, AuthError, Provider } from "@supabase/supabase-js";

export type { User, Session, AuthError };

export interface SignUpMetadata {
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ) => Promise<{ error: AuthError | Error | null; user: User | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: AuthError | Error | null }>;
  getAccessToken: () => Promise<string | null>;
}

