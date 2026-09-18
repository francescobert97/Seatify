import { Event } from "../types/event.js";
import { EventRepository } from "../repositories/eventRepository.js";

export class EventsService {
  constructor(private eventRepository: EventRepository) {}

  async getActiveEvents(referenceDate: Date = new Date()): Promise<Event[]> {
    const allEvents = await this.eventRepository.findAll();
    return allEvents.filter((event) => this.isEventActive(event, referenceDate));
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  isEventActive(event: Event, referenceDate: Date = new Date()): boolean {
    const eventDate = new Date(event.date);
    if (isNaN(eventDate.getTime())) {
      // If date string cannot be parsed, keep active by default
      return true;
    }
    return eventDate.getTime() >= referenceDate.getTime();
  }
}
