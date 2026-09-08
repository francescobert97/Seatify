import { describe, it, expect, vi } from "vitest";
import React, { createElement as h } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "../../src/components/hero/HeroSection";
import { CategorySection } from "../../src/components/categories/CategorySection";
import { CategoryCard } from "../../src/components/categories/CategoryCard";
import { UpcomingEventsSection } from "../../src/components/events/UpcomingEventsSection";
import { EventCard } from "../../src/components/events/EventCard";
import { EventGrid } from "../../src/components/events/EventGrid";
import { Footer } from "../../src/components/layout/Footer";
import { MOCK_EVENTS } from "../../src/data/mockEvents";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

describe("Home & Event UI Components", () => {
  describe("HeroSection", () => {
    it("should render main heading, search input, and category chips", () => {
      const handleSearch = vi.fn();
      const handleSelectCategory = vi.fn();

      render(
        h(HeroSection, {
          onSearch: handleSearch,
          onSelectCategory: handleSelectCategory,
        })
      );

      expect(screen.getByText(/Discover your next experience/i)).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/Search events, artists, venues.../i);
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "Coldplay" } });
      fireEvent.click(screen.getByRole("button", { name: /^Search$/i }));
      expect(handleSearch).toHaveBeenCalledWith("Coldplay");

      // Click a category chip
      const concertsChip = screen.getByText("Concerts");
      fireEvent.click(concertsChip);
      expect(handleSelectCategory).toHaveBeenCalledWith("concerts");
    });
  });

  describe("CategorySection & CategoryCard", () => {
    it("should render category section and trigger onSelectCategory", () => {
      const handleSelect = vi.fn();

      render(
        h(CategorySection, {
          selectedCategory: "all",
          onSelectCategory: handleSelect,
        })
      );

      expect(screen.getByText("Explore by category")).toBeInTheDocument();
      const concertCard = screen.getByText("Concerts");
      fireEvent.click(concertCard);
      expect(handleSelect).toHaveBeenCalledWith("concerts");
    });

    it("should toggle off selected category when clicked again in CategorySection", () => {
      const handleSelect = vi.fn();

      render(
        h(CategorySection, {
          selectedCategory: "concerts",
          onSelectCategory: handleSelect,
        })
      );

      const concertCard = screen.getByText("Concerts");
      fireEvent.click(concertCard);
      expect(handleSelect).toHaveBeenCalledWith("all");
    });

    it("should render CategoryCard with icon, title, description, and handle onSelect", () => {
      const handleSelect = vi.fn();
      const item = {
        id: "cat-1",
        name: "Festivals",
        slug: "festivals" as const,
        icon: h(MusicNoteIcon),
        description: "Open air festivals",
      };

      render(
        h(CategoryCard, {
          category: item,
          isSelected: true,
          onSelect: handleSelect,
        })
      );

      expect(screen.getByText("Festivals")).toBeInTheDocument();
      expect(screen.getByText("Open air festivals")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Festivals"));
      expect(handleSelect).toHaveBeenCalledWith("festivals");
    });
  });

  describe("UpcomingEventsSection, EventGrid & EventCard", () => {
    it("should render upcoming events section and handle view all click", () => {
      const handleViewAll = vi.fn();

      render(
        h(UpcomingEventsSection, {
          events: MOCK_EVENTS,
          selectedCategory: "concerts",
          onViewAll: handleViewAll,
        })
      );

      expect(screen.getByText("Upcoming events")).toBeInTheDocument();
      expect(screen.getByText(/Filtering by: Concerts/i)).toBeInTheDocument();

      const viewAllBtn = screen.getByRole("button", { name: /View all/i });
      fireEvent.click(viewAllBtn);
      expect(handleViewAll).toHaveBeenCalled();
    });

    it("should display empty state message and call onResetFilter when no events match", () => {
      const handleReset = vi.fn();
      render(
        h(UpcomingEventsSection, {
          events: [],
          selectedCategory: "theatre",
          onSelectCategory: vi.fn(),
          onResetFilter: handleReset,
        })
      );

      expect(screen.getByText(/No events found/i)).toBeInTheDocument();
      const clearBtn = screen.getByRole("button", { name: /Clear filters/i });
      fireEvent.click(clearBtn);
      expect(handleReset).toHaveBeenCalled();
    });

    it("should render EventCard details correctly and handle click", () => {
      const event = MOCK_EVENTS[0];
      const handleClick = vi.fn();
      render(h(EventCard, { event, onClick: handleClick }));

      expect(screen.getByText(event.title)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(event.city))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(String(event.priceStartingFrom)))).toBeInTheDocument();

      fireEvent.click(screen.getByText(event.title));
      expect(handleClick).toHaveBeenCalledWith(event);
    });

    it("should render EventGrid with list of events", () => {
      render(h(EventGrid, { events: MOCK_EVENTS.slice(0, 2) }));
      expect(screen.getByText(MOCK_EVENTS[0].title)).toBeInTheDocument();
      expect(screen.getByText(MOCK_EVENTS[1].title)).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("should render footer branding and copyright", () => {
      render(h(Footer));

      expect(screen.getAllByText(/Seatify/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Seatify`))).toBeInTheDocument();
    });
  });
});
