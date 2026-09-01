import Fastify from "fastify";
import cors from "@fastify/cors";
import { HealthResponse } from "./types/health.js";

const server = Fastify({
  logger: true,
});

const start = async (): Promise<void> => {
  try {
    await server.register(cors, {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    });

    server.get<{ Reply: HealthResponse }>(
      "/api/health",
      async (_request, _reply): Promise<HealthResponse> => {
        return {
          status: "ok",
          message: "Booking API (Fastify) Attiva",
        };
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
