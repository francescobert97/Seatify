import { describe, it, expect } from "vitest";
import { MockEventRepository } from "../../src/repositories/mockEventRepository.js";
import { Event } from "../../src/types/event.js";

describe("MockEventRepository", () => {
  const sampleEvents: Event[] = [
    {
      id: "test-1",
      title: "Test Event 1",
      category: "concerts",
      date: "2026-09-12T19:30:00",
      venue: "Wembley",
      city: "London",
      imageUrl: "https://example.com/img1.jpg",
      priceStartingFrom: 50,
    },
    {
      id: "test-2",
      title: "Test Event 2",
      category: "sports",
      date: "2026-10-04T21:00:00",
      venue: "Allianz",
      city: "Munich",
      imageUrl: "https://example.com/img2.jpg",
      priceStartingFrom: 100,
    },
  ];

  it("should return all initial mock events when no custom events are passed", async () => {
    const repo = new MockEventRepository();
    const events = await repo.findAll();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].id).toBe("evt-1");
  });

  it("should return custom events when provided to constructor", async () => {
    const repo = new MockEventRepository(sampleEvents);
    const events = await repo.findAll();
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe("test-1");
    expect(events[1].id).toBe("test-2");
  });

  it("should find an event by id", async () => {
    const repo = new MockEventRepository(sampleEvents);
    const event = await repo.findById("test-2");
    expect(event).not.toBeNull();
    expect(event?.title).toBe("Test Event 2");
  });

  it("should return null if event is not found by id", async () => {
    const repo = new MockEventRepository(sampleEvents);
    const event = await repo.findById("non-existent-id");
    expect(event).toBeNull();
  });
});
