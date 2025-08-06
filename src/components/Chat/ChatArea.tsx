"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Fade,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Mic as MicIcon,
  Chat as ChatIcon,
  Psychology as AnalyzeIcon,
  Description as FileIcon,
} from "@mui/icons-material";
import { useChat } from "@ai-sdk/react";
import Message from "./Message";
import NoRTLFlip from "../atom/NoRTLFlip";
import ChatStartScreen from "./ChatStartScreen";
import AudioPlayer from "../Audio/AudioPlayer";
import { useTextToSpeech } from "@/components/Audio/hooks/useTextToSpeech";

interface AttachedFile {
  id: string;
  name: string;
  type: string;
  category: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  attachedFiles?: AttachedFile[];
}

interface TTSSettings {
  voiceKey: string;
  speed: number;
  volume: number;
}

interface ChatAreaProps {
  attachedFiles?: AttachedFile[];
  showAttachedFiles?: boolean;
  placeholder?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  chatTitle?: string;
  showStartScreen?: boolean;
  startScreenSuggestions?: Array<{
    text: string;
    category?: string;
  }>;
  apiEndpoint?: string;
  onMessageSent?: (message: string, attachedFiles?: AttachedFile[]) => void;

  showHeader?: boolean;
}

export default function ChatArea({
  attachedFiles = [],
  showAttachedFiles = false,
  placeholder = "سوال خود را مطرح کنید...",
  emptyStateTitle = "چت جدید",
  emptyStateDescription = "سوال خود را در پایین مطرح کنید",
  chatTitle,
  showStartScreen = true,
  startScreenSuggestions = [],
  apiEndpoint = "/api/chat",
  onMessageSent,
  showHeader = false,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, append } = useChat({
    api: apiEndpoint,
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const {
    playAudio,
    stopAudio,
    togglePlayPause,
    handleSeek,
    activeMessage,
    isPlaying,
    progress,
    isLoading: isTtsLoading,
    duration,
  } = useTextToSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const message = input.trim();

      append({
        role: "user",
        content: message,
      });

      onMessageSent?.(message, attachedFiles);

      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);
  };

  const handlePlayAudio = (message: ChatMessage) => {
    playAudio(message);
  };

  const chatMessages: ChatMessage[] = messages.map((message) => ({
    id: message.id,
    content: message.content,
    role: message.role as "user" | "assistant",
    attachedFiles: message.role === "user" ? attachedFiles : undefined,
  }));

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        p: showHeader ? 0 : 2,
      }}
    >
      {/* Audio Player */}
      <Fade in={!!activeMessage}>
        <Box>
          {activeMessage && (
            <AudioPlayer
              isPlaying={isPlaying}
              progress={progress}
              duration={duration}
              onTogglePlayPause={togglePlayPause}
              onSeek={handleSeek}
              onClose={stopAudio}
            />
          )}
        </Box>
      </Fade>

      {chatTitle && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {chatTitle}
          </Typography>
          {attachedFiles.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {attachedFiles.length} فایل ضمیمه شده
            </Typography>
          )}
        </Paper>
      )}

      {showAttachedFiles && attachedFiles.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "grey.200",
            bgcolor: "primary.light",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <AnalyzeIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              فایل‌های انتخاب شده برای چت
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {attachedFiles.map((file) => (
              <Chip
                key={file.id}
                icon={<FileIcon />}
                label={file.name}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ bgcolor: "background.paper" }}
              />
            ))}
          </Box>
        </Paper>
      )}

      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          py: 2,
          px: showHeader ? 2 : 0,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "grey.300",
            borderRadius: "3px",
            "&:hover": {
              bgcolor: "grey.400",
            },
          },
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {chatMessages.length === 0 ? (
          showStartScreen ? (
            <ChatStartScreen
              onSuggestionClick={handleSuggestionClick}
              suggestions={startScreenSuggestions}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <ChatIcon sx={{ fontSize: 48, mb: 2, color: "primary.main" }} />
              <Typography variant="h6" gutterBottom>
                {emptyStateTitle}
              </Typography>
              <Typography variant="body2">{emptyStateDescription}</Typography>
            </Box>
          )
        ) : (
          <Fade in timeout={300}>
            <Box sx={{ px: { xs: 1, sm: 2 } }}>
              {chatMessages.map((message, index) => (
                <Fade
                  key={message.id}
                  in
                  timeout={300}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div>
                    <Message
                      message={{
                        id: message.id,
                        content: message.content,
                        role: message.role,
                      }}
                      onPlayAudio={() => handlePlayAudio(message)}
                      isActive={activeMessage?.id === message.id}
                      isTtsLoading={isTtsLoading && !isPlaying}
                      isPlaying={isPlaying}
                    />
                  </div>
                </Fade>
              ))}
            </Box>
          </Fade>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ mt: "auto", pt: 2, px: showHeader ? 2 : { xs: 1, sm: 2 } }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            alignItems: "flex-end",
            borderRadius: "24px",
            bgcolor: "background.paper",
            boxShadow: isFocused
              ? "0 8px 32px rgba(59, 130, 246, 0.15)"
              : "0 4px 16px rgba(0,0,0,0.08)",
            border: isFocused ? "2px solid" : "1px solid",
            borderColor: isFocused ? "primary.main" : "grey.200",
            transition: "all 0.2s ease-in-out",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
            <Tooltip title="ضمیمه فایل">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            fullWidth
            variant="standard"
            placeholder={placeholder}
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            multiline
            maxRows={4}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            InputProps={{
              disableUnderline: true,
              sx: {
                px: 1,
                py: 1.5,
                fontSize: "1rem",
                "& .MuiInputBase-input": {
                  "&::placeholder": {
                    color: "text.secondary",
                    opacity: 0.7,
                  },
                },
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", p: 1, gap: 0.5 }}>
            <Tooltip title="ضبط صوت">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <MicIcon />
              </IconButton>
            </Tooltip>

            <Fade in={!!input.trim() || isLoading}>
              <IconButton
                type="submit"
                disabled={isLoading || !input.trim()}
                sx={{
                  bgcolor: input.trim() ? "primary.main" : "grey.300",
                  color: "white",
                  width: 40,
                  height: 40,
                  "&:hover": {
                    bgcolor: input.trim() ? "primary.dark" : "grey.400",
                  },
                  "&:disabled": {
                    bgcolor: "grey.300",
                    color: "grey.500",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <NoRTLFlip>
                    <SendIcon style={{ transform: "scaleX(-1)" }} />
                  </NoRTLFlip>
                )}
              </IconButton>
            </Fade>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export type { TTSSettings };
