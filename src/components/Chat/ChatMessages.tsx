import React, { useEffect, useRef } from "react";
import { Box, Fade } from "@mui/material";
import { Message as MessageType } from "ai";
import Message from "./Message";
import ChatStartScreen from "./ChatStartScreen";

interface ChatMessagesProps {
  messages: MessageType[];
  onPlayAudio: (message: MessageType) => void;
  activeMessageId: string | null;
  isTtsLoading: boolean;
  isPlaying: boolean;
}

export default function ChatMessages({
  messages,
  onPlayAudio,
  activeMessageId,
  isTtsLoading,
  isPlaying,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: "auto",
        py: 2,
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
      }}
    >
      {messages.length === 0 ? (
        <ChatStartScreen />
      ) : (
        <Fade in timeout={300}>
          <Box>
            {messages.map((m, index) => (
              <Fade
                key={m.id}
                in
                timeout={300}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div>
                  <Message
                    message={m}
                    onPlayAudio={onPlayAudio}
                    isActive={activeMessageId === m.id}
                    isTtsLoading={isTtsLoading}
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
  );
}
