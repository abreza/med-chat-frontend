/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SegmentationState,
  AnnotationState,
  SnackbarState,
  MaskImages,
  FlatMaskImages,
  ORGAN_COLORS,
  ViewerState,
} from "./nifti-viewer-types";
import { FileItem } from "@/components/FileManagement/types";

interface UseNiftiSegmentationProps {
  rawNiftiBuffer: ArrayBuffer | null;
  file: FileItem;
  viewerState: ViewerState;
  annotationState: AnnotationState;
  setSegmentationState: React.Dispatch<React.SetStateAction<SegmentationState>>;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
  originalSliceDimensions: [number, number];
}

const createBrushMaskBlob = async (
  strokes: { x: number; y: number }[][],
  width: number,
  height: number
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context for mask");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  strokes.forEach((path) => {
    if (path.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create mask blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
};

const createFlippedImage = (
  img: HTMLImageElement,
  w: number,
  h: number
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tempCtx)
      return reject(new Error("Could not create temp canvas for flipping"));
    tempCtx.drawImage(img, 0, 0, w, h);
    const srcImageData = tempCtx.getImageData(0, 0, w, h);
    const srcData = srcImageData.data;

    const flippedCanvas = document.createElement("canvas");
    flippedCanvas.width = w;
    flippedCanvas.height = h;
    const flippedCtx = flippedCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!flippedCtx)
      return reject(new Error("Could not create canvas context for flipping"));
    const destImageData = flippedCtx.createImageData(w, h);
    const destData = destImageData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const destIndex = (y * w + x) * 4;
        const srcIndex = (x * w + y) * 4;
        destData[destIndex] = srcData[srcIndex];
        destData[destIndex + 1] = srcData[srcIndex + 1];
        destData[destIndex + 2] = srcData[srcIndex + 2];
        destData[destIndex + 3] = srcData[srcIndex + 3];
      }
    }
    flippedCtx.putImageData(destImageData, 0, 0);

    const flippedImg = new Image();
    flippedImg.onload = () => resolve(flippedImg);
    flippedImg.onerror = () =>
      reject(new Error("Failed to create flipped image"));
    flippedImg.src = flippedCanvas.toDataURL("image/png");
  });
};

export function useNiftiSegmentation({
  rawNiftiBuffer,
  file,
  viewerState,
  annotationState,
  setSegmentationState,
  setSnackbar,
  originalSliceDimensions,
}: UseNiftiSegmentationProps) {
  const runOrganSegmentation = async () => {
    if (!rawNiftiBuffer) {
      setSnackbar({
        open: true,
        message: "فایل NIfTI بارگذاری نشده است.",
        severity: "error",
      });
      return;
    }
    setSegmentationState((s) => ({
      ...s,
      isSegmenting: true,
      segmentationProgress: 10,
      segmentationStatus: "در حال آپلود فایل...",
      organMasks: null,
    }));
    try {
      const formData = new FormData();
      const niftiBlob = new Blob([rawNiftiBuffer], {
        type: "application/octet-stream",
      });
      formData.append("file", niftiBlob, file.name);

      const response = await fetch("/api/segment", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ارتباط با سرور سگمنتیشن");
      }
      setSegmentationState((s) => ({
        ...s,
        segmentationProgress: 50,
        segmentationStatus: "پاسخ دریافت شد، در حال پردازش ماسک‌ها...",
      }));

      const fileNameKey = file.name.replace(".nii.gz", "").replace(".nii", "");
      const masksData = result["masks"][fileNameKey];
      if (!masksData) {
        throw new Error("ساختار پاسخ از سرور نامعتبر است.");
      }

      const loadedMasks: MaskImages = {};
      const promises: Promise<void>[] = [];
      const [w, h] = originalSliceDimensions;

      for (const organ in masksData) {
        loadedMasks[organ] = {};
        for (const sliceFile in masksData[organ]) {
          const sliceIndex = parseInt(
            sliceFile.match(/slice_(\d+)/)?.[1] ?? "-1"
          );
          if (sliceIndex === -1) continue;

          const img = new Image();
          img.src = masksData[organ][sliceFile];

          promises.push(
            new Promise<void>((resolve, reject) => {
              img.onload = async () => {
                try {
                  const flippedImg = await createFlippedImage(img, w, h);
                  const canvas = document.createElement("canvas");
                  canvas.width = w;
                  canvas.height = h;
                  const ctx = canvas.getContext("2d", {
                    willReadFrequently: true,
                  });
                  if (!ctx)
                    return reject(new Error("Could not create canvas context"));

                  ctx.imageSmoothingEnabled = false;
                  ctx.drawImage(flippedImg, 0, 0, w, h);
                  const imageData = ctx.getImageData(0, 0, w, h);
                  const data = imageData.data;
                  const color = ORGAN_COLORS[organ] || [255, 255, 255];

                  for (let i = 0; i < data.length; i += 4) {
                    const intensity = data[i];
                    if (intensity < 128) {
                      data[i + 3] = 0; // Transparent
                    } else {
                      data[i] = color[0];
                      data[i + 1] = color[1];
                      data[i + 2] = color[2];
                      data[i + 3] = 255; // Opaque
                    }
                  }
                  ctx.putImageData(imageData, 0, 0);

                  const processedImg = new Image();
                  processedImg.onload = () => {
                    loadedMasks[organ][sliceIndex] = processedImg;
                    resolve();
                  };
                  processedImg.onerror = () =>
                    reject(new Error(`Failed to convert canvas for ${organ}`));
                  processedImg.src = canvas.toDataURL("image/png");
                } catch (err) {
                  reject(err);
                }
              };
              img.onerror = () =>
                reject(new Error(`Failed to load mask for ${organ}`));
            })
          );
        }
      }

      await Promise.all(promises);
      setSegmentationState((s) => ({
        ...s,
        isSegmenting: false,
        segmentationProgress: 100,
        organMasks: loadedMasks,
      }));
      setSnackbar({
        open: true,
        message: "سگمنتیشن ارگان‌ها با موفقیت انجام شد.",
        severity: "success",
      });
    } catch (e: any) {
      console.error("Segmentation failed:", e);
      setSnackbar({
        open: true,
        message: `خطا در سگمنتیشن: ${e.message}`,
        severity: "error",
      });
      setSegmentationState((s) => ({ ...s, isSegmenting: false }));
    }
  };

  const runAnnotationSegmentation = async () => {
    if (!rawNiftiBuffer) {
      setSnackbar({
        open: true,
        message: "فایل NIfTI بارگذاری نشده است.",
        severity: "error",
      });
      return;
    }
    if (annotationState.tool === "box" && !annotationState.boundingBox) {
      setSnackbar({
        open: true,
        message: "لطفا یک bounding box بکشید.",
        severity: "error",
      });
      return;
    }
    if (
      annotationState.tool === "brush" &&
      annotationState.brushStrokes.length === 0
    ) {
      setSnackbar({
        open: true,
        message: "لطفا با براش نقاشی کنید.",
        severity: "error",
      });
      return;
    }
    setSegmentationState((s) => ({
      ...s,
      isSegmenting: true,
      segmentationProgress: 10,
      segmentationStatus: "در حال آماده‌سازی و آپلود...",
    }));
    try {
      const formData = new FormData();
      const niftiBlob = new Blob([rawNiftiBuffer], {
        type: "application/octet-stream",
      });
      formData.append("file", niftiBlob, file.name);
      formData.append("slice_idx", viewerState.currentSlice.toString());
      formData.append("tool", annotationState.tool);

      if (annotationState.tool === "box" && annotationState.boundingBox) {
        const box = annotationState.boundingBox;
        const orderedBox = {
          xmin: Math.min(box.xmin, box.xmax),
          ymin: Math.min(box.ymin, box.ymax),
          xmax: Math.max(box.xmin, box.xmax),
          ymax: Math.max(box.ymin, box.ymax),
        };
        formData.append("box", JSON.stringify(orderedBox));
      } else if (annotationState.tool === "brush") {
        const [w, h] = originalSliceDimensions;
        const brushBlob = await createBrushMaskBlob(
          annotationState.brushStrokes,
          w,
          h
        );
        formData.append("image", brushBlob, "brush_mask.png");
      }

      const response = await fetch("/api/annotate-segment", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "خطا در ارتباط با سرور MedSAM2");
      }
      setSegmentationState((s) => ({
        ...s,
        segmentationProgress: 50,
        segmentationStatus: "پاسخ دریافت شد، در حال پردازش ماسک‌ها...",
      }));

      const result = await response.json();
      const loadedMasks: FlatMaskImages = {};
      const promises: Promise<void>[] = [];
      const [w, h] = originalSliceDimensions;

      for (const sliceFile in result.masks) {
        const sliceIndex = parseInt(
          sliceFile.match(/slice_(\d+)/)?.[1] ?? "-1"
        );
        if (sliceIndex === -1) continue;
        const img = new Image();
        img.src = result.masks[sliceFile];
        promises.push(
          new Promise<void>((resolve, reject) => {
            img.onload = async () => {
              try {
                const flippedImg = await createFlippedImage(img, w, h);
                loadedMasks[sliceIndex] = flippedImg;
                resolve();
              } catch (err) {
                reject(err);
              }
            };
            img.onerror = () =>
              reject(new Error("Failed to load annotation mask"));
          })
        );
      }
      await Promise.all(promises);
      setSegmentationState((s) => ({
        ...s,
        isSegmenting: false,
        segmentationProgress: 100,
        annotationMasks: loadedMasks,
      }));
      setSnackbar({
        open: true,
        message: "سگمنتیشن با MedSAM2 موفقیت‌آمیز بود.",
        severity: "success",
      });
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: `خطا: ${e.message}`,
        severity: "error",
      });
      setSegmentationState((s) => ({ ...s, isSegmenting: false }));
    }
  };

  return { runOrganSegmentation, runAnnotationSegmentation };
}
