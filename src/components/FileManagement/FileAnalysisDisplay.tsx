import React from "react";
import {
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Summarize as SummaryIcon,
  Psychology as AnalyzeIcon,
  QuestionAnswer as QuestionIcon,
} from "@mui/icons-material";
import { FileAnalysis } from "./types";

interface FileAnalysisDisplayProps {
  analysis: FileAnalysis;
  onQuestionSelect?: (question: string) => void;
}

export default function FileAnalysisDisplay({
  analysis,
  onQuestionSelect,
}: FileAnalysisDisplayProps) {
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Divider sx={{ mb: 2 }} />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SummaryIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="subtitle2">خلاصه تحلیل</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">{analysis.summary}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AnalyzeIcon sx={{ mr: 1, color: "success.main" }} />
            <Typography variant="subtitle2">یافته‌های کلیدی</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {analysis.keyFindings.map((finding, index) => (
              <Chip
                key={index}
                label={finding}
                size="small"
                variant="outlined"
                color="success"
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <QuestionIcon sx={{ mr: 1, color: "warning.main" }} />
            <Typography variant="subtitle2">سوالات پیشنهادی</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {analysis.questions.map((q, index) => (
              <ListItem
                key={index}
                onClick={() => onQuestionSelect?.(q)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "warning.light" },
                }}
              >
                <ListItemText
                  primary={q}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
