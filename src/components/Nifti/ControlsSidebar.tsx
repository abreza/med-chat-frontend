import React from "react";
import {
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Segment as SegmentIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  BrushOutlined as BrushIcon,
  PlayArrow as RunIcon,
} from "@mui/icons-material";
import { UseNiftiViewerResult } from "./hooks/useNiftiViewer";
import HighlightAlt from "@mui/icons-material/HighlightAlt";

const AVAILABLE_ORGANS = [
  "liver",
  "spleen",
  "kidney_right",
  "kidney_left",
  "gallbladder",
  "stomach",
  "pancreas",
];

type ControlsSidebarProps = { nifti: UseNiftiViewerResult };

export default function ControlsSidebar({ nifti }: ControlsSidebarProps) {
  const {
    segmentationState,
    setSegmentationState,
    annotationState,
    setAnnotationState,
    runOrganSegmentation,
    runAnnotationSegmentation,
  } = nifti;

  return (
    <Paper
      sx={{
        width: 350,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxHeight: "100%",
        overflow: "auto",
      }}
    >
      {/* ───── Segmentation ───── */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <SegmentIcon sx={{ mr: 1 }} />
            سگمنتیشن
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle2" gutterBottom>
            سگمنتیشن ارگان‌ها (MONAI)
          </Typography>
          <Button
            variant="contained"
            fullWidth
            startIcon={<SegmentIcon />}
            disabled={segmentationState.isSegmenting}
            onClick={runOrganSegmentation}
          >
            اجرای سگمنتیشن ارگان‌ها
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            ابزار سگمنت با کمک انسان
          </Typography>
          <ToggleButtonGroup
            value={annotationState.tool}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) =>
              setAnnotationState((s) => ({ ...s, tool: v || "none" }))
            }
          >
            <ToggleButton value="none">هیچ</ToggleButton>
            <ToggleButton value="box">
              <HighlightAlt sx={{ mr: 0.5 }} />
              Box
            </ToggleButton>
            <ToggleButton value="brush">
              <BrushIcon sx={{ mr: 0.5 }} />
              Brush
            </ToggleButton>
          </ToggleButtonGroup>

          {annotationState.tool !== "none" && (
            <Button
              sx={{ mt: 1 }}
              variant="contained"
              fullWidth
              startIcon={<RunIcon />}
              disabled={segmentationState.isSegmenting}
              onClick={runAnnotationSegmentation}
            >
              اجرای MedSAM2
            </Button>
          )}

          {segmentationState.isSegmenting && (
            <LinearProgress
              sx={{ mt: 2 }}
              variant="determinate"
              value={segmentationState.segmentationProgress}
            />
          )}

          {segmentationState.organMasks && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                نمایش ارگان‌ها
              </Typography>
              <IconButton
                size="small"
                sx={{ mb: 1 }}
                onClick={() =>
                  setSegmentationState((s) => ({
                    ...s,
                    showOrgans: !s.showOrgans,
                  }))
                }
              >
                {segmentationState.showOrgans ? (
                  <VisibilityIcon />
                ) : (
                  <VisibilityOffIcon />
                )}
              </IconButton>
              <List dense>
                {AVAILABLE_ORGANS.map((o) => (
                  <ListItem key={o} dense>
                    <ListItemIcon>
                      <Checkbox
                        size="small"
                        checked={segmentationState.selectedOrgans.includes(o)}
                        onChange={(e) => {
                          setSegmentationState((s) => ({
                            ...s,
                            selectedOrgans: e.target.checked
                              ? [...s.selectedOrgans, o]
                              : s.selectedOrgans.filter((x) => x !== o),
                          }));
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={o}
                      primaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
