import React from "react";
import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import {
  Visibility as ViewIcon,
  Psychology as AnalyzeIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";

interface FileContextMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onPreview?: () => void;
  fileCategory?: string;
}

export default function FileContextMenu({
  anchorEl,
  open,
  onClose,
  onPreview,
  fileCategory,
}: FileContextMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <ViewIcon fontSize="small" />
        </ListItemIcon>
        مشاهده
      </MenuItem>

      {fileCategory === "nifti" && (
        <MenuItem
          onClick={() => {
            onPreview?.();
            onClose();
          }}
        >
          <ListItemIcon>
            <PreviewIcon fontSize="small" />
          </ListItemIcon>
          پیش‌نمایش NIfTI
        </MenuItem>
      )}

      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <AnalyzeIcon fontSize="small" />
        </ListItemIcon>
        تحلیل فایل
      </MenuItem>
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <DownloadIcon fontSize="small" />
        </ListItemIcon>
        دانلود
      </MenuItem>
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        ویرایش نام
      </MenuItem>
      <Divider />
      <MenuItem onClick={onClose} sx={{ color: "error.main" }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        حذف
      </MenuItem>
    </Menu>
  );
}
