import { FastifyReply, FastifyRequest } from "fastify";
import { EventsService } from "../services/eventsService.js";

export class EventsController {
  constructor(private eventsService: EventsService) {}

  getEvents = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const events = await this.eventsService.getActiveEvents();
    reply.code(200).send(events);
  };

  getEventById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { id } = request.params;
    const event = await this.eventsService.getEventById(id);

    if (!event) {
      reply.code(404).send({
        error: "Not Found",
        message: `Event with id '${id}' not found`,
      });
      return;
    }

    reply.code(200).send(event);
  };
}

