export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category:
    | "medical-report"
    | "lab-result"
    | "image"
    | "xray"
    | "document"
    | "nifti"
    | "other";
  parentId?: string;
  isFolder?: boolean;
  analysis?: FileAnalysis;
  metadata?: NiftiMetadata;
}

export interface NiftiMetadata {
  dimensions: number[];
  pixelSpacing: number[];
  orientation: string;
  dataType: string;
  slices: number;
  acquisitionDate?: string;
  patientInfo?: {
    age?: string;
    sex?: string;
    studyDescription?: string;
  };
}

export interface FileAnalysis {
  id: string;
  fileName: string;
  summary: string;
  keyFindings: string[];
  questions: string[];
  analysisDate: string;
  status: "pending" | "completed" | "error";
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  category: string;
}
