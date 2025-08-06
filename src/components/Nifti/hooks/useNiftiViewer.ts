/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { NiftiLoader, NiftiData } from "../utils/niftiLoader";
import { FileItem } from "@/components/FileManagement/types";

export interface ViewerState {
  currentSlice: number;
  orientation: "axial" | "sagittal" | "coronal";
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  windowWidth: number;
  windowLevel: number;
  brightness: number;
  contrast: number;
  rotation: number;
}

export interface SegmentationState {
  isSegmenting: boolean;
  segmentationProgress: number;
  segmentationStatus: string;
  organMasks: Record<string, string> | null;
  annotationMasks: Record<string, string> | null;
  selectedOrgans: string[];
  showOrgans: boolean;
  showAnnotations: boolean;
}

export interface AnnotationState {
  tool: "none" | "box" | "brush";
  isDrawing: boolean;
  boundingBox: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  } | null;
  brushStrokes: { x: number; y: number }[][];
  showAnnotations: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
}

export interface UseNiftiViewerResult {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  niftiData: NiftiData | null;
  viewerState: ViewerState;
  setViewerState: React.Dispatch<React.SetStateAction<ViewerState>>;
  segmentationState: SegmentationState;
  setSegmentationState: React.Dispatch<React.SetStateAction<SegmentationState>>;
  annotationState: AnnotationState;
  setAnnotationState: React.Dispatch<React.SetStateAction<AnnotationState>>;
  snackbar: SnackbarState;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
  error: string | null;
  loading: boolean;
  maxSliceForOrientation: number;
  sliceDimensions: [number, number];
  renderSlice: () => void;
  loadNiftiFile: () => Promise<void>;
  runOrganSegmentation: () => Promise<void>;
  runAnnotationSegmentation: () => Promise<void>;
  handleAnnotationMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleAnnotationMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleAnnotationMouseUp: () => void;
  handleWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  resetView: () => void;
  rotateView: () => void;
}

export default function useNiftiViewer(
  open: boolean,
  file: FileItem
): UseNiftiViewerResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [niftiData, setNiftiData] = useState<NiftiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewerState, setViewerState] = useState<ViewerState>({
    currentSlice: 0,
    orientation: "axial",
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    windowWidth: 200,
    windowLevel: 100,
    brightness: 0,
    contrast: 1,
    rotation: 0,
  });

  const [segmentationState, setSegmentationState] = useState<SegmentationState>(
    {
      isSegmenting: false,
      segmentationProgress: 0,
      segmentationStatus: "",
      organMasks: null,
      annotationMasks: null,
      selectedOrgans: ["liver", "spleen"],
      showOrgans: true,
      showAnnotations: true,
    }
  );

  const [annotationState, setAnnotationState] = useState<AnnotationState>({
    tool: "none",
    isDrawing: false,
    boundingBox: null,
    brushStrokes: [],
    showAnnotations: true,
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const getFileUrl = useCallback((f: FileItem): string => {
    const map: Record<string, string> = {
      nifti1: "000007_03_01.nii.gz",
      nifti2: "000016_01_01.nii.gz",
    };
    return `/${map[f.id] ?? f.name}`;
  }, []);

  const maxSliceForOrientation = useMemo(() => {
    if (!niftiData) return 1;
    return niftiData.dims[2];
  }, [niftiData]);

  const originalSliceDimensions = useMemo<[number, number]>(() => {
    if (!niftiData) return [256, 256];
    const [w, h] = niftiData.dims;
    return [w, h];
  }, [niftiData]);

  const sliceDimensions = useMemo<[number, number]>(() => {
    const [w, h] = originalSliceDimensions;
    if (viewerState.rotation === 90 || viewerState.rotation === 270) {
      return [h, w];
    }
    return [w, h];
  }, [originalSliceDimensions, viewerState.rotation]);

  useEffect(() => {
    if (open && file.category === "nifti") loadNiftiFile();
  }, [open, file]);

  useEffect(() => {
    if (!niftiData) return;
    setViewerState((prev) => ({
      ...prev,
      currentSlice: Math.min(prev.currentSlice, maxSliceForOrientation - 1),
    }));
  }, [niftiData, maxSliceForOrientation]);

  const loadNiftiFile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = getFileUrl(file);
      const data = await NiftiLoader.loadNiftiFile(url);
      setNiftiData(data);
    } catch (e: any) {
      setError(e.message || "خطا در بارگذاری فایل NIfTI");
    } finally {
      setLoading(false);
    }
  }, [file, getFileUrl]);

  const applyImageAdjustments = useCallback(
    (data: Uint8ClampedArray): Uint8ClampedArray => {
      const out = new Uint8ClampedArray(data.length);
      const {
        windowWidth: ww,
        windowLevel: wl,
        brightness,
        contrast,
      } = viewerState;
      const minVal = wl - ww / 2;
      const maxVal = wl + ww / 2;
      for (let i = 0; i < data.length; i++) {
        let v = data[i];
        if (v <= minVal) v = 0;
        else if (v >= maxVal) v = 255;
        else v = ((v - minVal) / ww) * 255;
        v = (v - 128) * contrast + 128 + brightness;
        out[i] = Math.max(0, Math.min(255, Math.round(v)));
      }
      return out;
    },
    [viewerState]
  );

  const drawAnnotations = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!annotationState.showAnnotations) return;

      if (annotationState.boundingBox) {
        const { xmin, ymin, xmax, ymax } = annotationState.boundingBox;
        ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        ctx.lineWidth = 2 / viewerState.zoom;
        ctx.strokeRect(
          Math.min(xmin, xmax),
          Math.min(ymin, ymax),
          Math.abs(xmax - xmin),
          Math.abs(ymax - ymin)
        );
      }

      if (annotationState.brushStrokes.length > 0) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        ctx.lineWidth = 5 / viewerState.zoom;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        annotationState.brushStrokes.forEach((path) => {
          if (path.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.stroke();
        });
      }
    },
    [annotationState, viewerState.zoom]
  );

  const drawOverlayInfo = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(10, 10, 180, 50);
      ctx.fillStyle = "#fff";
      ctx.font = "12px sans-serif";
      ctx.fillText(
        `W/L: ${viewerState.windowWidth}/${viewerState.windowLevel}`,
        20,
        28
      );
      ctx.fillText(`Tool: ${annotationState.tool}`, 20, 44);
    },
    [viewerState.windowWidth, viewerState.windowLevel, annotationState.tool]
  );

  const renderSlice = useCallback(() => {
    if (!niftiData || !canvasRef.current) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    const mainCanvas = canvasRef.current;
    const mainCtx = mainCanvas.getContext("2d");

    if (!mainCtx || !offscreenCtx) return;

    const [originalW, originalH] = originalSliceDimensions;
    const [displayW, displayH] = sliceDimensions;

    try {
      const sliceData = NiftiLoader.getSliceData(
        niftiData,
        viewerState.currentSlice,
        "axial"
      );
      const normalized = NiftiLoader.normalizeIntensity(sliceData);
      const adjusted = applyImageAdjustments(normalized);

      offscreenCanvas.width = originalW;
      offscreenCanvas.height = originalH;
      const imgData = offscreenCtx.createImageData(originalW, originalH);
      for (let i = 0; i < adjusted.length; i++) {
        const p = i * 4;
        imgData.data[p] =
          imgData.data[p + 1] =
          imgData.data[p + 2] =
            adjusted[i];
        imgData.data[p + 3] = 255;
      }
      offscreenCtx.putImageData(imgData, 0, 0);

      mainCanvas.width = displayW;
      mainCanvas.height = displayH;
      mainCtx.fillStyle = "black";
      mainCtx.fillRect(0, 0, displayW, displayH);

      mainCtx.save();
      mainCtx.translate(
        displayW / 2 + viewerState.panX,
        displayH / 2 + viewerState.panY
      );
      mainCtx.scale(viewerState.zoom, viewerState.zoom);
      mainCtx.rotate((viewerState.rotation * Math.PI) / 180);
      mainCtx.translate(-originalW / 2, -originalH / 2);

      mainCtx.imageSmoothingEnabled = false;
      mainCtx.drawImage(offscreenCanvas, 0, 0);

      drawAnnotations(mainCtx);

      mainCtx.restore();
      drawOverlayInfo(mainCtx);
    } catch (e) {
      console.error("Error rendering slice:", e);
    }
  }, [
    niftiData,
    viewerState,
    sliceDimensions,
    originalSliceDimensions,
    applyImageAdjustments,
    drawAnnotations,
    drawOverlayInfo,
  ]);

  useEffect(renderSlice, [renderSlice]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const { panX, panY, zoom, rotation } = viewerState;
      const [originalW, originalH] = originalSliceDimensions;
      const [displayW, displayH] = sliceDimensions;

      const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

      let x = mouseX - displayW / 2 - panX;
      let y = mouseY - displayH / 2 - panY;
      x /= zoom;
      y /= zoom;
      const rotRad = (-rotation * Math.PI) / 180;
      const cos = Math.cos(rotRad);
      const sin = Math.sin(rotRad);
      const rotX = x * cos - y * sin;
      const rotY = x * sin + y * cos;
      return {
        x: rotX + originalW / 2,
        y: rotY + originalH / 2,
      };
    },
    [viewerState, sliceDimensions, originalSliceDimensions]
  );

  const lastPan = useRef({ x: 0, y: 0 });

  const handleAnnotationMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (annotationState.tool === "none") {
      setViewerState((v) => ({ ...v, isPanning: true }));
      lastPan.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const coords = getCanvasCoords(e);
    setAnnotationState((s) => ({ ...s, isDrawing: true }));

    if (annotationState.tool === "box") {
      setAnnotationState((s) => ({
        ...s,
        boundingBox: {
          xmin: coords.x,
          ymin: coords.y,
          xmax: coords.x,
          ymax: coords.y,
        },
      }));
    } else if (annotationState.tool === "brush") {
      setAnnotationState((s) => ({
        ...s,
        brushStrokes: [...s.brushStrokes, [coords]],
      }));
    }
  };

  const handleAnnotationMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (annotationState.tool === "none") {
      if (!viewerState.isPanning) return;
      setViewerState((v) => ({
        ...v,
        panX: v.panX + (e.clientX - lastPan.current.x),
        panY: v.panY + (e.clientY - lastPan.current.y),
      }));
      lastPan.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!annotationState.isDrawing) return;
    const coords = getCanvasCoords(e);

    if (annotationState.tool === "box" && annotationState.boundingBox) {
      setAnnotationState((s) => ({
        ...s,
        boundingBox: { ...s.boundingBox!, xmax: coords.x, ymax: coords.y },
      }));
    } else if (annotationState.tool === "brush") {
      setAnnotationState((s) => {
        const currentStrokes = s.brushStrokes.slice();
        const currentPath = currentStrokes[currentStrokes.length - 1].slice();
        currentPath.push(coords);
        currentStrokes[currentStrokes.length - 1] = currentPath;
        return { ...s, brushStrokes: currentStrokes };
      });
    }
  };

  const handleAnnotationMouseUp = () => {
    if (viewerState.isPanning) {
      setViewerState((v) => ({ ...v, isPanning: false }));
    }
    setAnnotationState((s) => ({ ...s, isDrawing: false }));
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.ctrlKey) {
      setViewerState((v) => ({
        ...v,
        zoom: Math.max(0.1, Math.min(5, v.zoom * (e.deltaY > 0 ? 0.9 : 1.1))),
      }));
    } else {
      const dir = e.deltaY > 0 ? 1 : -1;
      setViewerState((v) => ({
        ...v,
        currentSlice: Math.max(
          0,
          Math.min(maxSliceForOrientation - 1, v.currentSlice + dir)
        ),
      }));
    }
  };

  const resetView = () =>
    setViewerState((v) => ({ ...v, zoom: 1, panX: 0, panY: 0, rotation: 0 }));

  const rotateView = () => {
    setViewerState((v) => ({ ...v, rotation: (v.rotation + 90) % 360 }));
  };

  const runOrganSegmentation = async () => {
    if (!niftiData) return;
    setSegmentationState((s) => ({
      ...s,
      isSegmenting: true,
      segmentationProgress: 0,
      segmentationStatus: "Preparing…",
    }));
    await new Promise((r) => setTimeout(r, 1000));
    setSegmentationState((s) => ({
      ...s,
      isSegmenting: false,
      segmentationProgress: 100,
      segmentationStatus: "Done",
      organMasks: {},
    }));
    setSnackbar({
      open: true,
      message: "سگمنتیشن ارگان‌ها با موفقیت انجام شد",
      severity: "success",
    });
  };

  const runAnnotationSegmentation = async () => {
    if (!niftiData) return;
    setSegmentationState((s) => ({
      ...s,
      isSegmenting: true,
      segmentationProgress: 0,
      segmentationStatus: "MedSAM2…",
    }));
    await new Promise((r) => setTimeout(r, 1000));
    setSegmentationState((s) => ({
      ...s,
      isSegmenting: false,
      segmentationProgress: 100,
      segmentationStatus: "Done",
      annotationMasks: {},
    }));
    setSnackbar({
      open: true,
      message: "سگمنتیشن annotation با موفقیت انجام شد",
      severity: "success",
    });
  };

  return {
    canvasRef,
    niftiData,
    viewerState,
    setViewerState,
    segmentationState,
    setSegmentationState,
    annotationState,
    setAnnotationState,
    snackbar,
    setSnackbar,
    error,
    loading,
    maxSliceForOrientation,
    sliceDimensions,
    renderSlice,
    loadNiftiFile,
    runOrganSegmentation,
    runAnnotationSegmentation,
    handleAnnotationMouseDown,
    handleAnnotationMouseMove,
    handleAnnotationMouseUp,
    handleWheel,
    resetView,
    rotateView,
  };
}
