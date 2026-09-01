import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Link,
  Divider,
} from "@mui/material";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Events", href: "#upcoming-events" },
    { label: "Categories", href: "#categories" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Brand Info */}
          <Box sx={{ maxWidth: 360 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                }}
              >
                <ConfirmationNumberOutlinedIcon fontSize="small" />
              </Box>
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  letterSpacing: "-0.03em",
                }}
              >
                Seatify
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              The modern discovery and reservation platform for live events, concerts, sports and theatre.
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 4 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                underline="none"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  transition: "color 0.2s ease-in-out",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Copyright */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {currentYear} Seatify Inc. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link
              href="#"
              underline="hover"
              variant="caption"
              color="text.secondary"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              underline="hover"
              variant="caption"
              color="text.secondary"
            >
              Terms of Service
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

