import React from "react";
import {
  Paper,
  Typography,
  Slider,
  IconButton,
  Box,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Tune as TuneIcon,
  Rotate90DegreesCwOutlined as RotateIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { UseNiftiViewerResult } from "./hooks/useNiftiViewer";

type ViewConfigControlsProps = {
  nifti: UseNiftiViewerResult;
};

export default function ViewConfigControls({ nifti }: ViewConfigControlsProps) {
  const [isMinimized, setIsMinimized] = React.useState(false);

  const {
    viewerState,
    setViewerState,
    resetView,
    rotateView,
    maxSliceForOrientation,
  } = nifti;

  const handleZoom = (factor: number) => {
    setViewerState((v) => ({
      ...v,
      zoom: Math.max(0.1, Math.min(5, v.zoom * factor)),
    }));
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(40, 40, 40, 0.85)",
        color: "#fff",
        backdropFilter: "blur(4px)",
        width: isMinimized ? "auto" : 280,
        borderRadius: 2,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: isMinimized ? 0 : 1.5,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          تنظیمات نمایش
        </Typography>
        <Tooltip title={isMinimized ? "نمایش کنترل‌ها" : "پنهان کردن کنترل‌ها"}>
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setIsMinimized((prev) => !prev)}
            sx={{ mr: -1, ml: 1 }}
          >
            {isMinimized ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {!isMinimized && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box>
            <Typography
              variant="caption"
              display="block"
              id="slice-slider-label"
              gutterBottom
            >
              برش: {viewerState.currentSlice + 1} / {maxSliceForOrientation}
            </Typography>
            <Slider
              size="small"
              value={viewerState.currentSlice}
              min={0}
              max={maxSliceForOrientation - 1}
              onChange={(_, v) =>
                setViewerState((s) => ({
                  ...s,
                  currentSlice: Array.isArray(v) ? v[0] : v,
                }))
              }
              aria-labelledby="slice-slider-label"
            />
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />

          <Box>
            <Typography
              variant="caption"
              display="block"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <TuneIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
              تنظیمات تصویر
            </Typography>

            <Typography variant="caption" display="block">
              عرض پنجره: {viewerState.windowWidth}
            </Typography>
            <Slider
              size="small"
              value={viewerState.windowWidth}
              min={1}
              max={500}
              onChange={(_, v) =>
                setViewerState((s) => ({
                  ...s,
                  windowWidth: Array.isArray(v) ? v[0] : v,
                }))
              }
            />

            <Typography variant="caption" display="block">
              سطح پنجره: {viewerState.windowLevel}
            </Typography>
            <Slider
              size="small"
              value={viewerState.windowLevel}
              min={0}
              max={255}
              onChange={(_, v) =>
                setViewerState((s) => ({
                  ...s,
                  windowLevel: Array.isArray(v) ? v[0] : v,
                }))
              }
            />

            <Typography variant="caption" display="block">
              روشنایی: {viewerState.brightness}
            </Typography>
            <Slider
              size="small"
              value={viewerState.brightness}
              min={-100}
              max={100}
              onChange={(_, v) =>
                setViewerState((s) => ({
                  ...s,
                  brightness: Array.isArray(v) ? v[0] : v,
                }))
              }
            />

            <Typography variant="caption" display="block">
              کنتراست: {viewerState.contrast.toFixed(1)}
            </Typography>
            <Slider
              size="small"
              value={viewerState.contrast}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(_, v) =>
                setViewerState((s) => ({
                  ...s,
                  contrast: Array.isArray(v) ? v[0] : v,
                }))
              }
            />
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="caption" sx={{ flexGrow: 1 }}>
              بزرگنمایی: {Math.round(viewerState.zoom * 100)}%
            </Typography>
            <Box>
              <Tooltip title="چرخش ساعت‌گرد">
                <IconButton color="inherit" size="small" onClick={rotateView}>
                  <RotateIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="بزرگنمایی">
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => handleZoom(1.1)}
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="کوچک‌نمایی">
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => handleZoom(0.9)}
                >
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="بازنشانی نمایش">
                <IconButton color="inherit" size="small" onClick={resetView}>
                  <ResetIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
