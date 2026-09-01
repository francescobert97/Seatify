import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const handleDrawerToggle = (): void => {
    setMobileOpen((prev) => !prev);
  };

  const navLinks = [
    { label: "Events", href: "#upcoming-events" },
    { label: "Categories", href: "#categories" },
  ];

  const handleNavClick = (href: string): void => {
    setMobileOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 72, justifyContent: "space-between" }}>
          {/* Logo / Brand */}
          <Box
            component="a"
            href="#"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "inherit",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
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
              variant="h5"
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

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  px: 2,
                  "&:hover": {
                    color: "text.primary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Desktop Auth Buttons */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            <Button
              variant="text"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Log in
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontWeight: 600,
                fontSize: "0.95rem",
                px: 2.5,
              }}
            >
              Sign up
            </Button>
          </Stack>

          {/* Mobile Hamburger Toggle */}
          <IconButton
            color="inherit"
            aria-label="open navigation drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: { width: "80%", maxWidth: 320, p: 2, bgcolor: "background.paper" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              <ConfirmationNumberOutlinedIcon fontSize="inherit" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Seatify
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle} aria-label="close drawer">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 1 }} />

        <List sx={{ py: 1 }}>
          {navLinks.map((link) => (
            <ListItem key={link.label} disablePadding>
              <ListItemButton
                onClick={() => handleNavClick(link.href)}
                sx={{ borderRadius: 1.5, py: 1.25 }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: "1rem" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5} sx={{ mt: "auto" }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleDrawerToggle}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 600,
              py: 1,
            }}
          >
            Log in
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleDrawerToggle}
            sx={{ fontWeight: 600, py: 1 }}
          >
            Sign up
          </Button>
        </Stack>
      </Drawer>
    </AppBar>
  );
};

