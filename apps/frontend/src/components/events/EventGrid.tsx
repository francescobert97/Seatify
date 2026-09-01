import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Event } from "../../types/event";
import { EventCard } from "./EventCard";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";

interface EventGridProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onResetFilter?: () => void;
}

export const EventGrid: React.FC<EventGridProps> = ({
  events,
  onEventClick,
  onResetFilter,
}) => {
  if (events.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          px: 2,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "action.hover",
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <EventBusyOutlinedIcon fontSize="medium" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          No events found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
          We couldn't find any events matching your criteria. Try adjusting your search query or category filter.
        </Typography>
        {onResetFilter && (
          <Button
            variant="outlined"
            onClick={onResetFilter}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Clear filters
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: { xs: 2.5, sm: 3, md: 3.5 },
      }}
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} onClick={onEventClick} />
      ))}
    </Box>
  );
};

