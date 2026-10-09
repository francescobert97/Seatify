import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Stack
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { UserProfileSettings } from "../../types/account";

interface AccountSettingsSectionProps {
  initialProfile: UserProfileSettings;
}

export const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  initialProfile,
}) => {
  const [profile, setProfile] = useState<UserProfileSettings>(initialProfile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<UserProfileSettings>(initialProfile);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: { firstName?: string; lastName?: string; email?: string } = {};

    if (!formValues.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formValues.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEdit = () => {
    setFormValues(profile);
    setErrors({});
    setSuccessMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormValues(profile);
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    setProfile(formValues);
    setIsEditing(false);
    setSuccessMessage(
      "Profile changes saved successfully!"
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and update your personal details and contact information.
        </Typography>
      </Box>

      {/* Success alert */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Personal Info Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Personal Information
            </Typography>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={handleStartEdit}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
              >
                Edit Information
              </Button>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={isEditing ? formValues.firstName : profile.firstName}
                onChange={(e) => setFormValues((prev) => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
                inputProps={{ "aria-label": "First Name" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={isEditing ? formValues.lastName : profile.lastName}
                onChange={(e) => setFormValues((prev) => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
                inputProps={{ "aria-label": "Last Name" }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={isEditing ? formValues.email : profile.email}
                onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                error={Boolean(errors.email)}
                helperText={errors.email || (!isEditing ? "Primary contact address for tickets" : undefined)}
                inputProps={{ "aria-label": "Email Address" }}
              />
            </Grid>
          </Grid>

          {isEditing && (
            <Stack direction="row" spacing={2} sx={{ mt: 3.5, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CloseOutlinedIcon />}
                onClick={handleCancel}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveOutlinedIcon />}
                onClick={handleSave}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3 }}
              >
                Save Changes
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
