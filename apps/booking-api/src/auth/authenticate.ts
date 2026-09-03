import { FastifyReply, FastifyRequest } from "fastify";
import { verifySupabaseToken } from "./jwtVerifier.js";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    reply.code(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Missing Authorization header",
    });
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    reply.code(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Malformed Authorization header. Expected format: 'Bearer <token>'",
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    reply.code(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Missing Bearer token",
    });
    return;
  }

  try {
    const user = await verifySupabaseToken(token);
    request.user = user;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Invalid or expired token";
    request.log.warn({ err }, "Authentication failed");
    reply.code(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: errorMessage,
    });
  }
};

