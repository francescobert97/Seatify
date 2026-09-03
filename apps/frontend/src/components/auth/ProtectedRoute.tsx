import React, { ReactNode, useState } from "react";
import { Box, CircularProgress, Typography, Button, Paper } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../../auth/useAuth";
import { AuthModal } from "./AuthModal";

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackMessage?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackMessage = "You must be signed in to access this area.",
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Restoring authentication session...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 450,
            width: "100%",
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "action.hover",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <LockOutlinedIcon fontSize="medium" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Sign In Required
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {fallbackMessage}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAuthModalOpen(true)}
            sx={{ px: 3, py: 1, fontWeight: 700 }}
          >
            Sign In
          </Button>

          <AuthModal
            open={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialTab="login"
          />
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
};

