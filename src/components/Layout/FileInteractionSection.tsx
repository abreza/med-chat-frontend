"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Fab,
  Badge,
  Chip,
  Divider,
} from "@mui/material";
import { Upload as UploadIcon, Chat as ChatIcon } from "@mui/icons-material";
import FileTree from "@/components/FileManagement/FileTree";
import FileUploadDialog from "@/components/FileManagement/FileUploadDialog";
import FileContextMenu from "@/components/FileManagement/FileContextMenu";
import NiftiViewer from "@/components/FileManagement/NiftiViewer";
import ChatArea, { TTSSettings } from "@/components/Chat/ChatArea";
import { FileItem, AttachedFile } from "@/components/FileManagement/types";
import { mockFiles } from "../FileManagement/mockData";

export default function FileInteractionSection() {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    "folder1",
    "folder4",
  ]);
  const [expandedFileDetails, setExpandedFileDetails] = useState<string[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFileForMenu, setSelectedFileForMenu] = useState<string | null>(
    null
  );
  const [niftiViewerOpen, setNiftiViewerOpen] = useState(false);
  const [selectedNiftiFile, setSelectedNiftiFile] = useState<FileItem | null>(
    null
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical-report":
        return "error";
      case "lab-result":
        return "success";
      case "xray":
        return "info";
      case "image":
        return "warning";
      case "nifti":
        return "secondary";
      default:
        return "default";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "medical-report":
        return "گزارش پزشکی";
      case "lab-result":
        return "آزمایش";
      case "xray":
        return "رادیولوژی";
      case "image":
        return "تصویر";
      case "document":
        return "سند";
      case "nifti":
        return "NIfTI";
      default:
        return "سایر";
    }
  };

  const handleFileSelect = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file?.isFolder) return;

    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleFolderToggle = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleFileDetailsToggle = (fileId: string) => {
    setExpandedFileDetails((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    fileId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFileForMenu(fileId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFileForMenu(null);
  };

  const handleNiftiPreview = () => {
    if (selectedFileForMenu) {
      const file = files.find((f) => f.id === selectedFileForMenu);
      if (file && file.category === "nifti") {
        setSelectedNiftiFile(file);
        setNiftiViewerOpen(true);
      }
    }
  };

  const getAttachedFiles = (): AttachedFile[] => {
    return files
      .filter((f) => selectedFiles.includes(f.id) && !f.isFolder)
      .map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        category: f.category,
      }));
  };

  const handleUpload = () => {
    setUploadDialogOpen(false);
  };

  const handleMessageSent = (
    message: string,
    attachedFiles?: AttachedFile[]
  ) => {
    console.log("Message sent:", message, "with files:", attachedFiles);
  };

  const handleTtsSettingsChange = (settings: TTSSettings) => {
    console.log("TTS settings changed:", settings);
  };

  const selectedFileForMenuData = selectedFileForMenu
    ? files.find((f) => f.id === selectedFileForMenu)
    : null;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              مدیریت و تعامل با فایل‌ها
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {files.filter((f) => !f.isFolder).length} فایل در{" "}
              {files.filter((f) => f.isFolder).length} پوشه
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Badge badgeContent={selectedFiles.length} color="primary">
              <Chip
                icon={<ChatIcon />}
                label="انتخاب شده برای چت"
                color={selectedFiles.length > 0 ? "primary" : "default"}
                variant={selectedFiles.length > 0 ? "filled" : "outlined"}
              />
            </Badge>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, overflow: "auto", display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1, maxWidth: 600 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            فایل‌ها و پوشه‌ها
          </Typography>

          {files.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 400,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "grey.300",
                borderRadius: 2,
                color: "text.secondary",
              }}
            >
              <UploadIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                هنوز فایلی آپلود نشده
              </Typography>
              <Typography variant="body2">
                برای شروع، فایل‌های پزشکی خود را آپلود کنید
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: "100%", overflow: "auto" }}>
              <FileTree
                files={files}
                selectedFiles={selectedFiles}
                expandedFolders={expandedFolders}
                expandedFileDetails={expandedFileDetails}
                onFileSelect={handleFileSelect}
                onFolderToggle={handleFolderToggle}
                onFileDetailsToggle={handleFileDetailsToggle}
                onMenuOpen={handleMenuOpen}
                getCategoryColor={getCategoryColor}
                getCategoryLabel={getCategoryLabel}
              />
            </Box>
          )}
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ flex: 1 }}>
          <ChatArea
            attachedFiles={getAttachedFiles()}
            showAttachedFiles={true}
            placeholder={
              selectedFiles.length > 0
                ? `سوال خود را درباره ${selectedFiles.length} فایل انتخابی مطرح کنید...`
                : "ابتدا فایل‌هایی را انتخاب کنید..."
            }
            chatTitle="چت با فایل‌های انتخابی"
            showStartScreen={selectedFiles.length === 0}
            apiEndpoint="/api/chat"
            onMessageSent={handleMessageSent}
            onTtsSettingsChange={handleTtsSettingsChange}
          />
        </Box>
      </Box>

      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          left: 50,
        }}
        onClick={() => setUploadDialogOpen(true)}
      >
        <UploadIcon />
      </Fab>

      <FileContextMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onPreview={handleNiftiPreview}
        fileCategory={selectedFileForMenuData?.category}
      />

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
      />

      {selectedNiftiFile && (
        <NiftiViewer
          open={niftiViewerOpen}
          onClose={() => {
            setNiftiViewerOpen(false);
            setSelectedNiftiFile(null);
          }}
          file={selectedNiftiFile}
        />
      )}
    </Box>
  );
}
