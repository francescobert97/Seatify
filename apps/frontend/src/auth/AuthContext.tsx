import React, { createContext, useEffect, useState, useMemo, ReactNode } from "react";
import { User, Session, AuthError, Provider } from "@supabase/supabase-js";
import { supabase, getAccessToken } from "./supabase";
import { AuthContextType, SignUpMetadata } from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session restoration
    const initializeAuth = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[Auth] Error fetching initial session:", error.message);
        }
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (err) {
        console.error("[Auth] Unexpected error during session initialization:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    // 2. Subscribe to Supabase auth events (login, logout, token refresh, multi-tab sync)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("An unexpected error occurred during sign in") };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ): Promise<{ error: AuthError | Error | null; user: User | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: metadata,
        },
      });
      return { error, user: data.user };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error("An unexpected error occurred during sign up"),
        user: null,
      };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("An unexpected error occurred during sign out") };
    }
  };

  const signInWithOAuth = async (
    provider: Provider
  ): Promise<{ error: AuthError | Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("An unexpected error occurred during OAuth sign in") };
    }
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user && !!session,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      getAccessToken,
    }),
    [user, session, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

