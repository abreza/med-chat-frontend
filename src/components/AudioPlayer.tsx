import React from "react";
import { IconButton, Slider, Box, Fade, Paper } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import CloseIcon from "@mui/icons-material/Close";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import NoRTLFlip from "./NoRTLFlip";

interface AudioPlayerProps {
  isPlaying: boolean;
  progress: number;
  duration: number;
  onTogglePlayPause: () => void;
  onSeek: (value: number) => void;
  onClose: () => void;
}

export default function AudioPlayer({
  isPlaying,
  progress,
  duration,
  onTogglePlayPause,
  onSeek,
  onClose,
}: AudioPlayerProps) {
  return (
    <Fade in timeout={300}>
      <Paper
        elevation={4}
        sx={{
          position: "fixed",
          top: { xs: 16, sm: 24 },
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "600px",
          width: { xs: "95%", sm: "90%" },
          borderRadius: "16px",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 1200,
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <NoRTLFlip>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minHeight: "64px",
              px: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
              <GraphicEqIcon
                sx={{
                  color: "primary.main",
                  mr: 1,
                  animation: isPlaying ? "pulse 1.5s infinite" : "none",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.6 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            </Box>

            <IconButton
              onClick={onTogglePlayPause}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                mr: 2,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <Slider
              size="small"
              value={progress}
              max={duration || 0}
              onChange={(_, value) => onSeek(value as number)}
              sx={{
                color: "primary.main",
                height: 4,
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                  "&:before": {
                    boxShadow: "0 2px 12px 0 rgba(59, 130, 246, 0.4)",
                  },
                },
                "& .MuiSlider-track": {
                  border: "none",
                },
              }}
            />

            <IconButton
              onClick={onClose}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </NoRTLFlip>
      </Paper>
    </Fade>
  );
}
