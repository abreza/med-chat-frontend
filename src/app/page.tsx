"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ChatIcon from "@mui/icons-material/Chat";
import FolderIcon from "@mui/icons-material/Folder";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      title: "گفتگوی پزشکی هوشمند",
      description: "با کمک هوش مصنوعی، سوالات پزشکی خود را مطرح کنید",
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      path: "/chat",
      color: "primary.main",
    },
    {
      title: "تجزیه و تحلیل فایل‌های پزشکی",
      description: "فایل‌های پزشکی خود را آپلود کرده و تحلیل دقیق دریافت کنید",
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      path: "/files",
      color: "secondary.main",
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: "linear-gradient(45deg, #1976d2, #42a5f5)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            سکو ملی هوش مصنوعی
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            سامانه هوشمند تشخیص و مشاوره پزشکی
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                دقت بالا
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ChatIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                بهبود کارایی با استفاده از مدل‌های سبک زبانی
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, p: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 5 }} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    borderColor: feature.color,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: `${feature.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => router.push(feature.path)}
                    sx={{
                      bgcolor: feature.color,
                      "&:hover": {
                        bgcolor: feature.color,
                        filter: "brightness(0.9)",
                      },
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    شروع کنید
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
