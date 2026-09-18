import React, { useState, useMemo, useEffect } from "react";
import { Box } from "@mui/material";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { HeroSection } from "../../components/hero/HeroSection";
import { CategorySection } from "../../components/categories/CategorySection";
import { UpcomingEventsSection } from "../../components/events/UpcomingEventsSection";
import { Event, EventCategory } from "../../types/event";
import { useFetch } from "../../hooks/useFetch";

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const { data: eventsData, execute } = useFetch<Event[]>();

  useEffect(() => {
    void execute("/events");
  }, [execute]);

  const events = eventsData ?? [];

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    const element = document.querySelector("#upcoming-events");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectCategory = (category: string): void => {
    setSelectedCategory(category as EventCategory | "all");
  };

  const handleResetFilter = (): void => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const handleEventClick = (event: Event): void => {
    // Interactive action ready for future event details / reservation routing
    console.log("Selected event:", event.id, event.title);
  };

  const handleViewAll = (): void => {
    handleResetFilter();
    const element = document.querySelector("#upcoming-events");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter events based on search query and selected category from original dataset
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        selectedCategory === "all" || event.category === selectedCategory;

      const matchesSearch =
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [events, searchQuery, selectedCategory]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <HeroSection
          onSearch={handleSearch}
          onSelectCategory={handleSelectCategory}
        />

        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        <UpcomingEventsSection
          events={filteredEvents}
          selectedCategory={selectedCategory}
          onEventClick={handleEventClick}
          onResetFilter={handleResetFilter}
          onViewAll={handleViewAll}
        />
      </Box>

      <Footer />
    </Box>
  );
};
