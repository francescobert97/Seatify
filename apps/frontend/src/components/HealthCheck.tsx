import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Alert,
  Stack,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { HealthResponse } from "../types/api";
import { useFetch } from "../hooks/useFetch";

export const HealthCheck: React.FC = () => {
  const { data, error, isLoading, execute } = useFetch<HealthResponse>();

  useEffect(() => {
    void execute("/api/health");
  }, [execute]);

  return (
    <Card
      sx={{
        maxWidth: 500,
        width: "100%",
        mx: "auto",
        boxShadow: 4,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, textAlign: "center", mb: 3 }}
        >
          Stato del Backend (Fastify)
        </Typography>

        {isLoading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
              gap: 2,
            }}
          >
            <CircularProgress size={44} />
            <Typography variant="body2" color="text.secondary">
              Verifica connessione in corso...
            </Typography>
          </Box>
        )}

        {!isLoading && error && (
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon fontSize="inherit" />}
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Connessione non riuscita
              </Typography>
              <Typography variant="body2">{error.message}</Typography>
            </Alert>
          </Stack>
        )}

        {!isLoading && data && (
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              bgcolor: "action.hover",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Status:
              </Typography>
              <Chip
                icon={<CheckCircleOutlineIcon />}
                label={data.status.toUpperCase()}
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Messaggio:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, textAlign: "right" }}
              >
                {data.message}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => void execute("/api/health")}
            disabled={isLoading}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
            }}
          >
            Ricarica Stato
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
