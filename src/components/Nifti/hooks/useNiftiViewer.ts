/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { NiftiLoader, NiftiData } from "../utils/niftiLoader";
import { FileItem } from "@/components/FileManagement/types";
import {
  ViewerState,
  SegmentationState,
  AnnotationState,
  SnackbarState,
  UseNiftiViewerResult,
} from "./nifti-viewer-types";
import { useNiftiRenderer } from "./useNiftiRenderer";
import { useNiftiEvents } from "./useNiftiEvents";
import { useNiftiSegmentation } from "./useNiftiSegmentation";

export default function useNiftiViewer(
  open: boolean,
  file: FileItem
): UseNiftiViewerResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [niftiData, setNiftiData] = useState<NiftiData | null>(null);
  const [rawNiftiBuffer, setRawNiftiBuffer] = useState<ArrayBuffer | null>(
    null
  );
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

  const loadNiftiFile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRawNiftiBuffer(null);
    try {
      const url = getFileUrl(file);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to download NIfTI file: ${response.statusText}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      setRawNiftiBuffer(arrayBuffer);
      const data = NiftiLoader.parseNifti(arrayBuffer.slice(0));
      setNiftiData(data);
    } catch (e: any) {
      setError(e.message || "خطا در بارگذاری فایل NIfTI");
    } finally {
      setLoading(false);
    }
  }, [file, getFileUrl]);

  useEffect(() => {
    if (open && file.category === "nifti") loadNiftiFile();
  }, [open, file, loadNiftiFile]);

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
    if (!niftiData) return;
    setViewerState((prev) => ({
      ...prev,
      currentSlice: Math.min(prev.currentSlice, maxSliceForOrientation - 1),
    }));
  }, [niftiData, maxSliceForOrientation]);

  const { renderSlice } = useNiftiRenderer({
    canvasRef,
    offscreenCanvasRef,
    niftiData,
    viewerState,
    segmentationState,
    annotationState,
    originalSliceDimensions,
    sliceDimensions,
  });

  const {
    handleAnnotationMouseDown,
    handleAnnotationMouseMove,
    handleAnnotationMouseUp,
  } = useNiftiEvents({
    canvasRef,
    viewerState,
    setViewerState,
    annotationState,
    setAnnotationState,
    sliceDimensions,
    originalSliceDimensions,
    maxSliceForOrientation,
  });

  const { runOrganSegmentation, runAnnotationSegmentation } =
    useNiftiSegmentation({
      rawNiftiBuffer,
      file,
      viewerState,
      annotationState,
      setSegmentationState,
      setSnackbar,
      originalSliceDimensions,
    });

  useEffect(renderSlice, [renderSlice]);

  const resetView = () =>
    setViewerState((v) => ({ ...v, zoom: 1, panX: 0, panY: 0, rotation: 0 }));
  const rotateView = () =>
    setViewerState((v) => ({ ...v, rotation: (v.rotation + 90) % 360 }));

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
    runOrganSegmentation,
    runAnnotationSegmentation,
    handleAnnotationMouseDown,
    handleAnnotationMouseMove,
    handleAnnotationMouseUp,
    resetView,
    rotateView,
  };
}
