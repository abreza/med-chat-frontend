import React from "react";
import { Box, Typography } from "@mui/material";
import { UseNiftiViewerResult } from "./hooks/useNiftiViewer";
import ViewConfigControls from "./ViewConfigControls";

type ViewerCanvasProps = { nifti: UseNiftiViewerResult };

export default function ViewerCanvas({ nifti }: ViewerCanvasProps) {
  const {
    canvasRef,
    niftiData,
    viewerState,
    annotationState,
    handleAnnotationMouseDown,
    handleAnnotationMouseMove,
    handleAnnotationMouseUp,
    handleWheel,
    renderSlice,
  } = nifti;

  React.useEffect(renderSlice, [renderSlice]);

  const cursor = React.useMemo(() => {
    if (annotationState.tool === "none")
      return viewerState.isPanning ? "grabbing" : "grab";
    if (annotationState.tool === "box") return "crosshair";
    return 'url("data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" fill="%23ff0000" opacity="0.8"/></svg>") 10 10, auto';
  }, [annotationState.tool, viewerState.isPanning]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "black",
        borderRadius: 1,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {niftiData ? (
        <>
          <canvas
            ref={canvasRef}
            onMouseDown={handleAnnotationMouseDown}
            onMouseMove={handleAnnotationMouseMove}
            onMouseUp={handleAnnotationMouseUp}
            onMouseLeave={handleAnnotationMouseUp}
            onWheel={handleWheel}
            style={{
              cursor,
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
          <ViewConfigControls nifti={nifti} />
        </>
      ) : (
        <Typography color="white">در حال بارگذاری تصویر…</Typography>
      )}
    </Box>
  );
}
