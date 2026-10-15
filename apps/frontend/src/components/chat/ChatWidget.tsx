import React, { useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Chip,
  Badge,
  Stack,
  Alert,
  Tooltip,
  Divider,
} from "@mui/material";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SendIcon from "@mui/icons-material/Send";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useChatStore } from "../../store/chatStore";
import { formatEventDate } from "../../utils/date-formatter";

export const ChatWidget: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    activeBooking,
    messages,
    inputValue,
    openChat,
    closeChat,
    minimizeChat,
    restoreChat,
    clearBookingContext,
    sendMessage,
    setInputValue,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If closed, render only the floating action button
  if (!isOpen) {
    return (
      <Tooltip title="AI Support Chat" placement="left">
        <IconButton
          color="primary"
          onClick={openChat}
          aria-label="open ai support chat"
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            width: { xs: 52, sm: 60 },
            height: { xs: 52, sm: 60 },
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            boxShadow: 4,
            zIndex: 1250,
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          {activeBooking ? (
            <Badge color="secondary" variant="dot">
              <SmartToyOutlinedIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
            </Badge>
          ) : (
            <SmartToyOutlinedIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  // If minimized, render a compact floating tab in the bottom-right corner
  if (isMinimized) {
    return (
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 4,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          zIndex: 1250,
          cursor: "pointer",
        }}
        onClick={restoreChat}
        aria-label="minimized ai chat"
      >
        <SmartToyOutlinedIcon fontSize="small" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          AI Support
        </Typography>
        {activeBooking && (
          <Chip
            size="small"
            label={activeBooking.orderReference}
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "inherit",
            }}
          />
        )}
        <IconButton
          size="small"
          aria-label="restore chat"
          onClick={(e) => {
            e.stopPropagation();
            restoreChat();
          }}
          sx={{ color: "inherit", p: 0.5 }}
        >
          <OpenInFullIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="close chat"
          onClick={(e) => {
            e.stopPropagation();
            closeChat();
          }}
          sx={{ color: "inherit", p: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Paper>
    );
  }

  // Active overlay chat panel
  return (
    <Paper
      elevation={8}
      role="region"
      aria-label="AI Support Chat Panel"
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        width: { xs: "calc(100vw - 32px)", sm: 380 },
        height: { xs: "calc(100vh - 120px)", sm: 540 },
        maxHeight: { xs: 600, sm: 540 },
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        zIndex: 1300,
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SmartToyOutlinedIcon fontSize="small" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Seatify AI Support
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
              <Chip
                label="Offline • Preview"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                  color: "#FFFFFF",
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="small"
            aria-label="minimize chat"
            onClick={minimizeChat}
            sx={{ color: "inherit", p: 0.75 }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="close chat"
            onClick={closeChat}
            sx={{ color: "inherit", p: 0.75 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Assistant Offline Notice */}
      <Alert
        severity="info"
        sx={{
          py: 0.5,
          px: 2,
          borderRadius: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          fontSize: "0.75rem",
          "& .MuiAlert-message": { py: 0 },
        }}
      >
        AI assistant is not connected yet. Live responses and booking actions are currently unavailable.
      </Alert>

      {/* Active Booking Context Card */}
      {activeBooking && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: "rgba(79, 70, 229, 0.05)",
            borderBottom: "1px solid",
            borderColor: "rgba(79, 70, 229, 0.15)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <ConfirmationNumberOutlinedIcon sx={{ fontSize: "1rem", color: "primary.main" }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main" }}>
                Selected Booking: {activeBooking.orderReference}
              </Typography>
            </Box>
            <Tooltip title="Remove booking context">
              <IconButton
                size="small"
                aria-label="clear booking context"
                onClick={clearBookingContext}
                sx={{ p: 0.25, color: "text.secondary" }}
              >
                <HighlightOffIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
            {activeBooking.eventName}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: "0.8rem" }} />
              <Typography variant="caption">{formatEventDate(activeBooking.eventDate)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: "0.8rem" }} />
              <Typography variant="caption">
                {activeBooking.venue}, {activeBooking.city}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              {activeBooking.ticketCount} {activeBooking.ticketCount === 1 ? "ticket" : "tickets"} (
              {activeBooking.tickets.map((t) => t.id).join(", ")})
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {activeBooking.currency}
              {activeBooking.totalAmount}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Messages Scroll Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          bgcolor: "#F8FAFC",
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 1.25,
                  maxWidth: "85%",
                  borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  bgcolor: isUser ? "primary.main" : "background.paper",
                  color: isUser ? "primary.contrastText" : "text.primary",
                  border: isUser ? "none" : "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  {msg.text}
                </Typography>
              </Paper>
              <Typography
                variant="caption"
                sx={{
                  mt: 0.25,
                  px: 1,
                  fontSize: "0.65rem",
                  color: "text.disabled",
                }}
              >
                {isUser ? "You" : "Seatify System"}
              </Typography>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Message Input Box */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 1.5,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type your question or request..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{
            "aria-label": "chat message input",
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              fontSize: "0.875rem",
            },
          }}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={!inputValue.trim()}
          aria-label="send message"
          sx={{
            bgcolor: inputValue.trim() ? "primary.main" : "action.disabledBackground",
            color: inputValue.trim() ? "primary.contrastText" : "action.disabled",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            width: 40,
            height: 40,
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};
