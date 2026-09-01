import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Event, EventCategory } from "../../types/event";
import { EventGrid } from "./EventGrid";

interface UpcomingEventsSectionProps {
  events: Event[];
  selectedCategory?: EventCategory | "all";
  onEventClick?: (event: Event) => void;
  onResetFilter?: () => void;
  onViewAll?: () => void;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  selectedCategory,
  onEventClick,
  onResetFilter,
  onViewAll,
}) => {
  return (
    <Box
      id="upcoming-events"
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: { xs: 4, md: 5 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.65rem", sm: "2rem", md: "2.25rem" },
                color: "text.primary",
                letterSpacing: "-0.02em",
              }}
            >
              Upcoming events
            </Typography>
            {selectedCategory && selectedCategory !== "all" && (
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                Filtering by: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </Typography>
            )}
          </Box>

          <Button
            variant="text"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={onViewAll}
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              p: 0,
              "&:hover": {
                bgcolor: "transparent",
                color: "primary.dark",
                "& .MuiButton-endIcon": {
                  transform: "translateX(4px)",
                },
              },
              "& .MuiButton-endIcon": {
                transition: "transform 0.2s ease-in-out",
              },
            }}
          >
            View all
          </Button>
        </Box>

        {/* Events Grid */}
        <EventGrid
          events={events}
          onEventClick={onEventClick}
          onResetFilter={onResetFilter}
        />
      </Container>
    </Box>
  );
};

