import Fastify from "fastify";
import cors from "@fastify/cors";
import { HealthResponse } from "./types/health.js";
import { authenticate } from "./auth/authenticate.js";
import "./types/auth.js"; // Import Fastify request augmentation

const server = Fastify({
  logger: true,
});

const start = async (): Promise<void> => {
  try {
    await server.register(cors, {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    });

    // Public health check route
    server.get<{ Reply: HealthResponse }>(
      "/api/health",
      async (_request, _reply): Promise<HealthResponse> => {
        return {
          status: "ok",
          message: "Booking API (Fastify) Attiva",
        };
      }
    );

    // Protected Route: GET /api/me - Returns the authenticated Supabase user profile
    server.get(
      "/api/me",
      {
        preHandler: authenticate,
      },
      async (request, _reply) => {
        return {
          user: request.user,
        };
      }
    );

    // Protected Route: POST /api/bookings - Demonstrates accessing request.user.id securely
    server.post<{
      Body: { eventId: string; tickets: number };
    }>(
      "/api/bookings",
      {
        preHandler: authenticate,
      },
      async (request, reply) => {
        const { eventId, tickets } = request.body || {};

        if (!eventId || !tickets) {
          reply.code(400).send({
            error: "Bad Request",
            message: "eventId and tickets are required fields",
          });
          return;
        }

        // Canonical user ID is strictly derived from verified JWT (request.user.id)
        const booking = {
          id: `bkg-${Date.now()}`,
          userId: request.user.id,
          eventId,
          tickets,
          createdAt: new Date().toISOString(),
          status: "confirmed",
        };

        reply.code(201).send({
          message: "Booking created successfully",
          booking,
        });
      }
    );

    const port = Number(process.env.PORT) || 8080;
    const host = process.env.HOST || "0.0.0.0";
    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

await start();
