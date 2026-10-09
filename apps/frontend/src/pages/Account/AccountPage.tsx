import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useAuth } from "../../auth/useAuth";
import { MOCK_ORDERS, MOCK_DEFAULT_USER_PROFILE } from "../../data/mockOrders";
import { Order } from "../../types/order";
import { AccountTabSection, UserProfileSettings } from "../../types/account";
import { AccountOverview } from "./AccountOverview";
import { MyOrdersSection } from "./MyOrdersSection";
import { AccountSettingsSection } from "./AccountSettingsSection";

export const CustomerAreaContent: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState<AccountTabSection>("overview");
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Extract initial user profile from authenticated user or fallback
  const userMetadata = user?.user_metadata;
  const initialProfile: UserProfileSettings = {
    firstName: userMetadata?.firstName || MOCK_DEFAULT_USER_PROFILE.firstName,
    lastName: userMetadata?.lastName || MOCK_DEFAULT_USER_PROFILE.lastName,
    email: user?.email || MOCK_DEFAULT_USER_PROFILE.email,
  };

  const userDisplayName =
    initialProfile.firstName && initialProfile.lastName
      ? `${initialProfile.firstName} ${initialProfile.lastName}`
      : initialProfile.firstName || user?.email?.split("@")[0] || "Customer";

  const userInitials =
    initialProfile.firstName && initialProfile.lastName
      ? `${initialProfile.firstName[0]}${initialProfile.lastName[0]}`.toUpperCase()
      : userDisplayName.slice(0, 2).toUpperCase();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: AccountTabSection) => {
    setActiveTab(newValue);
  };

  const handleOrderSelectFromOverview = (order: Order) => {
    setSelectedOrder(order);
    setActiveTab("orders");
  };

  return (
    <Box>
      {/* Account Profile Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
          <Avatar
            sx={{
              width: { xs: 56, sm: 68 },
              height: { xs: 56, sm: 68 },
              bgcolor: "primary.main",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              fontWeight: 800,
            }}
          >
            {userInitials}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {userDisplayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {initialProfile.email}
            </Typography>
          </Box>
        </Stack>

        {/* Section Navigation Tabs */}
        <Box sx={{ mt: 3, borderTop: "1px solid", borderColor: "divider", pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            aria-label="Customer area sections"
          >
            <Tab
              value="overview"
              icon={<DashboardOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Overview"
              sx={{ fontWeight: 700, textTransform: "none", minHeight: 48 }}
            />
            <Tab
              value="orders"
              icon={<ConfirmationNumberOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="My Orders"
              sx={{ fontWeight: 700, textTransform: "none", minHeight: 48 }}
            />
            <Tab
              value="settings"
              icon={<SettingsOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Account Settings"
              sx={{ fontWeight: 700, textTransform: "none", minHeight: 48 }}
            />
          </Tabs>
        </Box>
      </Paper>

      {/* Tab Panels */}
      <Box sx={{ minHeight: 400 }}>
        {activeTab === "overview" && (
          <AccountOverview
            userDisplayName={initialProfile.firstName || userDisplayName}
            orders={orders}
            onNavigateTab={setActiveTab}
            onSelectOrder={handleOrderSelectFromOverview}
          />
        )}

        {activeTab === "orders" && (
          <MyOrdersSection
            orders={orders}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
          />
        )}

        {activeTab === "settings" && (
          <AccountSettingsSection initialProfile={initialProfile} />
        )}
      </Box>
    </Box>
  );
};

export const AccountPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#FAFAFA" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 5, flexGrow: 1 }}>
        <ProtectedRoute fallbackMessage="Please sign in to access your customer area and manage your orders.">
          <CustomerAreaContent />
        </ProtectedRoute>
      </Container>

      <Footer />
    </Box>
  );
};
