import { useCallback, useRef, useEffect } from "react";
import { ViewerState, AnnotationState } from "./nifti-viewer-types";

interface UseNiftiEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewerState: ViewerState;
  setViewerState: React.Dispatch<React.SetStateAction<ViewerState>>;
  annotationState: AnnotationState;
  setAnnotationState: React.Dispatch<React.SetStateAction<AnnotationState>>;
  sliceDimensions: [number, number];
  originalSliceDimensions: [number, number];
  maxSliceForOrientation: number;
}

export function useNiftiEvents({
  canvasRef,
  viewerState,
  setViewerState,
  annotationState,
  setAnnotationState,
  sliceDimensions,
  originalSliceDimensions,
  maxSliceForOrientation,
}: UseNiftiEventsProps) {
  const lastPan = useRef({ x: 0, y: 0 });

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

  const handleAnnotationMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (annotationState.tool === "none") {
      setViewerState((v) => ({ ...v, isPanning: true }));
      lastPan.current = { x: e.clientX, y: e.clientY };
      return;
    }
    setAnnotationState((s) => ({
      ...s,
      isDrawing: true,
      boundingBox: null,
      brushStrokes: [],
    }));
    const coords = getCanvasCoords(e);
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
      setAnnotationState((s) => ({ ...s, brushStrokes: [[coords]] }));
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
        currentStrokes[currentStrokes.length - 1].push(coords);
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

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        setViewerState((v) => ({
          ...v,
          zoom: Math.max(
            0.1,
            Math.min(10, v.zoom * (e.deltaY > 0 ? 0.95 : 1.05))
          ),
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
    },
    [maxSliceForOrientation, setViewerState]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef, handleWheel]);

  return {
    handleAnnotationMouseDown,
    handleAnnotationMouseMove,
    handleAnnotationMouseUp,
  };
}
