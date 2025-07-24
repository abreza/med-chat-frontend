import React from "react";
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Science as LabIcon,
  Height as XRayIcon,
  Assignment as ReportIcon,
  Image as ImageIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Memory as NiftiIcon,
} from "@mui/icons-material";
import { FileItem } from "./types";

interface FileIconProps {
  file: FileItem;
  isExpanded?: boolean;
}

export default function FileIconComponent({ file, isExpanded }: FileIconProps) {
  if (file.isFolder) {
    return isExpanded ? <FolderOpenIcon /> : <FolderIcon />;
  }

  switch (file.category) {
    case "lab-result":
      return <LabIcon />;
    case "xray":
      return <XRayIcon />;
    case "medical-report":
      return <ReportIcon />;
    case "image":
      return <ImageIcon />;
    case "nifti":
      return <NiftiIcon />;
    default:
      if (file.type.includes("pdf")) return <PdfIcon />;
      return <FileIcon />;
  }
}
