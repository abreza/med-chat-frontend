import { FileItem } from "../FileManagement/types";

export interface NiftiViewerProps {
  open: boolean;
  onClose: () => void;
  file: FileItem;
}

export interface ViewerState {
  currentSlice: number;
  orientation: "axial" | "sagittal" | "coronal";
  zoom: number;
  panX: number;
  panY: number;
  windowWidth: number;
  windowLevel: number;
  brightness: number;
  contrast: number;
  rotation: number;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
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
  boundingBox: BoundingBox | null;
  brushStrokes: { x: number; y: number }[][];
  showAnnotations: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
}

export const ORGAN_COLORS = {
  liver: [255, 0, 0],
  spleen: [0, 255, 0],
  kidney_right: [0, 0, 255],
  kidney_left: [255, 255, 0],
  gallbladder: [255, 0, 255],
  stomach: [0, 255, 255],
  pancreas: [128, 0, 128],
};

export const AVAILABLE_ORGANS = [
  "liver",
  "spleen",
  "kidney_right",
  "kidney_left",
  "gallbladder",
  "stomach",
  "pancreas",
];
