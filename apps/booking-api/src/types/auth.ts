export interface AuthenticatedUser {
  id: string; // The canonical Supabase sub claim
  email?: string;
  role?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

declare module "fastify" {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}

