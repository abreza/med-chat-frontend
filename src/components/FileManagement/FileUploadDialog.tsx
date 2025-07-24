import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: () => void;
}

export default function FileUploadDialog({
  open,
  onClose,
  onUpload,
}: FileUploadDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>آپلود فایل جدید</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: "2px dashed",
            borderColor: "primary.main",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: "primary.light",
            color: "primary.main",
            mb: 2,
          }}
        >
          <UploadIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            فایل خود را اینجا بکشید
          </Typography>
          <Typography variant="body2">یا برای انتخاب کلیک کنید</Typography>
        </Box>
        <TextField
          fullWidth
          label="نام فایل (اختیاری)"
          variant="outlined"
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          select
          label="دسته‌بندی فایل"
          variant="outlined"
          sx={{ mt: 2 }}
          SelectProps={{
            native: true,
          }}
        >
          <option value="medical-report">گزارش پزشکی</option>
          <option value="lab-result">نتیجه آزمایش</option>
          <option value="xray">تصاویر رادیولوژی</option>
          <option value="document">سند</option>
          <option value="other">سایر</option>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button variant="contained" onClick={onUpload}>
          آپلود
        </Button>
      </DialogActions>
    </Dialog>
  );
}
