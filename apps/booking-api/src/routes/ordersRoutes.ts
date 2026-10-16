import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { SupabaseClient } from "@supabase/supabase-js";
import { authenticate } from "../auth/authenticate.js";
import { supabaseDb } from "../lib/supabaseDb.js";
import { EventsService } from "../services/eventsService.js";
import { MockEventRepository } from "../repositories/mockEventRepository.js";
import {
  CreateOrderBody,
  mapOrderDbToOrder,
  Order,
  OrderDbRow,
  OrderTicketItem,
} from "../types/order.js";
import "../types/auth.js";

export interface OrdersRouteOptions {
  db?: SupabaseClient;
  eventsService?: EventsService;
}

export async function ordersRoutes(
  app: FastifyInstance,
  options: OrdersRouteOptions = {}
): Promise<void> {
  const db = options.db ?? supabaseDb;
  const eventsService =
    options.eventsService ?? new EventsService(new MockEventRepository());

  const getOrdersHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id;
    if (!userId) {
      reply.code(401).send({
        error: "Unauthorized",
        message: "User ID not found in authenticated request",
      });
      return;
    }

    const { data, error } = await db
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: true });

    if (error) {
      request.log.error({ error }, "Error fetching orders from Supabase");
      reply.code(500).send({
        error: "Internal Server Error",
        message: error.message,
      });
      return;
    }

    const orders: Order[] = (data || []).map((row: any) =>
      mapOrderDbToOrder(row as OrderDbRow)
    );
    reply.code(200).send(orders);
  };

  const getOrderByReferenceHandler = async (
    request: FastifyRequest<{ Params: { orderReference: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { orderReference } = request.params;
    const userId = request.user?.id;

    if (
      !orderReference ||
      typeof orderReference !== "string" ||
      orderReference.trim() === ""
    ) {
      reply.code(400).send({
        error: "Bad Request",
        message: "orderReference parameter is required",
      });
      return;
    }

    const { data, error } = await db
      .from("orders")
      .select("*")
      .eq("order_reference", orderReference)
      .maybeSingle();

    if (error) {
      request.log.error({ error }, "Error fetching order by reference");
      reply.code(500).send({
        error: "Internal Server Error",
        message: error.message,
      });
      return;
    }

    // Return 404 Not Found for both missing and unauthorized orders (isolation against disclosure)
    if (!data || data.user_id !== userId) {
      reply.code(404).send({
        error: "Not Found",
        message: `Order '${orderReference}' not found`,
      });
      return;
    }

    const order: Order = mapOrderDbToOrder(data as OrderDbRow);
    reply.code(200).send(order);
  };

  const createOrderHandler = async (
    request: FastifyRequest<{ Body: CreateOrderBody }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id;
    if (!userId) {
      reply.code(401).send({
        error: "Unauthorized",
        message: "User ID not found in authenticated request",
      });
      return;
    }

    const body = request.body;
    if (!body || typeof body !== "object") {
      reply.code(400).send({
        error: "Bad Request",
        message: "Request body is required",
      });
      return;
    }

    const { eventId, tickets } = body;

    if (!eventId || typeof eventId !== "string" || eventId.trim() === "") {
      reply.code(400).send({
        error: "Bad Request",
        message: "eventId is required and must be a non-empty string",
      });
      return;
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      reply.code(400).send({
        error: "Bad Request",
        message: "tickets must be a non-empty array",
      });
      return;
    }

    // Resolve event details from trusted backend repository
    const event = await eventsService.getEventById(eventId);
    if (!event) {
      reply.code(404).send({
        error: "Not Found",
        message: `Event with id '${eventId}' not found`,
      });
      return;
    }

    // Resolve ticket types, validate quantities, and calculate trusted prices server-side
    const generatedTickets: OrderTicketItem[] = [];

    for (const ticketInput of tickets) {
      if (!ticketInput || typeof ticketInput !== "object") {
        reply.code(400).send({
          error: "Bad Request",
          message: "Each ticket item must be an object",
        });
        return;
      }

      const { ticketTypeId, quantity = 1 } = ticketInput;

      if (
        !ticketTypeId ||
        typeof ticketTypeId !== "string" ||
        ticketTypeId.trim() === ""
      ) {
        reply.code(400).send({
          error: "Bad Request",
          message: "ticketTypeId is required for each ticket entry",
        });
        return;
      }

      if (
        typeof quantity !== "number" ||
        quantity <= 0 ||
        !Number.isInteger(quantity)
      ) {
        reply.code(400).send({
          error: "Bad Request",
          message: "Ticket quantity must be a positive integer",
        });
        return;
      }

      const trustedTicketType = event.ticketTypes.find(
        (tt) => tt.id === ticketTypeId
      );
      if (!trustedTicketType) {
        reply.code(400).send({
          error: "Bad Request",
          message: `Ticket type '${ticketTypeId}' does not exist for event '${event.title}'`,
        });
        return;
      }

      if (
        trustedTicketType.available !== undefined &&
        quantity > trustedTicketType.available
      ) {
        reply.code(400).send({
          error: "Bad Request",
          message: `Requested quantity (${quantity}) exceeds available tickets (${trustedTicketType.available}) for ticket type '${trustedTicketType.name}'`,
        });
        return;
      }

      // Generate individual tickets (representing individual tickets)
      for (let i = 0; i < quantity; i++) {
        const ticketId = `tkt-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;
        generatedTickets.push({
          id: ticketId,
          ticketTypeId: trustedTicketType.id,
          name: trustedTicketType.name,
          price: trustedTicketType.price, // Trusted price from server
        });
      }
    }

    // Calculate total amount on the server (never trusting client input)
    const totalAmount = generatedTickets.reduce(
      (sum, t) => sum + t.price,
      0
    );

    // Generate unique order_reference: ORD-2026-${randomHex} with collision safety
    let orderReference = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      attempts++;
      const randomHex = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      orderReference = `ORD-2026-${randomHex}`;

      const { data: existing } = await db
        .from("orders")
        .select("id")
        .eq("order_reference", orderReference)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to generate a unique order reference",
      });
      return;
    }

    const newOrderRow = {
      user_id: userId,
      order_reference: orderReference,
      status: "pending",
      event_id: event.id,
      event_name: event.title,
      event_date: new Date(event.date).toISOString(),
      venue: event.venue,
      city: event.city,
      image_url: event.imageUrl || null,
      tickets: generatedTickets,
      total_amount: totalAmount,
      currency: event.currency === "€" ? "EUR" : event.currency || "EUR",
    };

    const { data, error } = await db
      .from("orders")
      .insert(newOrderRow)
      .select()
      .single();

    if (error) {
      request.log.error({ error }, "Error inserting order into Supabase");
      reply.code(500).send({
        error: "Internal Server Error",
        message: error.message,
      });
      return;
    }

    const createdOrder = mapOrderDbToOrder(data as OrderDbRow);
    reply.code(201).send(createdOrder);
  };

  // Register routes on both "/orders" and "/api/orders" if prefix is not "/api"
  const paths = app.prefix.endsWith("/api")
    ? ["/orders"]
    : ["/orders", "/api/orders"];

  for (const basePath of paths) {
    app.get(
      basePath,
      {
        preHandler: authenticate,
      },
      getOrdersHandler
    );

    app.get<{ Params: { orderReference: string } }>(
      `${basePath}/:orderReference`,
      {
        preHandler: authenticate,
      },
      getOrderByReferenceHandler
    );

    app.post<{ Body: CreateOrderBody }>(
      basePath,
      {
        preHandler: authenticate,
      },
      createOrderHandler
    );
  }
}
