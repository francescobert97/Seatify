import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import { useAuth } from "../../auth/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  initialTab = "login",
}) => {
  const { signIn, signUp } = useAuth();
  const [tabIndex, setTabIndex] = useState<number>(initialTab === "signup" ? 1 : 0);

  // Form states
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = (): void => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Failed to sign in. Please verify your credentials.");
    } else {
      handleClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await signUp(email, password, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Registration failed. Please try again.");
    } else {
      setSuccessMsg(
        "Account created successfully! If email confirmation is enabled, please check your inbox."
      );
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
          {tabIndex === 0 ? "Welcome to Seatify" : "Create your account"}
        </Typography>
        <IconButton onClick={handleClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 1 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            mb: 2.5,
          }}
        >
          <Tab
            icon={<LockOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Log In"
            sx={{ fontWeight: 600, textTransform: "none", minHeight: 48 }}
          />
          <Tab
            icon={<PersonAddOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Sign Up"
            sx={{ fontWeight: 600, textTransform: "none", minHeight: 48 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}

        {tabIndex === 0 ? (
          // Log In Form
          <Box component="form" onSubmit={handleSignIn} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                size="small"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 1, py: 1.25, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
              </Button>
            </Stack>
          </Box>
        ) : (
          // Sign Up Form
          <Box component="form" onSubmit={handleSignUp} noValidate>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  size="small"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  size="small"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Box>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                size="small"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                required
                helperText="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 1, py: 1.25, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

