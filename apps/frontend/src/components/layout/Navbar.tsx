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
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAuth } from "../../auth/useAuth";
import { AuthModal } from "../auth/AuthModal";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");

  // User dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = (): void => {
    setAnchorEl(null);
  };

  const handleSignOut = async (): Promise<void> => {
    handleProfileMenuClose();
    setMobileOpen(false);
    await signOut();
  };

  const handleOpenAuth = (tab: "login" | "signup"): void => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileOpen(false);
  };

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

  const getUserDisplayName = (): string => {
    if (!user) return "";
    const meta = user.user_metadata as { firstName?: string; lastName?: string } | undefined;
    if (meta?.firstName) {
      return `${meta.firstName} ${meta.lastName || ""}`.trim();
    }
    return user.email?.split("@")[0] || "User";
  };

  const getUserInitials = (): string => {
    const name = getUserDisplayName();
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
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

            {/* Desktop Auth Section */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
              {isAuthenticated && user ? (
                <>
                  <Button
                    onClick={handleProfileMenuOpen}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      textTransform: "none",
                      color: "text.primary",
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 3,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "primary.main",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {getUserDisplayName()}
                    </Typography>
                  </Button>

                  <Menu
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleProfileMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                        border: "1px solid",
                        borderColor: "divider",
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {getUserDisplayName()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {user.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleSignOut} sx={{ py: 1, color: "error.main" }}>
                      <ListItemIcon sx={{ color: "error.main" }}>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Sign out
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => handleOpenAuth("login")}
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
                    onClick={() => handleOpenAuth("signup")}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      px: 2.5,
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
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

          {isAuthenticated && user && (
            <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontWeight: 700 }}>
                  {getUserInitials()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {getUserDisplayName()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

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
            {isAuthenticated ? (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{ fontWeight: 600, py: 1 }}
              >
                Sign out
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PersonOutlineIcon />}
                  onClick={() => handleOpenAuth("login")}
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
                  onClick={() => handleOpenAuth("signup")}
                  sx={{ fontWeight: 600, py: 1 }}
                >
                  Sign up
                </Button>
              </>
            )}
          </Stack>
        </Drawer>
      </AppBar>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
};
