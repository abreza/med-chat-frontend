import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Snackbar,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Navigation as OrientationIcon,
} from "@mui/icons-material";
import { FileItem } from "../FileManagement/types";
import useNiftiViewer from "./hooks/useNiftiViewer";
import ViewerCanvas from "./ViewerCanvas";
import ControlsSidebar from "./ControlsSidebar";

interface Props {
  open: boolean;
  onClose: () => void;
  file: FileItem;
}

export default function NiftiViewer({ open, onClose, file }: Props) {
  const nifti = useNiftiViewer(open, file);

  if (nifti.loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>در حال بارگذاری فایل NIfTI…</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (nifti.error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>خطا در بارگذاری</DialogTitle>
        <DialogContent>
          <Alert severity="error">{nifti.error}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>بستن</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { height: "95vh" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6">{file.name}</Typography>
          <Chip
            label="NIfTI Viewer"
            color="secondary"
            size="small"
            icon={<OrientationIcon />}
          />
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", height: "100%", p: 2, gap: 2 }}>
        <ControlsSidebar nifti={nifti} />
        <ViewerCanvas nifti={nifti} />
      </DialogContent>

      <DialogActions>
        <Typography variant="caption" sx={{ mr: "auto" }}>
          راهنما: Ctrl+چرخ ماوس برای زوم، چرخ ماوس برای تغییر برش
        </Typography>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>

      <Snackbar
        open={nifti.snackbar.open}
        autoHideDuration={6000}
        onClose={() => nifti.setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={nifti.snackbar.severity}
          onClose={() => nifti.setSnackbar((s) => ({ ...s, open: false }))}
        >
          {nifti.snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
