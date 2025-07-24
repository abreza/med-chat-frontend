"use client";

import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import ChatArea, { TTSSettings } from "@/components/Chat/ChatArea";
import ChatHeader from "@/components/ChatHeader";

export default function ChatSection() {
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({
    voiceKey: "fa_IR-mana-medium",
    speed: 1,
    volume: 1,
  });

  const handleTtsSettingsChange = (newSettings: TTSSettings) => {
    setTtsSettings(newSettings);
  };

  const handleTtsSettingsUpdate = (newSettings: Partial<TTSSettings>) => {
    setTtsSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ChatHeader
        ttsSettings={ttsSettings}
        onTtsSettingsChange={handleTtsSettingsUpdate}
      />

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
          onTtsSettingsChange={handleTtsSettingsChange}
          showHeader={true}
        />
      </Container>
    </Box>
  );
}
