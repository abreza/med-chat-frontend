"use client";

import React from "react";
import { IconButton, Paper, Tooltip } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import ChatIcon from "@mui/icons-material/Chat";
import FolderIcon from "@mui/icons-material/Folder";
import HomeIcon from "@mui/icons-material/Home";

const navigationItems = [
  {
    id: "home",
    path: "/",
    icon: <HomeIcon />,
    title: "خانه",
  },
  {
    id: "chat",
    path: "/chat",
    icon: <ChatIcon />,
    title: "گفتگو",
  },
  {
    id: "files",
    path: "/files",
    icon: <FolderIcon />,
    title: "تعامل با فایل",
  },
];

export default function NavigationSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
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
      {navigationItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Tooltip key={item.id} title={item.title} placement="right">
            <IconButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                mb: 2,
                width: 56,
                height: 56,
                bgcolor: isActive ? "primary.main" : "transparent",
                color: isActive ? "white" : "text.secondary",
                border: "2px solid",
                borderColor: isActive ? "primary.main" : "transparent",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "primary.light",
                  color: isActive ? "white" : "primary.main",
                  borderColor: "primary.main",
                },
                transition: "all 0.3s ease",
              }}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        );
      })}
    </Paper>
  );
}
