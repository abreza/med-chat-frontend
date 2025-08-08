import { useCallback } from "react";
import { NiftiData } from "../utils/niftiLoader";
import { NiftiLoader } from "../utils/niftiLoader";
import {
  ViewerState,
  SegmentationState,
  AnnotationState,
} from "./nifti-viewer-types";

interface UseNiftiRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  offscreenCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  niftiData: NiftiData | null;
  viewerState: ViewerState;
  segmentationState: SegmentationState;
  annotationState: AnnotationState;
  originalSliceDimensions: [number, number];
  sliceDimensions: [number, number];
}

export function useNiftiRenderer({
  canvasRef,
  offscreenCanvasRef,
  niftiData,
  viewerState,
  segmentationState,
  annotationState,
  originalSliceDimensions,
  sliceDimensions,
}: UseNiftiRendererProps) {
  const applyImageAdjustments = useCallback(
    (data: Float32Array): Uint8ClampedArray => {
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

  const drawMasks = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.globalAlpha = 0.5;

      if (
        segmentationState.showAnnotations &&
        segmentationState.annotationMasks
      ) {
        const maskImg =
          segmentationState.annotationMasks[viewerState.currentSlice];
        if (maskImg) {
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCanvas.width = maskImg.width;
            tempCanvas.height = maskImg.height;
            tempCtx.fillStyle = "rgb(0, 0, 255)"; // Annotation color
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.globalCompositeOperation = "destination-in";
            tempCtx.drawImage(maskImg, 0, 0);
            ctx.drawImage(
              tempCanvas,
              0,
              0,
              originalSliceDimensions[0],
              originalSliceDimensions[1]
            );
          }
        }
      }

      if (segmentationState.showOrgans && segmentationState.organMasks) {
        segmentationState.selectedOrgans.forEach((organ) => {
          const organMasksBySlice = segmentationState.organMasks?.[organ];
          const maskImg = organMasksBySlice?.[viewerState.currentSlice];
          if (maskImg) {
            ctx.drawImage(maskImg, 0, 0);
          }
        });
      }
      ctx.restore();
    },
    [segmentationState, viewerState.currentSlice, originalSliceDimensions]
  );

  const drawAnnotations = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!annotationState.showAnnotations) return;

      if (annotationState.boundingBox) {
        const { xmin, ymin, xmax, ymax } = annotationState.boundingBox;
        ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
        ctx.lineWidth = 1.5 / viewerState.zoom;
        const rect = {
          x: Math.min(xmin, xmax),
          y: Math.min(ymin, ymax),
          w: Math.abs(xmax - xmin),
          h: Math.abs(ymax - ymin),
        };
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }

      if (annotationState.brushStrokes.length > 0) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
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

  const renderSlice = useCallback(() => {
    if (!niftiData || !canvasRef.current) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext("2d", {
      willReadFrequently: true,
    });
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
      const normalized = applyImageAdjustments(sliceData);

      offscreenCanvas.width = originalW;
      offscreenCanvas.height = originalH;
      const imgData = offscreenCtx.createImageData(originalW, originalH);
      for (let i = 0; i < normalized.length; i++) {
        const p = i * 4;
        imgData.data[p] =
          imgData.data[p + 1] =
          imgData.data[p + 2] =
            normalized[i];
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

      drawMasks(mainCtx);
      drawAnnotations(mainCtx);

      mainCtx.restore();
    } catch (e) {
      console.error("Error rendering slice:", e);
    }
  }, [
    niftiData,
    canvasRef,
    offscreenCanvasRef,
    viewerState,
    sliceDimensions,
    originalSliceDimensions,
    applyImageAdjustments,
    drawAnnotations,
    drawMasks,
  ]);

  return { renderSlice };
}
