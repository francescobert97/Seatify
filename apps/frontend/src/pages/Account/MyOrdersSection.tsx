import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Tooltip,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Order, OrderStatus } from "../../types/order";
import { formatEventDate } from "../../utils/date-formatter";
import { navigate } from "../../router/navigation";

interface MyOrdersSectionProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
}

const STATUS_CHIP_COLORS: Record<OrderStatus, "success" | "default" | "error"> = {
  confirmed: "success",
  completed: "default",
  cancelled: "error",
};

export const MyOrdersSection: React.FC<MyOrdersSectionProps> = ({
  orders,
  selectedOrder,
  onSelectOrder,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  const getStatusCount = (status: string) => {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          My Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review your ticket bookings, order receipts, and status.
        </Typography>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(_e, val) => setStatusFilter(val)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Filter orders by status"
        >
          <Tab
            value="all"
            label={`All (${getStatusCount("all")})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            value="confirmed"
            label={`Confirmed (${getStatusCount("confirmed")})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            value="completed"
            label={`Completed (${getStatusCount("completed")})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            value="cancelled"
            label={`Cancelled (${getStatusCount("cancelled")})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <ShoppingBagOutlinedIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
            {statusFilter === "all"
              ? "You haven't purchased any tickets yet. Explore our upcoming events to get started!"
              : `There are currently no orders with status "${statusFilter}".`}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
          >
            Browse Events
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 1.5,
                  mb: 2,
                  pb: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Reference: {order.orderReference}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Purchased on {formatEventDate(order.purchaseDate)}
                  </Typography>
                </Box>
                <Chip
                  label={order.status.toUpperCase()}
                  size="small"
                  color={STATUS_CHIP_COLORS[order.status] || "default"}
                  sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: 2,
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {order.eventName}
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.5, sm: 2 }} color="text.secondary">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                      <Typography variant="body2">{formatEventDate(order.eventDate)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                      <Typography variant="body2">
                        {order.venue}, {order.city}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    <ConfirmationNumberOutlinedIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {order.tickets.length} {order.tickets.length === 1 ? "ticket" : "tickets"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    alignSelf: { xs: "stretch", md: "auto" },
                    justifyContent: { xs: "space-between", md: "flex-end" },
                  }}
                >
                  <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Total Paid
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                      {order.currency}
                      {order.totalAmount}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => onSelectOrder(order)}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog
          open={Boolean(selectedOrder)}
          onClose={() => onSelectOrder(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, p: 1 },
          }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Order Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedOrder.orderReference}
              </Typography>
            </Box>
            <IconButton onClick={() => onSelectOrder(null)} size="small" aria-label="close order details">
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ py: 2.5 }}>
            {/* Event Header in Modal */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {selectedOrder.eventName}
                </Typography>
                <Chip
                  label={selectedOrder.status.toUpperCase()}
                  size="small"
                  color={STATUS_CHIP_COLORS[selectedOrder.status] || "default"}
                  sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                />
              </Box>

              <Stack spacing={0.5} color="text.secondary">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: "0.95rem" }} />
                  <Typography variant="body2">{formatEventDate(selectedOrder.eventDate)}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: "0.95rem" }} />
                  <Typography variant="body2">
                    {selectedOrder.venue}, {selectedOrder.city}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Tickets Breakdown */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Tickets Purchased
              </Typography>
              <Stack spacing={1.5}>
                {selectedOrder.tickets.map((t) => (
                  <Box
                    key={t.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      bgcolor: "background.default",
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ticket ID: {t.id}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {selectedOrder.currency}
                      {t.price}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Order Summary Metadata */}
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Order Reference:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedOrder.orderReference}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Purchase Date:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatEventDate(selectedOrder.purchaseDate)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {selectedOrder.status.toUpperCase()}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px dashed #E2E8F0" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Total Amount:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "primary.main" }}>
                  {selectedOrder.currency}
                  {selectedOrder.totalAmount}
                </Typography>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            {/* Manage Booking Button (AI Chat Hook - Currently Disabled) */}
            <Tooltip
              title="Manage Booking with our AI support assistant will be available soon."
              arrow
            >
              <span>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled
                  startIcon={<SmartToyOutlinedIcon />}
                  data-order-id={selectedOrder.id}
                  data-order-ref={selectedOrder.orderReference}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    opacity: 0.6,
                  }}
                >
                  Manage Booking
                </Button>
              </span>
            </Tooltip>

            <Button
              variant="text"
              onClick={() => onSelectOrder(null)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
