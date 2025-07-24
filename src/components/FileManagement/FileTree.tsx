/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { List } from "@mui/material";
import { FileItem } from "./types";
import FileTreeItem from "./FileTreeItem";

interface FileTreeProps {
  files: FileItem[];
  selectedFiles: string[];
  expandedFolders: string[];
  expandedFileDetails: string[];
  onFileSelect: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onFileDetailsToggle: (fileId: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, fileId: string) => void;
  onQuestionSelect?: (question: string) => void;
  getCategoryColor: (category: string) => any;
  getCategoryLabel: (category: string) => string;
}

export default function FileTree({
  files,
  selectedFiles,
  expandedFolders,
  expandedFileDetails,
  onFileSelect,
  onFolderToggle,
  onFileDetailsToggle,
  onMenuOpen,
  onQuestionSelect,
  getCategoryColor,
  getCategoryLabel,
}: FileTreeProps) {
  const renderFileTreeRecursive = (
    parentId?: string,
    depth: number = 0
  ): React.ReactNode => {
    const filesAtLevel = files.filter((f) => f.parentId === parentId);

    return filesAtLevel.map((file) => {
      const isExpanded = expandedFolders.includes(file.id);
      const isAnalysisExpanded = expandedFileDetails.includes(file.id);
      const isSelected = selectedFiles.includes(file.id);

      return (
        <FileTreeItem
          key={file.id}
          file={file}
          isSelected={isSelected}
          isExpanded={isExpanded}
          isAnalysisExpanded={isAnalysisExpanded}
          onSelect={onFileSelect}
          onToggle={file.isFolder ? onFolderToggle : undefined}
          onAnalysisToggle={onFileDetailsToggle}
          onMenuOpen={onMenuOpen}
          onQuestionSelect={onQuestionSelect}
          getCategoryColor={getCategoryColor}
          getCategoryLabel={getCategoryLabel}
          depth={depth}
        >
          {file.isFolder &&
            isExpanded &&
            renderFileTreeRecursive(file.id, depth + 1)}
        </FileTreeItem>
      );
    });
  };

  return <List>{renderFileTreeRecursive()}</List>;
}
