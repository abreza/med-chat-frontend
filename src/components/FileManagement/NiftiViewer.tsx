/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as ResetIcon,
  Info as InfoIcon,
  Navigation as OrientationIcon,
} from "@mui/icons-material";
import { FileItem } from "./types";
import { NiftiLoader, NiftiData } from "@/utils/niftiUtils";

interface NiftiViewerProps {
  open: boolean;
  onClose: () => void;
  file: FileItem;
}

interface ViewerState {
  currentSlice: number;
  orientation: "axial" | "sagittal" | "coronal";
  zoom: number;
  panX: number;
  panY: number;
  windowWidth: number;
  windowLevel: number;
  brightness: number;
  contrast: number;
}

interface CanvasPosition {
  x: number;
  y: number;
}

export default function NiftiViewer({ open, onClose, file }: NiftiViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [niftiData, setNiftiData] = useState<NiftiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<CanvasPosition>({
    x: 0,
    y: 0,
  });

  const [viewerState, setViewerState] = useState<ViewerState>({
    currentSlice: 0,
    orientation: "axial",
    zoom: 1,
    panX: 0,
    panY: 0,
    windowWidth: 200,
    windowLevel: 100,
    brightness: 0,
    contrast: 1,
  });

  const getFileUrl = (file: FileItem): string => {
    const fileNameMap: Record<string, string> = {
      nifti1: "000007_03_01.nii.gz",
      nifti2: "000016_01_01.nii.gz",
    };

    const fileName = fileNameMap[file.id] || file.name;
    return `/${fileName}`;
  };

  const maxSliceForOrientation = useMemo(() => {
    if (!niftiData) return 1;
    const { dims } = niftiData;
    switch (viewerState.orientation) {
      case "axial":
        return dims[2];
      case "sagittal":
        return dims[0];
      case "coronal":
        return dims[1];
      default:
        return dims[2];
    }
  }, [niftiData, viewerState.orientation]);

  const sliceDimensions = useMemo((): [number, number] => {
    if (!niftiData) return [256, 256];
    const { dims } = niftiData;
    switch (viewerState.orientation) {
      case "axial":
        return [dims[0], dims[1]];
      case "sagittal":
        return [dims[1], dims[2]];
      case "coronal":
        return [dims[0], dims[2]];
      default:
        return [dims[0], dims[1]];
    }
  }, [niftiData, viewerState.orientation]);

  useEffect(() => {
    if (open && file.category === "nifti") {
      loadNiftiFile();
    }
  }, [open, file]);

  useEffect(() => {
    if (niftiData) {
      const maxSlice = maxSliceForOrientation - 1;
      setViewerState((prev) => ({
        ...prev,
        currentSlice: Math.min(prev.currentSlice, Math.floor(maxSlice / 2)),
        zoom: 1,
        panX: 0,
        panY: 0,
      }));
    }
  }, [niftiData, maxSliceForOrientation]);

  const loadNiftiFile = async () => {
    setLoading(true);
    setError(null);

    try {
      const fileUrl = getFileUrl(file);
      console.log(`Loading NIfTI file from: ${fileUrl}`);

      const data = await NiftiLoader.loadNiftiFile(fileUrl);
      setNiftiData(data);

      console.log("NIfTI file loaded successfully:", {
        dimensions: data.dims,
        pixelDimensions: data.pixdims,
        dataType: typeof data.typedData,
        totalVoxels: data.typedData.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطا در بارگذاری فایل NIfTI";
      setError(errorMessage);
      console.error("Error loading NIfTI file:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyImageAdjustments = useCallback(
    (data: Uint8ClampedArray): Uint8ClampedArray => {
      const adjusted = new Uint8ClampedArray(data.length);

      for (let i = 0; i < data.length; i++) {
        let value = data[i];

        const minValue = viewerState.windowLevel - viewerState.windowWidth / 2;
        const maxValue = viewerState.windowLevel + viewerState.windowWidth / 2;

        if (value <= minValue) {
          value = 0;
        } else if (value >= maxValue) {
          value = 255;
        } else {
          value = ((value - minValue) / viewerState.windowWidth) * 255;
        }

        value =
          (value - 128) * viewerState.contrast + 128 + viewerState.brightness;

        adjusted[i] = Math.max(0, Math.min(255, Math.round(value)));
      }

      return adjusted;
    },
    [
      viewerState.windowWidth,
      viewerState.windowLevel,
      viewerState.brightness,
      viewerState.contrast,
    ]
  );

  const drawOverlayInfo = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(10, 10, 250, 100);

      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(
        `Slice: ${viewerState.currentSlice + 1}/${maxSliceForOrientation}`,
        20,
        30
      );
      ctx.fillText(`Orientation: ${viewerState.orientation}`, 20, 45);
      ctx.fillText(`Zoom: ${(viewerState.zoom * 100).toFixed(0)}%`, 20, 60);
      ctx.fillText(
        `W/L: ${viewerState.windowWidth}/${viewerState.windowLevel}`,
        20,
        75
      );
      ctx.fillText(`Size: ${width} × ${height}`, 20, 90);
    },
    [
      viewerState.currentSlice,
      viewerState.orientation,
      viewerState.zoom,
      viewerState.windowWidth,
      viewerState.windowLevel,
      maxSliceForOrientation,
    ]
  );

  const renderSlice = useCallback(() => {
    if (!niftiData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      if (
        viewerState.currentSlice < 0 ||
        viewerState.currentSlice >= maxSliceForOrientation
      ) {
        console.warn(`Invalid slice index: ${viewerState.currentSlice}`);
        return;
      }

      const sliceData = NiftiLoader.getSliceData(
        niftiData,
        viewerState.currentSlice,
        viewerState.orientation
      );

      const normalizedData = NiftiLoader.normalizeIntensity(sliceData);

      const adjustedData = applyImageAdjustments(normalizedData);

      const [width, height] = sliceDimensions;

      canvas.width = width;
      canvas.height = height;

      const imageData = ctx.createImageData(width, height);
      for (let i = 0; i < adjustedData.length; i++) {
        const pixelIndex = i * 4;
        const value = adjustedData[i];
        imageData.data[pixelIndex] = value;
        imageData.data[pixelIndex + 1] = value;
        imageData.data[pixelIndex + 2] = value;
        imageData.data[pixelIndex + 3] = 255;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.translate(centerX + viewerState.panX, centerY + viewerState.panY);
      ctx.scale(viewerState.zoom, viewerState.zoom);
      ctx.translate(-centerX, -centerY);

      ctx.putImageData(imageData, 0, 0);
      ctx.restore();

      drawOverlayInfo(ctx, width, height);
    } catch (err) {
      console.error("Error rendering slice:", err);
      setError("خطا در نمایش تصویر");
    }
  }, [
    niftiData,
    viewerState,
    maxSliceForOrientation,
    sliceDimensions,
    applyImageAdjustments,
    drawOverlayInfo,
  ]);

  useEffect(() => {
    if (niftiData) {
      renderSlice();
    }
  }, [renderSlice]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPanPoint({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastPanPoint.x;
    const deltaY = event.clientY - lastPanPoint.y;

    setViewerState((prev) => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
    }));

    setLastPanPoint({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    if (event.ctrlKey) {
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      setViewerState((prev) => ({
        ...prev,
        zoom: Math.max(0.1, Math.min(5, prev.zoom * zoomFactor)),
      }));
    } else {
      const direction = event.deltaY > 0 ? 1 : -1;
      const maxSlice = maxSliceForOrientation - 1;
      setViewerState((prev) => ({
        ...prev,
        currentSlice: Math.max(
          0,
          Math.min(maxSlice, prev.currentSlice + direction)
        ),
      }));
    }
  };

  const resetView = () => {
    setViewerState((prev) => ({
      ...prev,
      zoom: 1,
      panX: 0,
      panY: 0,
    }));
  };

  const handleSliceChange = (value: number | number[]) => {
    setViewerState((prev) => ({
      ...prev,
      currentSlice: Array.isArray(value) ? value[0] : value,
    }));
  };

  const handleOrientationChange = (
    orientation: "axial" | "sagittal" | "coronal"
  ) => {
    setViewerState((prev) => ({
      ...prev,
      orientation,
      currentSlice: 0,
      zoom: 1,
      panX: 0,
      panY: 0,
    }));
  };

  const orientationLabels = {
    axial: "محوری (Axial)",
    sagittal: "کناری (Sagittal)",
    coronal: "جبهه‌ای (Coronal)",
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>در حال بارگذاری فایل NIfTI...</Typography>
            <Typography variant="caption" color="text.secondary">
              {getFileUrl(file)}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>خطا در بارگذاری</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography>
            امکان نمایش فایل NIfTI وجود ندارد. لطفاً فایل را بررسی کرده و دوباره
            تلاش کنید.
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            مسیر فایل: {getFileUrl(file)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>بستن</Button>
          <Button onClick={loadNiftiFile} variant="contained">
            تلاش مجدد
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: "90vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6">{file.name}</Typography>
          <Chip
            label="NIfTI Viewer"
            color="secondary"
            size="small"
            icon={<OrientationIcon />}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="اطلاعات فایل">
            <IconButton onClick={() => setShowMetadata(!showMetadata)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", height: "100%", p: 2, gap: 2 }}>
        {/* Controls Panel */}
        <Paper
          sx={{
            width: 300,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Orientation Selection */}
          <FormControl fullWidth size="small">
            <InputLabel>جهت نمایش</InputLabel>
            <Select
              value={viewerState.orientation}
              onChange={(e) => handleOrientationChange(e.target.value as any)}
              label="جهت نمایش"
            >
              <MenuItem value="axial">{orientationLabels.axial}</MenuItem>
              <MenuItem value="sagittal">{orientationLabels.sagittal}</MenuItem>
              <MenuItem value="coronal">{orientationLabels.coronal}</MenuItem>
            </Select>
          </FormControl>

          {/* Slice Navigation */}
          <Box>
            <Typography gutterBottom>
              برش: {viewerState.currentSlice + 1} / {maxSliceForOrientation}
            </Typography>
            <Slider
              value={viewerState.currentSlice}
              min={0}
              max={maxSliceForOrientation - 1}
              onChange={(_, value) => handleSliceChange(value)}
              valueLabelDisplay="auto"
            />
          </Box>

          <Divider />

          {/* Zoom Controls */}
          <Box>
            <Typography gutterBottom>
              بزرگ‌نمایی: {(viewerState.zoom * 100).toFixed(0)}%
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() =>
                  setViewerState((prev) => ({
                    ...prev,
                    zoom: Math.max(0.1, prev.zoom * 0.9),
                  }))
                }
              >
                <ZoomOutIcon />
              </IconButton>
              <Slider
                value={viewerState.zoom}
                min={0.1}
                max={5}
                step={0.1}
                onChange={(_, value) =>
                  setViewerState((prev) => ({
                    ...prev,
                    zoom: Array.isArray(value) ? value[0] : value,
                  }))
                }
                sx={{ flex: 1 }}
              />
              <IconButton
                onClick={() =>
                  setViewerState((prev) => ({
                    ...prev,
                    zoom: Math.min(5, prev.zoom * 1.1),
                  }))
                }
              >
                <ZoomInIcon />
              </IconButton>
              <IconButton onClick={resetView}>
                <ResetIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Window/Level Controls */}
          <Box>
            <Typography gutterBottom>
              عرض پنجره: {viewerState.windowWidth}
            </Typography>
            <Slider
              value={viewerState.windowWidth}
              min={1}
              max={500}
              onChange={(_, value) =>
                setViewerState((prev) => ({
                  ...prev,
                  windowWidth: Array.isArray(value) ? value[0] : value,
                }))
              }
            />
          </Box>

          <Box>
            <Typography gutterBottom>
              سطح پنجره: {viewerState.windowLevel}
            </Typography>
            <Slider
              value={viewerState.windowLevel}
              min={0}
              max={255}
              onChange={(_, value) =>
                setViewerState((prev) => ({
                  ...prev,
                  windowLevel: Array.isArray(value) ? value[0] : value,
                }))
              }
            />
          </Box>

          {/* Brightness/Contrast */}
          <Box>
            <Typography gutterBottom>
              روشنایی: {viewerState.brightness}
            </Typography>
            <Slider
              value={viewerState.brightness}
              min={-100}
              max={100}
              onChange={(_, value) =>
                setViewerState((prev) => ({
                  ...prev,
                  brightness: Array.isArray(value) ? value[0] : value,
                }))
              }
            />
          </Box>

          <Box>
            <Typography gutterBottom>
              کنتراست: {viewerState.contrast.toFixed(1)}
            </Typography>
            <Slider
              value={viewerState.contrast}
              min={0.1}
              max={3}
              step={0.1}
              onChange={(_, value) =>
                setViewerState((prev) => ({
                  ...prev,
                  contrast: Array.isArray(value) ? value[0] : value,
                }))
              }
            />
          </Box>

          {/* File Information */}
          {niftiData && (
            <Card variant="outlined">
              <CardContent sx={{ p: 1.5 }}>
                <Typography variant="subtitle2" gutterBottom>
                  اطلاعات فایل
                </Typography>
                <Typography variant="caption" display="block">
                  ابعاد: {niftiData.dims.join(" × ")}
                </Typography>
                <Typography variant="caption" display="block">
                  فاصله پیکسل:{" "}
                  {niftiData.pixdims.map((p) => p.toFixed(2)).join(" × ")}
                </Typography>
                <Typography variant="caption" display="block">
                  نوع داده: {niftiData.typedData.constructor.name}
                </Typography>
                <Typography variant="caption" display="block">
                  حجم کل: {niftiData.typedData.length.toLocaleString()} وکسل
                </Typography>
                {file.metadata?.patientInfo && showMetadata && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block">
                      سن: {file.metadata.patientInfo.age}
                    </Typography>
                    <Typography variant="caption" display="block">
                      جنسیت: {file.metadata.patientInfo.sex}
                    </Typography>
                    <Typography variant="caption" display="block">
                      توضیحات: {file.metadata.patientInfo.studyDescription}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Paper>

        {/* Image Display */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "black",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {niftiData ? (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          ) : (
            <Typography color="white">در حال بارگذاری تصویر...</Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mr: "auto" }}
        >
          راهنما: Ctrl + چرخ ماوس برای زوم، چرخ ماوس برای تغییر برش، کلیک و
          کشیدن برای حرکت
        </Typography>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}
