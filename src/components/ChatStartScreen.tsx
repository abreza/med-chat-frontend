import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Fade,
  Button,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

interface ChatStartScreenProps {
  onSuggestionClick?: (text: string) => void;
  suggestions?: Array<{
    text: string;
    category?: string;
  }>;
}

const defaultSuggestions = [
  {
    icon: <LocalHospitalIcon />,
    title: "سوالات پزشکی",
    description: "درباره بیماری‌ها و درمان‌ها بپرسید",
    color: "#dc2626",
    sampleQuestions: [
      "علت سردرد مداوم چیست؟",
      "درمان فشار خون بالا چگونه است؟",
      "عوارض دیابت کدامند؟",
    ],
  },
  {
    icon: <MedicalServicesIcon />,
    title: "تشخیص علائم",
    description: "علائم خود را شرح دهید",
    color: "#2563eb",
    sampleQuestions: [
      "درد قفسه سینه چه معنایی دارد؟",
      "تب و سرگیجه نشانه چیست؟",
      "خستگی مداوم علت چیست؟",
    ],
  },
  {
    icon: <HealthAndSafetyIcon />,
    title: "اطلاعات دارو",
    description: "درباره داروها و عوارض آنها",
    color: "#16a34a",
    sampleQuestions: [
      "عوارض جانبی آیبوپروفن چیست؟",
      "تداخل داروهای فشار خون",
      "زمان مصرف آنتی‌بیوتیک",
    ],
  },
  {
    icon: <MonitorHeartIcon />,
    title: "مشاوره سلامت",
    description: "راهنمایی برای سلامتی بهتر",
    color: "#ca8a04",
    sampleQuestions: [
      "رژیم غذایی سالم چگونه باشد؟",
      "چگونه وزن کم کنم؟",
      "ورزش مناسب برای مفاصل",
    ],
  },
];

export default function ChatStartScreen({
  onSuggestionClick,
  suggestions = [],
}: ChatStartScreenProps) {
  const handleQuestionClick = (question: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(question);
    }
  };

  const handleCategoryClick = (category: (typeof defaultSuggestions)[0]) => {
    // Select a random question from the category
    const randomQuestion =
      category.sampleQuestions[
        Math.floor(Math.random() * category.sampleQuestions.length)
      ];
    handleQuestionClick(randomQuestion);
  };

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: "linear-gradient(135deg, #dc2626 0%, #2563eb 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          دستیار پزشکی سکو هوش مصنوعی
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600 }}
        >
          من اینجا هستم تا به سوالات پزشکی شما پاسخ دهم، در تشخیص علائم کمک کنم
          و اطلاعات مفیدی درباره سلامتی ارائه دهم. لطفاً سوال خود را مطرح کنید.
        </Typography>

        <Grid container spacing={2} sx={{ maxWidth: 800, mb: 4 }}>
          {defaultSuggestions.map((suggestion, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Fade
                in
                timeout={800}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    },
                    border: "1px solid",
                    borderColor: "grey.200",
                    bgcolor: "background.paper",
                  }}
                  onClick={() => handleCategoryClick(suggestion)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: suggestion.color,
                          width: 32,
                          height: 32,
                          mr: 2,
                        }}
                      >
                        {React.cloneElement(suggestion.icon, {
                          sx: { fontSize: "1.2rem" },
                        })}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {suggestion.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {suggestion.description}
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {suggestion.sampleQuestions
                        .slice(0, 2)
                        .map((question, qIndex) => (
                          <Button
                            key={qIndex}
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuestionClick(question);
                            }}
                            sx={{
                              textAlign: "right",
                              justifyContent: "flex-start",
                              fontSize: "0.75rem",
                              py: 0.5,
                              borderColor: "grey.300",
                              "&:hover": {
                                borderColor: suggestion.color,
                                color: suggestion.color,
                              },
                            }}
                          >
                            {question}
                          </Button>
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {suggestions.length > 0 && (
          <Box sx={{ width: "100%", maxWidth: 600 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              سوالات پیشنهادی
            </Typography>
            <Grid container spacing={1}>
              {suggestions.map((suggestion, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleQuestionClick(suggestion.text)}
                    sx={{
                      textAlign: "right",
                      justifyContent: "flex-start",
                      py: 1.5,
                      borderColor: "grey.300",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "primary.light",
                      },
                    }}
                  >
                    {suggestion.text}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Fade>
  );
}
