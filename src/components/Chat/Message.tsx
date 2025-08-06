import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { Message as MessageType } from "ai";
import NoRTLFlip from "../atom/NoRTLFlip";

interface MessageProps {
  message: MessageType;
  onPlayAudio: (message: MessageType) => void;
  isActive: boolean;
  isPlaying: boolean;
  isTtsLoading: boolean;
}

export default function Message({
  message,
  onPlayAudio,
  isActive,
  isPlaying,
  isTtsLoading,
}: MessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const renderPlayIcon = () => {
    if (isActive) {
      if (isTtsLoading) return <CircularProgress size={18} />;
      return isPlaying ? (
        <PauseCircleOutlineIcon sx={{ fontSize: "1.25rem" }} />
      ) : (
        <PlayCircleOutlineIcon sx={{ fontSize: "1.25rem" }} />
      );
    }
    return <VolumeUpIcon sx={{ fontSize: "1.1rem" }} />;
  };

  const ActionButtons = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        mt: 1,
        flexWrap: "wrap",
      }}
    >
      <NoRTLFlip>
        <Tooltip title="پخش صوت">
          <IconButton
            onClick={() => onPlayAudio(message)}
            disabled={isTtsLoading && !isActive}
            size="small"
            sx={{
              bgcolor: isActive ? "primary.light" : "transparent",
              color: isActive ? "primary.main" : "text.secondary",
              "&:hover": {
                bgcolor: "primary.light",
                color: "primary.main",
              },
            }}
          >
            {renderPlayIcon()}
          </IconButton>
        </Tooltip>

        <Tooltip title={copied ? "کپی شد!" : "کپی متن"}>
          <IconButton
            onClick={handleCopy}
            size="small"
            sx={{
              color: copied ? "success.main" : "text.secondary",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            <ContentCopyIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Tooltip>
        {!isUser && (
          <>
            <Tooltip title="پاسخ مفید بود">
              <IconButton
                size="small"
                onClick={() => console.log("Helpful:", message.id)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "success.light",
                    color: "success.main",
                  },
                }}
              >
                <ThumbUpOutlinedIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="پاسخ مفید نبود">
              <IconButton
                size="small"
                onClick={() => console.log("Not helpful:", message.id)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: "error.light",
                    color: "error.main",
                  },
                }}
              >
                <ThumbDownOutlinedIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="اشتراک‌گذاری">
          <IconButton
            size="small"
            onClick={() => console.log("Share:", message.id)}
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            <ShareIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Tooltip>
      </NoRTLFlip>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 3,
        px: { xs: 1, sm: 2 },
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            bgcolor: "error.main",
            width: 36,
            height: 36,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: "1.25rem" }} />
        </Avatar>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          maxWidth: "75%",
          minWidth: "200px",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser
              ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              : "background.paper",
            color: isUser ? "white" : "text.primary",
            borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
            border: isUser ? "none" : "1px solid",
            borderColor: "grey.200",
            boxShadow: isUser
              ? "0 4px 16px rgba(59, 130, 246, 0.3)"
              : "0 2px 8px rgba(0,0,0,0.04)",
            position: "relative",
            background: isUser
              ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              : "background.paper",
          }}
        >
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              fontSize: "0.95rem",
            }}
          >
            {message.content}
          </Typography>
          {copied && (
            <Chip
              label="کپی شد!"
              size="small"
              color="success"
              sx={{
                position: "absolute",
                top: -12,
                right: 16,
                fontSize: "0.75rem",
              }}
            />
          )}
        </Paper>
        <ActionButtons />
      </Box>

      {isUser && (
        <Avatar
          sx={{
            bgcolor: "grey.400",
            width: 36,
            height: 36,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <PersonIcon sx={{ fontSize: "1.25rem" }} />
        </Avatar>
      )}
    </Box>
  );
}
