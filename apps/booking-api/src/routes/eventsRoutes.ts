import { FastifyInstance } from "fastify";
import { EventsController } from "../controllers/eventsController.js";
import { EventsService } from "../services/eventsService.js";
import { MockEventRepository } from "../repositories/mockEventRepository.js";

export interface EventsRouteOptions {
  eventsController?: EventsController;
}

export async function eventsRoutes(
  app: FastifyInstance,
  options: EventsRouteOptions = {}
): Promise<void> {
  const controller =
    options.eventsController ??
    new EventsController(new EventsService(new MockEventRepository()));

  // Public event endpoints - no authentication middleware
  app.get("/events", controller.getEvents);
  app.get<{ Params: { id: string } }>("/events/:id", controller.getEventById);
}

