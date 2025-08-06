"use client";

import React from "react";
import { Box, Container } from "@mui/material";
import ChatArea from "@/components/Chat/ChatArea";
import ChatHeader from "@/components/Chat/ChatHeader";

export default function ChatPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ChatHeader />

      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          px: { xs: 1, sm: 2 },
          pb: 2,
        }}
      >
        <ChatArea
          placeholder="سوال پزشکی یا علائم خود را شرح دهید..."
          showStartScreen={true}
          apiEndpoint="/api/chat"
          showHeader={true}
        />
      </Container>
    </Box>
  );
}
