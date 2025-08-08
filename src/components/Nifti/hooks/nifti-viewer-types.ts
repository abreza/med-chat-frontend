import { NiftiData } from "../utils/niftiLoader";

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

export type MaskImages = Record<string, Record<number, HTMLImageElement>>;
export type FlatMaskImages = Record<number, HTMLImageElement>;

export interface SegmentationState {
  isSegmenting: boolean;
  segmentationProgress: number;
  segmentationStatus: string;
  organMasks: MaskImages | null;
  annotationMasks: FlatMaskImages | null;
  selectedOrgans: string[];
  showOrgans: boolean;
  showAnnotations: boolean;
}

export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
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
  runOrganSegmentation: () => Promise<void>;
  runAnnotationSegmentation: () => Promise<void>;
  handleAnnotationMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleAnnotationMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleAnnotationMouseUp: () => void;
  resetView: () => void;
  rotateView: () => void;
}

export const ORGAN_COLORS: Record<string, [number, number, number]> = {
  liver: [255, 0, 0],
  spleen: [0, 255, 0],
  kidney_right: [0, 0, 255],
  kidney_left: [255, 255, 0],
  gallbladder: [255, 0, 255],
  stomach: [0, 255, 255],
  pancreas: [128, 0, 128],
};
