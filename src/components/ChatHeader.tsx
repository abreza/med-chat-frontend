import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { Settings } from "@mui/icons-material";
import TTSSettingsDialog from "./TTSSettingsDialog";

export default function ChatHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Toolbar>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            <LocalHospitalIcon />
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              دستیار پزشکی هوشمند
            </Typography>
            <Typography variant="caption" color="text.secondary">
              آماده پاسخگویی
            </Typography>
          </Box>

          <IconButton
            edge="end"
            onClick={handleSettingsClick}
            sx={{
              "&:hover": {
                bgcolor: "primary.light",
                color: "primary.main",
              },
            }}
          >
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      <TTSSettingsDialog open={settingsOpen} onClose={handleSettingsClose} />
    </>
  );
}
