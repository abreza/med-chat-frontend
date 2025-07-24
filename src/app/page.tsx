"use client";

import React, { useState } from "react";
import { Box, IconButton, Paper, Tooltip } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import FolderIcon from "@mui/icons-material/Folder";
import ChatSection from "../components/Layout/ChatSection";
import FileInteractionSection from "../components/Layout/FileInteractionSection";

type SectionType = "chat" | "fileInteraction" | null;

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionType>("chat");

  const handleSectionToggle = (section: SectionType) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: "chat" as const,
      icon: <ChatIcon />,
      title: "گفتگو",
      component: <ChatSection />,
    },
    {
      id: "fileInteraction" as const,
      icon: <FolderIcon />,
      title: "تعامل با فایل",
      component: <FileInteractionSection />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={2}
        sx={{
          width: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 2,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: 0,
          borderRight: "1px solid",
          borderColor: "grey.200",
          zIndex: 10,
        }}
      >
        {sections.map((section) => (
          <Tooltip key={section.id} title={section.title} placement="right">
            <IconButton
              onClick={() => handleSectionToggle(section.id)}
              sx={{
                mb: 2,
                width: 56,
                height: 56,
                bgcolor:
                  activeSection === section.id ? "primary.main" : "transparent",
                color:
                  activeSection === section.id ? "white" : "text.secondary",
                border: "2px solid",
                borderColor:
                  activeSection === section.id ? "primary.main" : "transparent",
                "&:hover": {
                  bgcolor:
                    activeSection === section.id
                      ? "primary.dark"
                      : "primary.light",
                  color:
                    activeSection === section.id ? "white" : "primary.main",
                  borderColor: "primary.main",
                },
                transition: "all 0.3s ease",
              }}
            >
              {section.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Paper>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {activeSection ? (
          sections.find((s) => s.id === activeSection)?.component
        ) : (
          <WelcomeScreen />
        )}
      </Box>
    </Box>
  );
}

function WelcomeScreen() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        p: 4,
      }}
    >
      <Box>
        <Box
          sx={{
            fontSize: 64,
            color: "primary.main",
            mb: 2,
          }}
        >
          🏥
        </Box>
        <Box
          component="h1"
          sx={{
            fontSize: "2rem",
            fontWeight: 700,
            mb: 2,
            background: "linear-gradient(135deg, #dc2626 0%, #2563eb 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          دستیار پزشکی هوشمند
        </Box>
        <Box
          component="p"
          sx={{
            color: "text.secondary",
            fontSize: "1.1rem",
            mb: 4,
            maxWidth: 400,
          }}
        >
          برای شروع، یکی از بخش‌های کناری را انتخاب کنید
        </Box>
      </Box>
    </Box>
  );
}
