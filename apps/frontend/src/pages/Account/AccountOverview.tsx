import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Order } from "../../types/order";
import { formatEventDate } from "../../utils/date-formatter";

interface AccountOverviewProps {
  userDisplayName: string;
  orders: Order[];
  onNavigateTab: (tab: "overview" | "orders" | "settings") => void;
  onSelectOrder: (order: Order) => void;
}

const STATUS_CHIP_COLORS: Record<string, "success" | "default" | "error"> = {
  confirmed: "success",
  completed: "default",
  cancelled: "error",
};

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  userDisplayName,
  orders,
  onNavigateTab,
  onSelectOrder,
}) => {
  const confirmedOrdersCount = orders.filter((o) => o.status === "confirmed").length;
  const recentOrders = orders.slice(0, 2);

  return (
    <Box>
      {/* Welcome Message */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Welcome back, {userDisplayName || "Customer"}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your bookings, review your purchase history, and update your personal details.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => onNavigateTab("settings")}
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
        >
          Edit Settings
        </Button>
      </Box>

      {/* Account Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ConfirmationNumberOutlinedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Orders
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {orders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "rgba(16, 185, 129, 0.12)",
                    color: "rgb(5, 150, 105)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EventAvailableOutlinedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Bookings
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {confirmedOrdersCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "rgba(99, 102, 241, 0.12)",
                    color: "rgb(79, 70, 229)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <VerifiedUserOutlinedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Membership Status
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                Verified Member
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent Orders
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => onNavigateTab("orders")}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            View all orders
          </Button>
        </Box>

        {recentOrders.length === 0 ? (
          <Card elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              No orders yet.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {recentOrders.map((order) => (
              <Card
                key={order.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {order.eventName}
                    </Typography>
                    <Chip
                      label={order.status.toUpperCase()}
                      size="small"
                      color={STATUS_CHIP_COLORS[order.status] || "default"}
                      sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                    />
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.5, sm: 2 }} color="text.secondary">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                      <Typography variant="caption">{formatEventDate(order.eventDate)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                      <Typography variant="caption">
                        {order.venue}, {order.city}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    Ref: {order.orderReference} • {order.tickets.length} {order.tickets.length === 1 ? "ticket" : "tickets"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    alignSelf: { xs: "stretch", sm: "auto" },
                    justifyContent: { xs: "space-between", sm: "flex-end" },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {order.currency}
                    {order.totalAmount}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onSelectOrder(order)}
                    sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
